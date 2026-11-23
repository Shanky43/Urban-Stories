import BlogHome from "@/components/blog-home";
export const instant = false;
import {sanityFetch} from "@/lib/sanity/client";
import {SITE_QUERY,NAV_QUERY,FOOTER_QUERY,HOME_QUERY,CATEGORY_QUERY,ARTICLE_LIST_QUERY} from "@/lib/sanity/queries";
import type {Article,Category,FooterData,HomeData,NavigationData,SiteSettings} from "@/lib/sanity/types";

export default async function HomePage(){
 const [settings,navigation,footer,home,categories,articles]=await Promise.all([
 sanityFetch<SiteSettings>({query:SITE_QUERY,tags:["settings"]}),sanityFetch<NavigationData>({query:NAV_QUERY,tags:["navigation"]}),sanityFetch<FooterData>({query:FOOTER_QUERY,tags:["footer"]}),sanityFetch<HomeData>({query:HOME_QUERY,tags:["homepage"]}),sanityFetch<Category[]>({query:CATEGORY_QUERY,tags:["categories"]}),sanityFetch<Article[]>({query:ARTICLE_LIST_QUERY,tags:["articles"]})
 ]);
 const siteSettings:SiteSettings=settings||{
  siteName:"Urban Stories",
  tagline:"Stories Beyond Boundaries.",
  description:"Discover thoughtful stories on technology, culture, creativity and travel.",
  defaultSeoTitle:"Urban Stories — Stories Beyond Boundaries",
  defaultSeoDescription:"Discover thoughtful stories on technology, culture, lifestyle and travel.",
  copyrightText:"© 2026 Urban Stories. All rights reserved.",
  uiLabels:{home:"Home",search:"Search stories",readMore:"Read more",allStories:"All stories"}
 };
 const homeData:HomeData=home||{hero:{eyebrow:"Stories Beyond Boundaries",heading:"Ideas, people and places that move us.",description:"Discover fresh perspectives on technology, culture, creativity and the world around us.",searchPlaceholder:"What would you like to explore?",searchButtonLabel:"Search"},sections:[{_key:"latest-stories",title:"Latest Stories",sectionType:"latest",visible:true}]};
 return <BlogHome settings={siteSettings} navigation={navigation} footer={footer} home={homeData} categories={categories||[]} articles={articles||[]}/>;
}
