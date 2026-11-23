import "server-only";
import { EMAIL_TEMPLATES, renderUrbanStoriesEmail, type EmailData, type EmailTemplateKey } from "./templates";

export async function sendUrbanStoriesEmail(input: { to: string; template: EmailTemplateKey; data?: EmailData; idempotencyKey?: string; subject?: string }) {
  if (!input.to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.to)) return { sent:false as const, reason:"invalid_recipient" };
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!key || !from) {
    console.warn("Urban Stories email skipped: Resend API key or sender address is not configured.", { template:input.template });
    return { sent:false as const, reason:"email_not_configured" };
  }
  const rendered = renderUrbanStoriesEmail(input.template, input.data);
  const { Resend } = await import("resend");
  const result = await new Resend(key).emails.send({ from, to:[input.to], subject:input.subject || rendered.subject, html:rendered.html, text:rendered.subject + "\n\n" + String(input.data?.message || input.data?.feedback || "Stories Beyond Boundaries."), ...(input.idempotencyKey ? { headers:{"Idempotency-Key":input.idempotencyKey} } : {}) });
  if (result.error) {
    console.error("Urban Stories email delivery failed", { template:input.template, message:result.error.message });
    throw new Error("Email delivery failed");
  }
  console.info("Urban Stories email accepted by Resend", { template:input.template, emailId:result.data?.id });
  return { sent:true as const, id:result.data?.id };
}

export async function sendCommunityEmail(input: { to:string; subject:string; heading:string; message:string; actionUrl?:string; actionLabel?:string }) {
  const subject = input.subject.toLowerCase();
  let template: EmailTemplateKey = "supportResponse";
  if (subject.includes("contributor application is approved")) template = "contributorApplicationApproved";
  else if (subject.includes("update on your urban stories application")) template = "contributorApplicationRejected";
  else if (subject.includes("article submitted")) template = "newArticleSubmission";
  else if (subject.includes("article was")) {
    if (subject.includes("approved")) template = "articleApproved";
    else if (subject.includes("needs changes")) template = "articleChangesRequested";
    else if (subject.includes("not accepted")) template = "articleRejected";
    else if (subject.includes("unpublished")) template = "articleUnpublished";
    else if (subject.includes("published")) template = "articlePublished";
  }
  return sendUrbanStoriesEmail({ to:input.to, template, subject:input.subject, data:{ message:input.message, actionUrl:input.actionUrl, actionLabel:input.actionLabel, name:input.heading } });
}
