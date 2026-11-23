import { redirect } from "next/navigation";
import { getUserAccess } from "@/lib/auth/roles";
import EmailTemplatePreview from "./email-template-preview";
export default async function EmailPreviewPage() {
  const access = await getUserAccess();
  if (!access.userId) redirect("/sign-in?redirect_url=/admin/email-preview");
  if (access.role !== "admin") redirect("/");
  return <EmailTemplatePreview />;
}
