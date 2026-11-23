import Link from "next/link";
import {imageUrl} from "@/lib/sanity/image";
import {NewsletterForm} from "@/components/community/newsletter-form";
function href(item:any){if(item.kind==="external")return item.url||"#";if(item.kind==="article")return item.article?.slug?"/article/"+item.article.slug:"#";if(item.kind==="category")return item.category?.slug?"/category/"+item.category.slug:"#";if(item.kind==="page")return item.page?.slug?"/pages/"+item.page.slug:"#";return item.path||"#";}
export function SiteHeader({settings,navigation}:{settings:any;navigation:any}){return <header className="blog-nav"><div className="blog-container nav-inner"><Link href="/" className="brand-logo" aria-label="Urban Stories – Go to homepage"><img src="/branding/urban-stories-logo.svg" alt="Urban Stories"/></Link><nav className="nav-links" aria-label={navigation?.title}>{navigation?.items?.map((item:any)=><Link key={item._key||item.label} href={href(item)} target={item.openInNewTab?"_blank":undefined}>{item.label}</Link>)}</nav></div></header>}
export function SiteFooter({settings,footer}:{settings:any;footer:any}){
 const socials=(footer?.socialLinks?.length?footer.socialLinks:settings?.socialLinks||[]).filter((item:any)=>item?.url);
 const contributorImage=imageUrl(footer?.contributorCtaImage,1000);
 return <>
  <section className="contributor-cta" aria-labelledby="contributor-cta-title">
   <div className={`blog-container contributor-cta-inner${contributorImage?" has-image":""}`}>
    <div className="contributor-cta-copy"><h2 id="contributor-cta-title">Have a story worth sharing?</h2><p>Join the Urban Stories contributor community and share your perspective.</p><Link href="/contributor/editor" className="contributor-cta-button">Become a Contributor</Link></div>
    {contributorImage&&<div className="contributor-cta-media"><img src={contributorImage} alt={footer?.contributorCtaImage?.alt||"A creative workspace for Urban Stories contributors"} loading="lazy"/></div>}
   </div>
  </section>
  <footer className="site-footer"><div className="blog-container site-footer-grid">
   <div className="site-footer-brand"><Link href="/" className="brand-logo footer-brand-logo" aria-label="Urban Stories – Go to homepage"><img src="/branding/urban-stories-logo.svg" alt="Urban Stories"/></Link><p>Stories beyond boundaries. Perspectives for curious minds.</p></div>
   <div className="site-footer-newsletter"><h2>Stay in the Story</h2><p>Get fresh perspectives on technology, culture and travel delivered straight to your inbox.</p><NewsletterForm/></div>
  </div><div className="blog-container site-footer-bottom"><span>{footer?.copyrightText||settings?.copyrightText||"© 2026 Urban Stories. All rights reserved."}</span><div className="footer-bottom-links">{socials.map((item:any)=><a key={item._key||item.label} href={item.url} target="_blank" rel="noreferrer" aria-label={item.label}>{item.label}</a>)}</div></div></footer>
 </>;
}
