import "server-only";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
}

export async function sendCommunityEmail(input: { to: string; subject: string; heading: string; message: string; actionUrl?: string; actionLabel?: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  if (!key || !input.to) return { sent: false as const, reason: "email_not_configured" };
  const { Resend } = await import("resend");
  const resend = new Resend(key);
  const action = input.actionUrl && input.actionLabel
    ? `<p style="margin:28px 0"><a href="${escapeHtml(input.actionUrl)}" style="background:#397cf0;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">${escapeHtml(input.actionLabel)}</a></p>`
    : "";
  const result = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: `<div style="font-family:Arial,sans-serif;color:#14243b;max-width:600px;margin:auto;padding:32px"><p style="font-weight:700;color:#397cf0">URBAN STORIES</p><h1 style="font-size:24px">${escapeHtml(input.heading)}</h1><p style="line-height:1.7">${escapeHtml(input.message)}</p>${action}<hr style="border:0;border-top:1px solid #e8edf4;margin-top:32px"><p style="font-size:12px;color:#667085">Stories Beyond Boundaries.</p></div>`,
  });
  if (result.error) throw new Error(result.error.message);
  return { sent: true as const, id: result.data?.id };
}
