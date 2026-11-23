import { NextRequest, NextResponse } from "next/server";
import { getUserAccess } from "@/lib/auth/roles";
import { getWriteClient } from "@/lib/sanity/write-client";
import { apiError } from "@/lib/community/http";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export async function POST(request: NextRequest) {
  try {
    const access = await getUserAccess();
    if (!access.userId || access.role !== "contributor") throw new Error(access.userId ? "FORBIDDEN" : "UNAUTHENTICATED");
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "Use a JPG, PNG, WebP or AVIF image." }, { status: 415 });
    if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: "Images must be smaller than 8 MB." }, { status: 413 });
    const client = getWriteClient();
    const asset = await client.assets.upload("image", Buffer.from(await file.arrayBuffer()), { filename: file.name.slice(0, 120), contentType: file.type });
    return NextResponse.json({ asset: { _id: asset._id, url: asset.url } }, { status: 201 });
  } catch (error) { return apiError(error); }
}
