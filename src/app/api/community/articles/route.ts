import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserAccess } from "@/lib/auth/roles";
import { getWriteClient } from "@/lib/sanity/write-client";
import { apiError } from "@/lib/community/http";
import { sendUrbanStoriesEmail } from "@/lib/email/community";

const schema = z.object({ title: z.string().trim().min(3).max(120), excerpt: z.string().trim().min(20).max(240), categoryId: z.string().min(1), body: z.string().trim().min(100).max(50000), status: z.enum(["draft", "pendingReview"]) });
export async function POST(request: NextRequest) {
  try {
    const access = await getUserAccess();
    if (!access.userId) throw new Error("UNAUTHENTICATED");
    if (!["contributor", "admin"].includes(access.role)) throw new Error("FORBIDDEN");
    const data = schema.parse(await request.json());
    const client = getWriteClient();
    const category = await client.fetch('*[_type=="category" && _id==$id][0]{_id}', { id: data.categoryId });
    if (!category) return NextResponse.json({ error: "Choose a valid category" }, { status: 400 });
    const authorId = await client.fetch('*[_type=="author" && clerkUserId==$id][0]._id', { id: access.userId });
    if (!authorId) return NextResponse.json({ error: "Your author profile has not been created yet. Contact the editor." }, { status: 409 });
    const blocks = data.body.split(/\n\s*\n/).filter(Boolean).map((text, index) => ({ _type: "block", _key: `b${index}`, style: "normal", markDefs: [], children: [{ _type: "span", _key: `s${index}`, text, marks: [] }] }));
    const doc = await client.create({ _type: "article", title: data.title, slug: { _type: "slug", current: data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }, excerpt: data.excerpt, primaryCategory: { _type: "reference", _ref: data.categoryId }, author: { _type: "reference", _ref: authorId }, body: blocks, contributorClerkUserId: access.userId, submissionStatus: data.status, status: "draft", submittedAt: data.status === "pendingReview" ? new Date().toISOString() : undefined });
    if (data.status === "pendingReview") {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://urbanstories.vercel.app";
      const contributor = await client.fetch('*[_type=="author" && _id==$id][0]{name,email}', { id: authorId });
      if (contributor?.email) await sendUrbanStoriesEmail({ to: contributor.email, template: "articleSubmitted", data: { name: contributor.name, articleTitle: data.title, submittedAt: new Date().toLocaleDateString("en-IN"), actionUrl: siteUrl + "/contributor/dashboard" }, idempotencyKey: "article-submitted-" + doc._id });
      if (process.env.URBAN_STORIES_ADMIN_EMAIL) await sendUrbanStoriesEmail({ to: process.env.URBAN_STORIES_ADMIN_EMAIL, template: "newArticleSubmission", data: { articleTitle: data.title, category: "Editorial review", excerpt: data.excerpt, contributorName: contributor?.name || "Contributor", contributorEmail: contributor?.email || "", submittedAt: new Date().toLocaleDateString("en-IN"), actionUrl: siteUrl + "/admin" }, idempotencyKey: "article-review-" + doc._id });
    }
    return NextResponse.json({ id: doc._id, status: data.status }, { status: 201 });
  } catch (error) { return apiError(error); }
}
