import BlogHome from "@/components/blog-home";
export const instant = false;
import {sanityFetch} from "@/lib/sanity/client";
import {SITE_QUERY,NAV_QUERY,FOOTER_QUERY,HOME_QUERY,CATEGORY_QUERY,ARTICLE_LIST_QUERY} from "@/lib/sanity/queries";
import type {Article,Category,FooterData,HomeData,NavigationData,SiteSettings} from "@/lib/sanity/types";

export default async function HomePage(){
 const [settings,navigation,footer,home,categories,articles]=await Promise.all([
 sanityFetch<SiteSettings>({query:SITE_QUERY,tags:["settings"]}),sanityFetch<NavigationData>({query:NAV_QUERY,tags:["navigation"]}),sanityFetch<FooterData>({query:FOOTER_QUERY,tags:["footer"]}),sanityFetch<HomeData>({query:HOME_QUERY,tags:["homepage"]}),sanityFetch<Category[]>({query:CATEGORY_QUERY,tags:["categories"]}),sanityFetch<Article[]>({query:ARTICLE_LIST_QUERY,tags:["articles"]})
 ]);
 if(!settings)return <main className="cms-unconfigured"><p>CMS configuration unavailable.</p><a href="/studio">Open Studio</a></main>;
 return <BlogHome settings={settings} navigation={navigation} footer={footer} home={home} categories={categories||[]} articles={articles||[]}/>;
}
