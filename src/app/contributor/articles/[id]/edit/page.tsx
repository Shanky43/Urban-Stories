import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/roles";
import { getWriteClient } from "@/lib/sanity/write-client";
import { ArticleEditor } from "@/components/community/article-editor";

export default async function EditContributorArticle({ params }: { params: Promise<{ id: string }> }) {
  const access = await requireRole(["contributor"]);
  const { id } = await params;
  const client = getWriteClient();
  const [article, categories] = await Promise.all([
    client.fetch('*[_type=="article" && _id==$id][0]{_id,title,excerpt,body[]{...,asset->{_id,url,"_ref":_id}},submissionStatus,status,contributorClerkUserId,primaryCategory->{_id},featuredImage{alt,caption,asset->{_id,url,"_ref":_id}}}', { id }),
    client.fetch('*[_type=="category"]|order(displayOrder asc){_id,name}'),
  ]);
  if (!article || article.contributorClerkUserId !== access.userId) notFound();
  if (!["draft", "changesRequested", "rejected"].includes(article.submissionStatus || article.status)) redirect("/contributor/dashboard");
  return <main className="community-page"><header><Link href="/contributor/dashboard">← Dashboard</Link><strong>Urban Stories</strong></header><section className="community-panel community-editor"><h1>Edit your story</h1><p>Update your draft and resubmit it for editorial review.</p><ArticleEditor categories={categories} userId={access.userId!} initialArticle={{ ...article, categoryId: article.primaryCategory?._id || "" }} /></section></main>;
}
