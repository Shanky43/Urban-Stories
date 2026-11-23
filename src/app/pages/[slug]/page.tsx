import type {Metadata} from "next";
export const instant = false;
import {notFound} from "next/navigation";
import {sanityFetch} from "@/lib/sanity/client";
import {PAGE_QUERY,SITE_QUERY,NAV_QUERY,FOOTER_QUERY} from "@/lib/sanity/queries";
import {PortableContent} from "@/components/cms/portable-content";
import {SiteHeader,SiteFooter} from "@/components/cms/site-chrome";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const page=await sanityFetch<any>({query:PAGE_QUERY,params:{slug}});return page?{title:page.seo?.title||page.title,description:page.seo?.description||page.excerpt,robots:page.seo?.noIndex?{index:false,follow:false}:undefined}:{}}
export default async function ContentPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const [page,settings,navigation,footer]=await Promise.all([sanityFetch<any>({query:PAGE_QUERY,params:{slug},tags:["page:"+slug]}),sanityFetch<any>({query:SITE_QUERY}),sanityFetch<any>({query:NAV_QUERY}),sanityFetch<any>({query:FOOTER_QUERY})]);if(!page||!settings)notFound();return <main className="cms-detail-page"><SiteHeader settings={settings} navigation={navigation}/><article className="blog-container cms-listing"><h1>{page.title}</h1>{page.excerpt&&<p>{page.excerpt}</p>}<div className="cms-detail-body"><PortableContent value={page.body||[]}/></div></article><SiteFooter settings={settings} footer={footer}/></main>}
