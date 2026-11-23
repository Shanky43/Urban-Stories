import type {Metadata} from "next";
export const instant = false;
import Link from "next/link";
import {notFound} from "next/navigation";
import {sanityFetch} from "@/lib/sanity/client";
import {CATEGORY_QUERY,CATEGORY_STORIES_QUERY,SITE_QUERY,NAV_QUERY,FOOTER_QUERY} from "@/lib/sanity/queries";
import {ArticleCard} from "@/components/cms/article-card";
import {SiteHeader,SiteFooter} from "@/components/cms/site-chrome";
import type {Article,Category,SiteSettings} from "@/lib/sanity/types";

export async function generateMetadata({params}:{params:Promise<{category:string}>}):Promise<Metadata>{const {category}=await params;const categories=await sanityFetch<Category[]>({query:CATEGORY_QUERY});const item=categories?.find(c=>c.slug===category);return item?{title:item.name,description:item.description}:{}}
export default async function CategoryPage({params}:{params:Promise<{category:string}>}){const {category}=await params;const [categories,articles,settings,navigation,footer]=await Promise.all([sanityFetch<Category[]>({query:CATEGORY_QUERY}),sanityFetch<Article[]>({query:CATEGORY_STORIES_QUERY,params:{slug:category},tags:["category:"+category]}),sanityFetch<SiteSettings>({query:SITE_QUERY}),sanityFetch<any>({query:NAV_QUERY}),sanityFetch<any>({query:FOOTER_QUERY})]);const item=categories?.find(c=>c.slug===category);if(!item||!settings)notFound();return <main className="cms-detail-page"><SiteHeader settings={settings} navigation={navigation}/><section className="blog-container cms-listing"><nav className="cms-breadcrumb"><Link href="/">Home</Link> / {item.name}</nav><h1>{item.name}</h1><p>{item.description}</p><div className="cms-article-grid">{articles?.map(article=><ArticleCard key={article._id} article={article}/>)}</div>{!articles?.length&&<p>No published stories in this category yet.</p>}</section><SiteFooter settings={settings} footer={footer}/></main>}
