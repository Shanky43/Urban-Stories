import { NextRequest, NextResponse } from "next/server";
import { getUserAccess } from "@/lib/auth/roles";
import { apiError } from "@/lib/community/http";
import { EMAIL_TEMPLATES, getEmailPreviewData, renderUrbanStoriesEmail, type EmailTemplateKey } from "@/lib/email/templates";

export async function GET(request: NextRequest) {
  try {
    const access = await getUserAccess();
    if (!access.userId) throw new Error("UNAUTHENTICATED");
    if (access.role !== "admin") throw new Error("FORBIDDEN");
    const key = request.nextUrl.searchParams.get("template") as EmailTemplateKey | null;
    if (!key || !(key in EMAIL_TEMPLATES)) return NextResponse.json({ error:"Unknown email template", templates:Object.keys(EMAIL_TEMPLATES) }, { status:400 });
    return new NextResponse(renderUrbanStoriesEmail(key, getEmailPreviewData(key)).html, { headers:{ "Content-Type":"text/html; charset=utf-8", "Cache-Control":"no-store" } });
  } catch (error) { return apiError(error); }
}
