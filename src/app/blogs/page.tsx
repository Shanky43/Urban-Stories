import type {Metadata} from "next";
import {sanityFetch} from "@/lib/sanity/client";
import {ARTICLE_PAGE_QUERY,FOOTER_QUERY,NAV_QUERY,SITE_QUERY} from "@/lib/sanity/queries";
import type {Article,FooterData,NavigationData,SiteSettings} from "@/lib/sanity/types";
import {SiteFooter,SiteHeader} from "@/components/cms/site-chrome";
import BlogPagination from "@/components/blog-pagination";
export const metadata:Metadata={title:"Explore All Stories | Urban Stories",description:"Discover ideas, experiences, and perspectives across our stories.",alternates:{canonical:"/blogs"}};
export default async function BlogsPage(){
 const [settings,navigation,footer,rows]=await Promise.all([
  sanityFetch<SiteSettings>({query:SITE_QUERY,tags:["settings"]}),sanityFetch<NavigationData>({query:NAV_QUERY,tags:["navigation"]}),sanityFetch<FooterData>({query:FOOTER_QUERY,tags:["footer"]}),sanityFetch<Article[]>({query:ARTICLE_PAGE_QUERY,tags:["articles"]})
 ]);
 const initial=rows||[],initialHasMore=initial.length>10,articles=initial.slice(0,10),last=articles.at(-1);
 return <main className="blog-site"><SiteHeader settings={settings||{siteName:"Urban Stories"}} navigation={navigation}/>
  <section className="blogs-page-header blog-container"><p className="hero-eyebrow">Urban Stories</p><h1>Explore All Stories</h1><p>Discover ideas, experiences, and perspectives across our stories.</p></section>
  <section className="featured-section blog-container blogs-listing" aria-label="All published stories">
   {rows===null?<div className="blogs-empty-state" role="alert"><h2>Stories couldn’t load</h2><p>Please refresh the page to try again.</p></div>:articles.length>0?<BlogPagination initialArticles={articles} initialHasMore={initialHasMore} initialCursor={initialHasMore&&last?.publishedAt?{lastPublishedAt:last.publishedAt,lastId:last._id}:null}/>:<div className="blogs-empty-state"><h2>No stories yet</h2><p>Check back soon for new stories from Urban Stories.</p></div>}
  </section>
  <SiteFooter settings={settings||{siteName:"Urban Stories"}} footer={footer}/>
 </main>;
}
