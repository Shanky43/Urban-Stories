import type {Metadata} from "next";
import Link from "next/link";
import {sanityFetch} from "@/lib/sanity/client";
import {SEARCH_QUERY,SITE_QUERY,NAV_QUERY,FOOTER_QUERY} from "@/lib/sanity/queries";
import {ArticleCard} from "@/components/cms/article-card";
import {SiteHeader,SiteFooter} from "@/components/cms/site-chrome";
import type {Article} from "@/lib/sanity/types";
export const instant=false;
export const metadata:Metadata={title:"Search stories"};
export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string}>}){
 const {q=""}=await searchParams;const term=q.trim();
 const [articles,settings,navigation,footer]=await Promise.all([term?sanityFetch<Article[]>({query:SEARCH_QUERY,params:{term:term+"*",tag:term},tags:["search"]}):Promise.resolve([]),sanityFetch<any>({query:SITE_QUERY}),sanityFetch<any>({query:NAV_QUERY}),sanityFetch<any>({query:FOOTER_QUERY})]);
 if(!settings)return <main/>;
 return <main className="cms-detail-page"><SiteHeader settings={settings} navigation={navigation}/><section className="blog-container cms-listing"><nav className="cms-breadcrumb"><Link href="/">Home</Link> / Search</nav><h1>{settings.uiLabels?.searchResults}</h1><p>{term?"Stories matching: "+term:"Enter a search term to discover stories."}</p><div className="cms-article-grid">{articles?.map(article=><ArticleCard key={article._id} article={article}/>)}</div>{term&&!articles?.length&&<p>{settings.uiLabels?.noResults}</p>}</section><SiteFooter settings={settings} footer={footer}/></main>
}
