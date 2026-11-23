import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { requireRole } from "@/lib/auth/roles";
import { getWriteClient } from "@/lib/sanity/write-client";

export default async function ContributorArticleStatus({ params }: { params: Promise<{ id: string }> }) {
  const access = await requireRole(["contributor"]);
  const { id } = await params;
  const client = getWriteClient();
  const article = await client.fetch('*[_type=="article" && _id==$id][0]{_id,title,excerpt,body[]{...,asset->{_id,url}},submissionStatus,status,submittedAt,reviewFeedback,featuredImage{alt,asset->{url}}}', { id });
  if (!article) notFound();
  const owner = await client.fetch('*[_type=="article" && _id==$id && contributorClerkUserId==$userId][0]._id', { id, userId: access.userId });
  if (!owner) notFound();
  return <main className="community-page"><header><Link href="/contributor/dashboard">← Dashboard</Link><strong>Urban Stories</strong></header><article className="community-panel community-editor"><p className="community-eyebrow">Article submission</p><h1>{article.title}</h1><p>{article.excerpt}</p><p><strong>Status:</strong> {article.submissionStatus || article.status}</p>{article.submittedAt && <p><strong>Submitted:</strong> {new Date(article.submittedAt).toLocaleString()}</p>}{article.reviewFeedback && <aside className="review-feedback"><strong>Editorial feedback</strong><p>{article.reviewFeedback}</p></aside>}{article.featuredImage?.asset?.url && <img src={article.featuredImage.asset.url} alt={article.featuredImage.alt || "Article featured image"} className="article-status-image" />}<div className="article-status-content"><PortableText value={article.body || []} /></div>{["draft", "changesRequested", "rejected"].includes(article.submissionStatus || article.status) && <Link className="contributor-cta-button" href={`/contributor/articles/${id}/edit`}>Continue editing</Link>}</article></main>;
}
