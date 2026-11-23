import Link from "next/link";
import type {Article,Category,FooterData,HomeData,NavigationData,SiteSettings} from "@/lib/sanity/types";
import {imageUrl} from "@/lib/sanity/image";
import {ArticleCard} from "@/components/cms/article-card";
import {SiteFooter,SiteHeader} from "@/components/cms/site-chrome";

export default function BlogHome({settings,navigation,footer,home,categories,articles}:{settings:SiteSettings;navigation:NavigationData|null;footer:FooterData|null;home:HomeData|null;categories:Category[];articles:Article[]}){
 const hero=home?.hero;
 const sections=(home?.sections||[]).filter(section=>section.visible!==false);
 return <main className="blog-site">
  <SiteHeader settings={settings} navigation={navigation}/>
  {hero&&<section className="blog-hero" style={hero.backgroundImage?{backgroundImage:"linear-gradient(#1f304e99,#1f304e99),url("+imageUrl(hero.backgroundImage,1800)+")"}:undefined}>
   <div className="hero-content"><p className="hero-eyebrow">{hero.eyebrow}</p><h1>{hero.heading}</h1><p>{hero.description}</p>
    <form className="hero-search" action="/search" method="get"><input name="q" aria-label={hero.searchPlaceholder} placeholder={hero.searchPlaceholder}/><button type="submit">{hero.searchButtonLabel}</button></form>
   </div>
  </section>}
  {sections.map((section:any)=>{
   let selected:Article[]=[];
   if(section.articles?.length)selected=section.articles;
   else if(section.sectionType==="featured")selected=articles.filter(article=>article.featured);
   else if(section.sectionType==="trending")selected=articles.filter(article=>article.trending);
   else if(section.sectionType==="editorsPicks")selected=articles.filter(article=>article.editorsPick);
   else if(section.sectionType==="categoryStories")selected=articles.filter(article=>article.category?.slug===section.category?.slug);
   else selected=articles;
   return <section className="featured-section blog-container" key={section._key}>
    <div className="section-heading"><h2>{section.heading}</h2><p>{section.description}</p></div>
    {section.sectionType==="newsletter"?<div className="cms-newsletter"><h2>{section.heading}</h2><p>{section.description}</p></div>:
     section.sectionType==="promo"?<div className="cms-promo">{section.promoImage&&<img src={imageUrl(section.promoImage,1200)} alt={section.heading||""}/>}<div><h2>{section.heading}</h2><p>{section.description}</p>{section.promoLink?.label&&<Link href={section.promoLink.path||section.promoLink.url||"#"}>{section.promoLink.label}</Link>}</div></div>:
     <div className="cms-article-grid">{selected.slice(0,section.limit||4).map(article=><ArticleCard key={article._id} article={article}/>)}</div>}
   </section>;
  })}
  {categories.length>0&&<section className="blog-container cms-topics" id="topics"><div>{categories.map(category=><Link key={category._id} href={"/category/"+category.slug}>{category.name}</Link>)}</div></section>}
  <SiteFooter settings={settings} footer={footer}/>
 </main>;
}
