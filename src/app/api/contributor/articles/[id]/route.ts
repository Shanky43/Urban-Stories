import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserAccess } from "@/lib/auth/roles";
import { getWriteClient } from "@/lib/sanity/write-client";
import { apiError } from "@/lib/community/http";

const blockSchema = z.object({ _type: z.literal("block"), _key: z.string(), style: z.enum(["normal", "h2", "h3", "h4", "blockquote"]), listItem: z.enum(["bullet", "number"]).optional(), level: z.number().int().min(1).max(5).optional(), markDefs: z.array(z.object({ _key: z.string(), _type: z.literal("link"), href: z.string().url() })).default([]), children: z.array(z.object({ _type: z.literal("span"), _key: z.string(), text: z.string().max(10000), marks: z.array(z.string()) })).min(1) });
const bodySchema = z.array(z.union([blockSchema, z.object({ _type: z.literal("image"), _key: z.string(), asset: z.object({ _type: z.literal("reference"), _ref: z.string() }), alt: z.string().min(1).max(200), caption: z.string().max(300).optional() })])).min(1).max(500);
const schema = z.object({ title: z.string().trim().max(120).default(""), excerpt: z.string().trim().max(240).default(""), categoryId: z.string().optional().default(""), body: z.array(z.union([blockSchema, z.object({ _type: z.literal("image"), _key: z.string(), asset: z.object({ _type: z.literal("reference"), _ref: z.string() }), alt: z.string().min(1).max(200), caption: z.string().max(300).optional() })])).max(500).default([]), featuredImage: z.object({ assetId: z.string().min(1), alt: z.string().trim().min(3).max(200), caption: z.string().max(300).optional() }).nullable().optional(), status: z.enum(["draft", "pendingReview"]) }).superRefine((data, ctx) => { if (data.status === "pendingReview") { if (data.title.length < 3) ctx.addIssue({ code: "custom", path: ["title"], message: "Title must be at least 3 characters." }); if (data.excerpt.length < 20) ctx.addIssue({ code: "custom", path: ["excerpt"], message: "Description must be at least 20 characters." }); if (!data.categoryId) ctx.addIssue({ code: "custom", path: ["categoryId"], message: "Choose a category." }); if (!data.featuredImage) ctx.addIssue({ code: "custom", path: ["featuredImage"], message: "Add a featured image." }); if (data.body.length === 0) ctx.addIssue({ code: "custom", path: ["body"], message: "Add article content." }); } });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const access = await getUserAccess();
    if (!access.userId) throw new Error("UNAUTHENTICATED");
    if (access.role !== "contributor") throw new Error("FORBIDDEN");
    const { id } = await params;
    const data = schema.parse(await request.json());
    const client = getWriteClient();
    const current = await client.fetch('*[_type=="article" && _id==$id][0]{_id,contributorClerkUserId,submissionStatus,status}', { id });
    if (!current) return NextResponse.json({ error: "Article not found." }, { status: 404 });
    if (current.contributorClerkUserId !== access.userId) throw new Error("FORBIDDEN");
    const currentStatus = current.submissionStatus || current.status;
    if (!["draft", "changesRequested", "rejected"].includes(currentStatus)) return NextResponse.json({ error: "This article can no longer be edited while it is under review or published." }, { status: 409 });
    const [category, asset] = await Promise.all([
      data.categoryId ? client.fetch('*[_type=="category" && _id==$id][0]._id', { id: data.categoryId }) : Promise.resolve(null),
      data.featuredImage ? client.fetch('*[_type=="sanity.imageAsset" && _id==$id][0]._id', { id: data.featuredImage.assetId }) : Promise.resolve(null),
    ]);
    if (data.categoryId && !category) return NextResponse.json({ error: "Choose a valid category." }, { status: 400 });
    if (data.featuredImage && !asset) return NextResponse.json({ error: "The uploaded image could not be verified." }, { status: 400 });

    const title = data.title || "Untitled draft";
    const slug = title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
    const article = await client.patch(id).set({ title, slug: { _type: "slug", current: `${slug}-${id.slice(-6)}` }, excerpt: data.excerpt, body: data.body, ...(category ? { primaryCategory: { _type: "reference", _ref: category } } : {}), ...(data.featuredImage ? { featuredImage: { _type: "image", asset: { _type: "reference", _ref: data.featuredImage.assetId }, alt: data.featuredImage.alt, caption: data.featuredImage.caption || "" } } : {}), status: data.status, submissionStatus: data.status, submittedAt: data.status === "pendingReview" ? new Date().toISOString() : null, updatedAt: new Date().toISOString(), ...(data.status === "pendingReview" ? { reviewFeedback: null } : {}) }).commit();
    return NextResponse.json({ article });
  } catch (error) { return apiError(error); }
}
