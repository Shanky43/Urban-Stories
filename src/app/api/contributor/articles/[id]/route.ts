import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserAccess } from "@/lib/auth/roles";
import { getWriteClient } from "@/lib/sanity/write-client";
import { apiError } from "@/lib/community/http";

const schema = z.object({
  title: z.string().trim().min(3).max(120),
  excerpt: z.string().trim().min(20).max(240),
  categoryId: z.string().min(1),
  body: z.string().trim().min(100).max(50000),
  status: z.enum(["draft", "pendingReview"]),
});

function toPortableText(value: string) {
  return value.split(/\n\s*\n/).filter(Boolean).map((text, index) => ({
    _type: "block",
    _key: `b${index}`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `s${index}`, text, marks: [] }],
  }));
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const access = await getUserAccess();
    if (!access.userId) throw new Error("UNAUTHENTICATED");
    if (!["contributor", "admin"].includes(access.role)) throw new Error("FORBIDDEN");
    const { id } = await params;
    const data = schema.parse(await request.json());
    const client = getWriteClient();
    const current = await client.fetch(
      '*[_type == "article" && _id == $id][0]{_id, contributorClerkUserId, submissionStatus, status}',
      { id },
    );
    if (!current) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    const isAdmin = access.role === "admin";
    if (!isAdmin && current.contributorClerkUserId !== access.userId) throw new Error("FORBIDDEN");
    const currentStatus = current.submissionStatus || current.status;
    if (!isAdmin && !["draft", "changesRequested", "rejected"].includes(currentStatus)) {
      return NextResponse.json({ error: "This article can no longer be edited while it is under review or published." }, { status: 409 });
    }
    const category = await client.fetch('*[_type == "category" && _id == $id][0]._id', { id: data.categoryId });
    if (!category) return NextResponse.json({ error: "Choose a valid category" }, { status: 400 });
    const slug = data.title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 96);
    const submissionStatus = data.status === "pendingReview" ? "pendingReview" : "draft";
    const patch = client.patch(id).set({
      title: data.title,
      slug: { _type: "slug", current: slug },
      excerpt: data.excerpt,
      primaryCategory: { _type: "reference", _ref: category },
      body: toPortableText(data.body),
      submissionStatus,
      status: "draft",
      ...(submissionStatus === "pendingReview" ? { submittedAt: new Date().toISOString() } : {}),
    });
    await patch.commit();
    return NextResponse.json({ article: { _id: id, submissionStatus } });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const access = await getUserAccess();
    if (!access.userId) throw new Error("UNAUTHENTICATED");
    if (!["contributor", "admin"].includes(access.role)) throw new Error("FORBIDDEN");
    const { id } = await params;
    const client = getWriteClient();
    const current = await client.fetch(
      '*[_type == "article" && _id == $id][0]{_id, contributorClerkUserId, submissionStatus, status}',
      { id },
    );
    if (!current) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    if (access.role !== "admin") {
      if (current.contributorClerkUserId !== access.userId) throw new Error("FORBIDDEN");
      if (!["draft", "changesRequested", "rejected"].includes(current.submissionStatus || current.status)) {
        return NextResponse.json({ error: "Only drafts or returned articles can be deleted." }, { status: 409 });
      }
    }
    await client.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
