import { NextResponse } from "next/server";
import { getUserAccess } from "@/lib/auth/roles";
import { getWriteClient } from "@/lib/sanity/write-client";
import { apiError } from "@/lib/community/http";
export async function GET() {
  try {
    const access = await getUserAccess();
    if (!access.userId) throw new Error("UNAUTHENTICATED");
    if (!["contributor", "admin"].includes(access.role)) throw new Error("FORBIDDEN");
    const client = getWriteClient();
    const filter = access.role === "admin" ? '*[_type=="article"]' : '*[_type=="article" && contributorClerkUserId==$id]';
    const articles = await client.fetch(`${filter}|order(_updatedAt desc){_id,title,submissionStatus,status,submittedAt,_updatedAt,editorialFeedback,"category":primaryCategory->title}`, { id: access.userId });
    return NextResponse.json({ articles });
  } catch (error) { return apiError(error); }
}
