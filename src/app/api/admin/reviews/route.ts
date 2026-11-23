import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserAccess } from "@/lib/auth/roles";
import { clerkClient } from "@clerk/nextjs/server";
import { getWriteClient } from "@/lib/sanity/write-client";
import { apiError } from "@/lib/community/http";
import { sendCommunityEmail } from "@/lib/email/community";

const updateSchema = z.object({ id: z.string().min(1), action: z.enum(["approve", "requestChanges", "reject", "publish", "unpublish"]), feedback: z.string().max(3000).optional() });
const applicationSchema = z.object({ applicationId: z.string().min(1), action: z.enum(["approve", "reject", "suspend", "restore"]) });
export async function GET() {
  try {
    const access = await getUserAccess();
    if (!access.userId) throw new Error("UNAUTHENTICATED");
    if (access.role !== "admin") throw new Error("FORBIDDEN");
    const client = getWriteClient();
    const [articles, applications] = await Promise.all([
      client.fetch('*[_type=="article"]|order(_updatedAt desc){_id,title,submissionStatus,status,submittedAt,_updatedAt,"authorName":author->name,"email":author->email,"clerkUserId":contributorClerkUserId}', {}),
      client.fetch('*[_type=="contributorApplication"]|order(submittedAt desc){_id,fullName,email,interests,status,submittedAt,clerkUserId}', {}),
    ]);
    return NextResponse.json({ articles, applications });
  } catch (error) { return apiError(error); }
}
export async function PATCH(request: NextRequest) {
  try {
    const access = await getUserAccess();
    if (!access.userId) throw new Error("UNAUTHENTICATED");
    if (access.role !== "admin") throw new Error("FORBIDDEN");
    const payload = await request.json();
    if (payload.applicationId) {
      const applicationData = applicationSchema.parse(payload);
      const client = getWriteClient();
      const application = await client.fetch('*[_type=="contributorApplication" && _id==$id][0]{_id,fullName,email,clerkUserId}', { id: applicationData.applicationId });
      if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });
      const clerk = await clerkClient();
      if (applicationData.action === "approve") {
        await clerk.users.updateUserMetadata(application.clerkUserId, { privateMetadata: { urbanStoriesRole: "contributor", urbanStoriesSuspended: false } });
        await client.patch(applicationData.applicationId).set({ status: "approved", reviewedAt: new Date().toISOString(), reviewedBy: access.userId }).commit();
        if (application.email) await sendCommunityEmail({ to: application.email, subject: "Your Urban Stories contributor application is approved", heading: "Welcome to Urban Stories", message: `Hi ${application.fullName}, your contributor application has been approved. You can now access your contributor dashboard.` });
      } else if (applicationData.action === "reject") {
        await client.patch(applicationData.applicationId).set({ status: "rejected", reviewedAt: new Date().toISOString(), reviewedBy: access.userId }).commit();
        if (application.email) await sendCommunityEmail({ to: application.email, subject: "An update on your Urban Stories application", heading: "Application update", message: `Hi ${application.fullName}, thank you for applying. We are unable to approve your application at this time.` });
      } else {
        await clerk.users.updateUserMetadata(application.clerkUserId, { privateMetadata: { urbanStoriesRole: "contributor", urbanStoriesSuspended: applicationData.action === "suspend" } });
      }
      return NextResponse.json({ success: true, action: applicationData.action });
    }
    const data = updateSchema.parse(payload);
    const client = getWriteClient();
    const article = await client.fetch('*[_type=="article" && _id==$id][0]{_id,title,author->{name,email}}', { id: data.id });
    if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { reviewedAt: now, reviewedBy: access.userId };
    if (data.action === "approve") patch.submissionStatus = "approved";
    if (data.action === "requestChanges") { patch.submissionStatus = "changesRequested"; patch.editorialFeedback = data.feedback || "Please revise and resubmit."; }
    if (data.action === "reject") { patch.submissionStatus = "rejected"; patch.editorialFeedback = data.feedback || "Your submission was not accepted."; }
    if (data.action === "publish") { patch.submissionStatus = "published"; patch.status = "published"; patch.publishedAt = now; }
    if (data.action === "unpublish") { patch.submissionStatus = "approved"; patch.status = "draft"; }
    await client.patch(data.id).set(patch).commit();
    if (article.author?.email) {
      const labels = { approve: "approved", requestChanges: "needs changes", reject: "not accepted", publish: "published", unpublish: "unpublished" };
      await sendCommunityEmail({ to: article.author.email, subject: `Your Urban Stories article was ${labels[data.action]}`, heading: "An update on your article", message: `“${article.title}” was ${labels[data.action]} by the editorial team.${data.feedback ? ` Feedback: ${data.feedback}` : ""}` });
    }
    return NextResponse.json({ success: true, action: data.action });
  } catch (error) { return apiError(error); }
}
