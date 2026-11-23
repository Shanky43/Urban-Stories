"use client";
import { useState } from "react";
const templates = [
["emailVerification","Email verification"],["passwordReset","Password reset"],["welcome","Welcome"],["passwordChanged","Password changed"],["emailChanged","Email address changed"],
["contributorApplicationReceived","Contributor application received"],["contributorApplicationApproved","Contributor application approved"],["contributorApplicationRejected","Contributor application rejected"],["contributorAccessSuspended","Contributor access suspended"],
["articleSubmitted","Article submitted"],["newArticleSubmission","New article submission (admin)"],["articleApproved","Article approved"],["articlePublished","Article published"],["articleChangesRequested","Changes requested"],["articleRejected","Article rejected"],["articleUnpublished","Article unpublished"],
["newComment","New comment"],["commentReply","Comment reply"],["commentModerated","Comment moderated"],["newsletterConfirmation","Newsletter confirmation"],["newsletterPublication","Newsletter publication"],["newsletterUnsubscribed","Newsletter unsubscribe confirmation"],["contactConfirmation","Contact confirmation"],["contactAdminNotification","New contact notification (admin)"],["supportResponse","Support response"]
] as const;
export default function EmailTemplatePreview() {
  const [template,setTemplate] = useState<string>(templates[0][0]);
  const [mobile,setMobile] = useState(false);
  return <main className="mx-auto min-h-screen max-w-7xl px-5 py-10 sm:px-8">
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-sm font-semibold uppercase tracking-[.18em] text-[#397cf0]">Urban Stories · Email studio</p><h1 className="text-3xl font-semibold text-[#14243b]">Email template previews</h1><p className="mt-2 text-sm text-slate-600">Sample data only. Previewing never sends an email.</p></div><a href="/admin" className="text-sm font-medium text-[#397cf0]">← Admin workspace</a></div>
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"><label htmlFor="email-template" className="text-sm font-medium text-slate-700">Template</label><select id="email-template" value={template} onChange={e=>setTemplate(e.target.value)} className="min-w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm">{templates.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select><div className="ml-auto flex gap-2"><button onClick={()=>setMobile(false)} className={mobile?"rounded-lg bg-slate-100 px-3 py-2 text-sm":"rounded-lg bg-[#14243b] px-3 py-2 text-sm text-white"}>Desktop</button><button onClick={()=>setMobile(true)} className={!mobile?"rounded-lg bg-slate-100 px-3 py-2 text-sm":"rounded-lg bg-[#14243b] px-3 py-2 text-sm text-white"}>Mobile</button></div></div>
    <div className="flex justify-center rounded-xl bg-[#e9edf3] p-3 sm:p-8"><iframe title="Email template preview" src={"/api/admin/email-preview?template="+template} className="min-h-[1000px] border-0 bg-white shadow-xl" style={{width:mobile?"390px":"640px",maxWidth:"100%"}} /></div>
  </main>;
}
