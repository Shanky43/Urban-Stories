import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserAccess } from "@/lib/auth/roles";
import { getWriteClient } from "@/lib/sanity/write-client";
import { apiError } from "@/lib/community/http";
import { sendCommunityEmail } from "@/lib/email/community";

const schema = z.object({
  fullName: z.string().trim().min(2).max(100),
  biography: z.string().trim().min(30).max(1200),
  interests: z.array(z.string().trim().min(1).max(50)).min(1).max(12),
  experience: z.string().trim().min(20).max(1500),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  motivation: z.string().trim().min(30).max(2000),
});

export async function POST(request: NextRequest) {
  try {
    const access = await getUserAccess();
    if (!access.userId || !access.profile) throw new Error("UNAUTHENTICATED");
    if (access.role !== "reader") throw new Error("FORBIDDEN");
    const data = schema.parse(await request.json());
    const client = getWriteClient();
    const existing = await client.fetch('*[_type=="contributorApplication" && clerkUserId==$id && status in ["pending","approved"]][0]{_id,status}', { id: access.userId });
    if (existing) return NextResponse.json({ application: existing }, { status: 409 });
    const email = access.profile.emailAddresses.find((item) => item.id === access.profile.primaryEmailAddressId)?.emailAddress;
    const doc = await client.create({ _type: "contributorApplication", ...data, clerkUserId: access.userId, email, status: "pending", submittedAt: new Date().toISOString() });
    const adminEmail = process.env.URBAN_STORIES_ADMIN_EMAIL;
    if (adminEmail) await sendCommunityEmail({ to: adminEmail, subject: "New Urban Stories contributor application", heading: "A new contributor application", message: `${data.fullName} has applied to contribute. Interests: ${data.interests.join(", ")}. Application reference: ${doc._id}.`, actionUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin`, actionLabel: "Review application" });
    return NextResponse.json({ application: { _id: doc._id, status: "pending" } }, { status: 201 });
  } catch (error) { return apiError(error); }
}
