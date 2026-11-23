import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserAccess } from "@/lib/auth/roles";
import AdminReviewPanel from "@/components/community/admin-review-panel";

export default async function AdminPage() {
  const access = await getUserAccess();
  if (!access.userId) redirect("/sign-in?redirect_url=/admin");
  if (access.role !== "admin") redirect("/");
  return <main className="mx-auto min-h-screen max-w-7xl px-5 py-12 sm:px-8">
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-sm font-semibold uppercase tracking-[.18em] text-[#397cf0]">Urban Stories · Editorial</p><h1 className="text-4xl font-semibold tracking-tight text-[#14243b]">Admin workspace</h1><p className="mt-2 text-slate-600">Review submissions and manage contributor applications.</p></div><div className="flex gap-4"><Link href="/admin/email-preview" className="text-sm font-medium text-[#397cf0]">Email templates ↗</Link><Link href="/" className="text-sm font-medium text-[#397cf0]">← View website</Link></div></div>
    <AdminReviewPanel />
  </main>;
}
