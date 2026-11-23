import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAccess } from "@/lib/auth/roles";

export default async function ContributorEditorEntry() {
  const access = await getUserAccess();
  if (!access.userId) redirect("/sign-in?redirect_url=" + encodeURIComponent("/contributor/editor"));
  if (access.role === "admin") redirect("/admin");
  if (access.role === "contributor") redirect("/contributor/articles/new");
  return <main className="community-page"><section className="community-panel"><p className="community-eyebrow">Urban Stories Community</p><h1>Become a contributor</h1><p>Your account does not yet have contributor access. Apply to join the contributor community and our editorial team will review your application.</p><Link className="contributor-cta-button" href="/contributor/apply">Continue to contributor application</Link></section></main>;
}
