import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserAccess } from "@/lib/auth/roles";
import { getWriteClient } from "@/lib/sanity/write-client";
import { apiError } from "@/lib/community/http";

const blockSchema = z.object({
  _type: z.literal("block"), _key: z.string(), style: z.enum(["normal", "h1", "h2", "h3", "blockquote"]),
  markDefs: z.array(z.object({ _key: z.string(), _type: z.literal("link"), href: z.string().url() })).default([]),
  children: z.array(z.object({ _type: z.literal("span"), _key: z.string(), text: z.string().max(10000), marks: z.array(z.string()) })).min(1),
});
const bodySchema = z.array(z.union([blockSchema, z.object({ _type: z.literal("image"), _key: z.string(), asset: z.object({ _type: z.literal("reference"), _ref: z.string() }), alt: z.string().min(1).max(200), caption: z.string().max(300).optional() })])).min(1).max(500);
const schema = z.object({ title: z.string().trim().max(120).default(""), excerpt: z.string().trim().max(240).default(""), categoryId: z.string().optional().default(""), body: z.array(z.union([blockSchema, z.object({ _type: z.literal("image"), _key: z.string(), asset: z.object({ _type: z.literal("reference"), _ref: z.string() }), alt: z.string().min(1).max(200), caption: z.string().max(300).optional() })])).max(500).default([]), featuredImage: z.object({ assetId: z.string().min(1), alt: z.string().trim().min(3).max(200), caption: z.string().max(300).optional() }).nullable().optional(), status: z.enum(["draft", "pendingReview"]) }).superRefine((data, ctx) => { if (data.status === "pendingReview") { if (data.title.length < 3) ctx.addIssue({ code: "custom", path: ["title"], message: "Title must be at least 3 characters." }); if (data.excerpt.length < 20) ctx.addIssue({ code: "custom", path: ["excerpt"], message: "Description must be at least 20 characters." }); if (!data.categoryId) ctx.addIssue({ code: "custom", path: ["categoryId"], message: "Choose a category." }); if (!data.featuredImage) ctx.addIssue({ code: "custom", path: ["featuredImage"], message: "Add a featured image." }); if (data.body.length === 0) ctx.addIssue({ code: "custom", path: ["body"], message: "Add article content." }); } });

export async function GET() {
  try {
    const access = await getUserAccess();
    if (!access.userId) throw new Error("UNAUTHENTICATED");
    if (!["contributor", "admin"].includes(access.role)) throw new Error("FORBIDDEN");
    const client = getWriteClient();
    const filter = access.role === "admin" ? '*[_type=="article"]' : '*[_type=="article" && contributorClerkUserId==$id]';
    const articles = await client.fetch(`${filter}|order(_updatedAt desc){_id,title,excerpt,submissionStatus,status,submittedAt,_updatedAt,reviewFeedback,editorialFeedback,featuredImage{asset->{_id,url},alt,caption},"category":primaryCategory->{_id,title}}`, { id: access.userId });
    return NextResponse.json({ articles });
  } catch (error) { return apiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const access = await getUserAccess();
    if (!access.userId) throw new Error("UNAUTHENTICATED");
    if (access.role !== "contributor") throw new Error("FORBIDDEN");
    const data = schema.parse(await request.json());

    const client = getWriteClient();
    const [category, authorId] = await Promise.all([
      data.categoryId ? client.fetch('*[_type=="category" && _id==$id][0]._id', { id: data.categoryId }) : Promise.resolve(null),
      client.fetch('*[_type=="author" && clerkUserId==$id][0]._id', { id: access.userId }),
    ]);
    if (data.categoryId && !category) return NextResponse.json({ error: "Choose a valid category." }, { status: 400 });
    if (!authorId) return NextResponse.json({ error: "Your author profile has not been created yet. Contact the editor." }, { status: 409 });
    if (data.featuredImage) {
      const asset = await client.fetch('*[_type=="sanity.imageAsset" && _id==$id][0]._id', { id: data.featuredImage.assetId });
      if (!asset) return NextResponse.json({ error: "The uploaded image could not be verified." }, { status: 400 });
    }
    const title = data.title || "Untitled draft";
    const slug = title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
    const doc = await client.create({ _type: "article", title, slug: { _type: "slug", current: `${slug}-${Date.now().toString(36)}` }, excerpt: data.excerpt, ...(data.featuredImage ? { featuredImage: { _type: "image", asset: { _type: "reference", _ref: data.featuredImage.assetId }, alt: data.featuredImage.alt, caption: data.featuredImage.caption || "" } } : {}), ...(category ? { primaryCategory: { _type: "reference", _ref: category } } : {}), author: { _type: "reference", _ref: authorId }, body: data.body, contributorClerkUserId: access.userId, status: data.status, submissionStatus: data.status, ...(data.status === "pendingReview" ? { submittedAt: new Date().toISOString() } : {}), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    return NextResponse.json({ article: doc }, { status: 201 });
  } catch (error) { return apiError(error); }
}
