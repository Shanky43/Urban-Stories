import type {Metadata} from "next";
export const instant = false;
import {notFound} from "next/navigation";
import {sanityFetch} from "@/lib/sanity/client";
import {AUTHOR_QUERY,SITE_QUERY,NAV_QUERY,FOOTER_QUERY} from "@/lib/sanity/queries";
import {imageUrl} from "@/lib/sanity/image";
import {ArticleCard} from "@/components/cms/article-card";
import {SiteHeader,SiteFooter} from "@/components/cms/site-chrome";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const author=await sanityFetch<any>({query:AUTHOR_QUERY,params:{slug}});return author?{title:author.seo?.title||author.name,description:author.seo?.description||author.biography}:{}}
export default async function AuthorPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const [author,settings,navigation,footer]=await Promise.all([sanityFetch<any>({query:AUTHOR_QUERY,params:{slug},tags:["author:"+slug]}),sanityFetch<any>({query:SITE_QUERY}),sanityFetch<any>({query:NAV_QUERY}),sanityFetch<any>({query:FOOTER_QUERY})]);if(!author||!settings)notFound();return <main className="cms-detail-page"><SiteHeader settings={settings} navigation={navigation}/><section className="blog-container cms-listing"><div className="cms-author-profile">{author.profileImage&&<img src={imageUrl(author.profileImage,320)} alt={author.name}/>}<div><h1>{author.name}</h1><p>{author.designation}</p><p>{author.biography}</p></div></div><h2>Stories by {author.name}</h2><div className="cms-article-grid">{author.articles?.map((article:any)=><ArticleCard key={article._id} article={article}/>)}</div></section><SiteFooter settings={settings} footer={footer}/></main>}
