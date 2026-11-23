import "server-only";

export const EMAIL_TEMPLATES = {
  emailVerification: ["Verify your email address – Urban Stories", "Verify Your Email Address", "Please verify your email address to complete your registration and start exploring Urban Stories.", "Verify Email Address"],
  passwordReset: ["Reset your password – Urban Stories", "Reset Your Password", "A password reset was requested for your Urban Stories account. Use the secure link below to choose a new password.", "Reset Your Password"],
  welcome: ["Welcome to Urban Stories!", "Welcome to Urban Stories", "Discover thoughtful perspectives on technology, culture, travel and the ideas shaping the world around us.", "Explore Stories"],
  passwordChanged: ["Your Urban Stories password has been changed", "Your Password Has Changed", "Your password was successfully updated. If you did not make this change, contact support immediately.", ""],
  emailChanged: ["Your email address has been updated", "Your Email Address Has Been Updated", "The email address associated with your account has changed. If this was not you, contact support immediately.", ""],
  contributorApplicationReceived: ["We received your contributor application", "Application Received", "Thank you for applying to write with Urban Stories. Our editorial team will review your details and send you an update by email.", "Explore Stories"],
  contributorApplicationApproved: ["Congratulations! Your contributor application is approved", "You're Approved!", "Your contributor access has been approved. Open your dashboard, create a draft and submit your stories for editorial review.", "Open Contributor Dashboard"],
  contributorApplicationRejected: ["Update on your Urban Stories contributor application", "An Update on Your Application", "After reviewing your application, we're unable to approve it at this time. Thank you for your interest in Urban Stories.", "Explore Stories"],
  contributorAccessSuspended: ["Update to your Urban Stories contributor access", "Contributor Access Update", "Your contributor access has been suspended or revoked. Contact support if you need clarification.", ""],
  articleSubmitted: ["Your article has been submitted for review", "Your Story Is With Our Editors", "We've received your article for editorial review. The editorial team will email you when its status changes.", "View Submission"],
  newArticleSubmission: ["New article submitted for editorial review", "New Article for Review", "A contributor has submitted a story. Review the contributor details, category and article summary in the admin workspace.", "Review Article"],
  articleApproved: ["Your article has been approved!", "Your Article Has Been Approved", "The editorial team has approved your work. Check your dashboard for the publication status.", "Open Dashboard"],
  articlePublished: ["Your article is now live on Urban Stories!", "Your Story Is Live!", "Congratulations! Your article is now published. Share your story with your community.", "Read Your Article"],
  articleChangesRequested: ["Changes requested for your submitted article", "A Few Changes Have Been Requested", "The editors reviewed your article and requested changes. Review the feedback, update your draft and submit it again.", "Edit Article"],
  articleRejected: ["Update on your submitted article", "An Update on Your Article", "We are unable to publish this article at this time. Thank you for sharing your work with Urban Stories.", "View Dashboard"],
  articleUnpublished: ["An update to your published article", "An Update to Your Published Article", "The status of one of your articles has changed. Please review the editorial note in your dashboard.", "Open Dashboard"],
  newComment: ["A reader commented on your article", "A Reader Joined the Conversation", "A reader has commented on your article. Open the discussion to read the comment.", "View Comment"],
  commentReply: ["Someone replied to your comment", "You Have a New Reply", "Someone replied to your comment on Urban Stories. Open the discussion to read the reply.", "View Discussion"],
  commentModerated: ["An update about your Urban Stories comment", "Comment Moderation Update", "Your comment has been hidden or removed by the moderation team. Review the community guidelines for more information.", "Community Guidelines"],
  newsletterConfirmation: ["Welcome to the Urban Stories newsletter!", "You're on the List", "You'll receive occasional updates featuring fresh perspectives, noteworthy reads and stories worth exploring.", "Explore Stories"],
  newsletterPublication: ["The latest stories from Urban Stories", "The Urban Stories Edit", "A few thoughtful reads selected for curious minds. Explore the featured story and recommended reads below.", "Read Article"],
  newsletterUnsubscribed: ["You've unsubscribed from Urban Stories", "You've Unsubscribed", "Your newsletter subscription has been updated. We're grateful you were part of our community.", "Subscribe Again"],
  contactConfirmation: ["We received your message", "We Received Your Message", "Your message has reached our team. We'll review it and get back to you as soon as possible.", ""],
  contactAdminNotification: ["New message from the Urban Stories contact form", "New Contact Message", "A visitor sent a message through the website. Review the sender details and message below.", "Open Admin"],
  supportResponse: ["A response from Urban Stories support", "A Response from Urban Stories", "Our support team has replied to your query. Reply to this email if you need further assistance.", "Visit Urban Stories"]
} as const;

export type EmailTemplateKey = keyof typeof EMAIL_TEMPLATES;
export type EmailData = Record<string, string | number | undefined | null>;

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://urbanstories.vercel.app").replace(/\/$/, "");
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c] || c));

export function renderUrbanStoriesEmail(key: EmailTemplateKey, data: EmailData = {}) {
  const [subject, heading, intro, defaultCta] = EMAIL_TEMPLATES[key];
  const name = String(data.firstName || data.name || "there");
  const detail = String(data.message || data.feedback || data.reason || "");
  const title = String(data.articleTitle || "Your story");
  const cta = String(data.actionLabel || defaultCta);
  const url = String(data.verificationUrl || data.resetUrl || data.actionUrl || data.articleUrl || (key === "contributorApplicationApproved" ? siteUrl()+"/contributor/dashboard" : siteUrl()));
  const paragraphs = [
    key === "newArticleSubmission" || key === "contactAdminNotification" ? "" : "Hello " + name + ",",
    intro,
    title !== "Your story" ? "Article: " + title : "",
    data.category ? "Category: " + String(data.category) : "",
    data.submittedAt ? "Submitted: " + String(data.submittedAt) : "",
    data.excerpt ? String(data.excerpt) : "",
    data.newsletterIntro ? String(data.newsletterIntro) : "",
    data.recommendedStories ? String(data.recommendedStories) : "",
    data.publishedAt ? "Published: " + String(data.publishedAt) : "",
    data.contributorName ? "Contributor: " + String(data.contributorName) : "",
    data.contributorEmail ? "Contributor email: " + String(data.contributorEmail) : "",
    data.commenter ? "Commenter: " + String(data.commenter) : "",
    data.commentPreview ? "Comment: " + String(data.commentPreview) : "",
    data.senderName ? "From: " + String(data.senderName) : "",
    data.senderEmail ? "Email: " + String(data.senderEmail) : "",
    data.contactSubject ? "Subject: " + String(data.contactSubject) : "",
    detail
  ].filter(Boolean);
  const paragraphHtml = paragraphs.map(p => '<tr><td style="padding:0 40px 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#344054;">'+escapeHtml(p)+'</td></tr>').join("");
  const button = cta ? '<tr><td align="center" style="padding:16px 40px 30px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#397cf0" style="border-radius:7px;"><a href="'+escapeHtml(url)+'" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:20px;font-weight:bold;color:#ffffff;text-decoration:none;">'+escapeHtml(cta)+'</a></td></tr></table></td></tr>' : "";
  const notice = key === "passwordReset" || key === "emailVerification" ? '<tr><td bgcolor="#f5f7fa" style="padding:16px 40px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:21px;color:#475467;">For your security, never share this link. If you did not request this action, you can ignore this email.</td></tr>' : "";
  const logoUrl = process.env.URBAN_STORIES_EMAIL_LOGO_URL || (process.env.NEXT_PUBLIC_SITE_URL ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "") + "/branding/urban-stories-logo.svg" : "");
  const logo = logoUrl
    ? '<img src="'+escapeHtml(logoUrl)+'" width="190" alt="Urban Stories" border="0" style="display:block;width:190px;height:auto;margin:0 auto;">'
    : '<span style="font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:32px;font-weight:800;color:#14243b;">Urban<span style="color:#397cf0;">Stories</span></span>';
  const unsubscribeUrl = String(data.unsubscribeUrl || "");
  const unsubscribe = (key === "newsletterPublication" || key === "newsletterConfirmation") && unsubscribeUrl ? '<tr><td align="center" style="padding-top:10px;"><a href="' + escapeHtml(unsubscribeUrl) + '" style="color:#667085;">Unsubscribe</a></td></tr>' : "";
  const privacy = process.env.URBAN_STORIES_PRIVACY_URL || siteUrl()+"/pages/privacy-policy";
  const terms = process.env.URBAN_STORIES_TERMS_URL || siteUrl()+"/pages/terms-of-service";
  const support = process.env.URBAN_STORIES_SUPPORT_EMAIL || process.env.URBAN_STORIES_ADMIN_EMAIL || "";
  const supportText = support ? 'Contact us at <a href="mailto:'+escapeHtml(support)+'" style="color:#397cf0;">'+escapeHtml(support)+'</a>.' : "Reply to this email and our team will assist you.";
  const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="x-ua-compatible" content="ie=edge"><title>'+escapeHtml(heading)+'</title></head><body style="margin:0;padding:24px 10px;background-color:#f5f7fa;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f5f7fa"><tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;background-color:#ffffff;border-radius:12px;overflow:hidden;"><tr><td align="center" style="padding:34px 24px 22px;">'+logo+'<p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;letter-spacing:2px;text-transform:uppercase;color:#667085;">Stories Beyond Boundaries.</p></td></tr><tr><td align="center" style="padding:12px 40px 8px;"><h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:25px;line-height:32px;font-weight:700;color:#14243b;">'+escapeHtml(heading)+'</h1></td></tr><tr><td align="center" style="padding:0 40px 28px;"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;color:#667085;">'+escapeHtml(intro)+'</p></td></tr>'+paragraphHtml+button+notice+'<tr><td style="padding:0 40px 30px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid #e4e7ec;font-size:1px;line-height:1px;">&nbsp;</td></tr></table></td></tr><tr><td style="padding:0 40px 30px;font-family:Arial,Helvetica,sans-serif;"><h2 style="margin:0 0 12px;font-size:17px;line-height:24px;color:#14243b;">Need Help?</h2><p style="margin:0 0 12px;font-size:14px;line-height:22px;color:#667085;">Our team is here to help. '+supportText+'</p></td></tr><tr><td align="center" bgcolor="#f8fafc" style="padding:24px 20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:#667085;">© '+new Date().getFullYear()+' Urban Stories. All rights reserved.<br><a href="'+escapeHtml(privacy)+'" style="color:#667085;">Privacy Policy</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="'+escapeHtml(terms)+'" style="color:#667085;">Terms of Service</a>'+unsubscribe+'</td></tr></table></td></tr></table></body></html>';
  return { subject, html };
}

export function getEmailPreviewData(key: EmailTemplateKey): EmailData {
  return { name:"Alex Morgan", articleTitle:"The Cities That Are Reimagining Urban Life", articleUrl:siteUrl()+"/article/urban-life", actionUrl:siteUrl()+"/contributor/dashboard", submittedAt:"23 November 2026", publishedAt:"23 November 2026", category:"Culture & Lifestyle", contributorName:"Alex Morgan", contributorEmail:"alex@example.com", feedback:"Please add more supporting examples and clarify the central argument.", commenter:"Jordan Lee", commentPreview:"Loved this perspective. Looking forward to more.", senderName:"Taylor Reed", senderEmail:"taylor@example.com", contactSubject:"Partnership enquiry", message:"This is sample preview content. It will not be sent to real users." };
}
