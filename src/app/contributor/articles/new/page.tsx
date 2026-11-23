import Link from "next/link";
import {requireRole} from "@/lib/auth/roles";
import {getWriteClient} from "@/lib/sanity/write-client";
import {ArticleEditor} from "@/components/community/article-editor";
export default async function NewArticlePage(){
 const access=await requireRole(["contributor"]);const client=getWriteClient();const categories=await client.fetch('*[_type=="category"]|order(displayOrder asc){_id,name}');
 return <main className="community-page"><header><Link href="/contributor/dashboard">← Dashboard</Link><strong>Urban Stories</strong></header><section className="community-panel community-editor"><h1>Create an article</h1><p>Draft your story and submit it for editorial review.</p><ArticleEditor categories={categories} userId={access.userId!}/></section></main>
}
