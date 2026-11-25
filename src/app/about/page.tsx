import type {Metadata} from "next";
import {Fragment} from "react";
import Link from "next/link";
import Image from "next/image";
import {notFound} from "next/navigation";
import {sanityFetch} from "@/lib/sanity/client";
import {ABOUT_PAGE_QUERY, SITE_QUERY, NAV_QUERY, FOOTER_QUERY} from "@/lib/sanity/queries";
import {imageUrl} from "@/lib/sanity/image";
import {SiteHeader, SiteFooter} from "@/components/cms/site-chrome";
import {PortableContent} from "@/components/cms/portable-content";
import type {SiteSettings, NavigationData, FooterData} from "@/lib/sanity/types";

type AboutImage = {asset?: unknown; alt?: string; caption?: string};
type AboutPageData = {
  title?: string; heroHeading?: string; heroDescription?: string; heroImage?: AboutImage;
  sections?: {_key?: string; heading?: string; body?: unknown[]; image?: AboutImage; imagePosition?: "left" | "right"}[];
  quote?: string; closingHeading?: string; closingDescription?: string; closingTagline?: string;
  ctaTitle?: string; ctaDescription?: string; ctaButtons?: {_key?: string; label: string; href: string; style?: string}[];
  seo?: {title?: string; description?: string; noIndex?: boolean; socialImage?: AboutImage};
};
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://urbanstories.vercel.app").replace(/\/$/, "");

export async function generateMetadata(): Promise<Metadata> {
  const page = await sanityFetch<AboutPageData>({query: ABOUT_PAGE_QUERY, tags: ["about-page"]});
  if (!page) return {title: "Our Story | Urban Stories", alternates: {canonical: siteUrl + "/about"}};
  const title = page.seo?.title || page.heroHeading || page.title || "Our Story";
  const description = page.seo?.description || page.heroDescription;
  const socialImage = imageUrl(page.seo?.socialImage, 1200);
  return {title, description, robots: page.seo?.noIndex ? {index: false, follow: false} : undefined,
    alternates: {canonical: siteUrl + "/about"},
    openGraph: {type: "website", title, description, url: siteUrl + "/about", images: socialImage ? [{url: socialImage}] : undefined}};
}
function EditorialImage({image, className}: {image?: AboutImage; className: string}) {
  const src = imageUrl(image, 1400);
  if (!src) return null;
  return <figure className={className}><Image src={src} alt={image?.alt || ""} width={1400} height={1000} sizes="(max-width: 760px) 100vw, 50vw" unoptimized/>{image?.caption && <figcaption>{image.caption}</figcaption>}</figure>;
}
export default async function AboutPage() {
  const [page, settings, navigation, footer] = await Promise.all([
    sanityFetch<AboutPageData>({query: ABOUT_PAGE_QUERY, tags: ["about-page"]}),
    sanityFetch<SiteSettings>({query: SITE_QUERY}), sanityFetch<NavigationData>({query: NAV_QUERY}), sanityFetch<FooterData>({query: FOOTER_QUERY}),
  ]);
  if (!page) notFound();
  return <main className="about-page">
    <SiteHeader settings={settings} navigation={navigation}/>
    <div className="about-page-content">
      <section className="about-hero blog-container">
        <div className="about-hero-copy"><span className="about-eyebrow">OUR STORY</span><h1>{page.heroHeading}</h1>{page.heroDescription && <p>{page.heroDescription}</p>}</div>
        <EditorialImage image={page.heroImage} className="about-hero-image"/>
      </section>
      {(page.sections || []).map((section, index) => <Fragment key={section._key || section.heading || index}><section className={"about-story-section " + (section.imagePosition === "left" ? "image-left" : "image-right")} >
        <div className="blog-container about-story-inner">
          <div className="about-story-copy"><span className="about-section-number">{String(index + 1).padStart(2, "0")}</span>{section.heading && <h2>{section.heading}</h2>}{section.body && <div className="about-rich-text"><PortableContent value={section.body as never}/></div>}</div>
          <EditorialImage image={section.image} className="about-story-image"/>
        </div>
      </section>{index === 0 && page.quote && <section className="about-pullquote" key="about-pullquote"><div className="blog-container"><span aria-hidden="true">“</span><blockquote>{page.quote}</blockquote></div></section>}</Fragment>)}
      {(page.closingHeading || page.closingDescription || page.closingTagline) && <section className="about-closing blog-container">{page.closingHeading && <h2>{page.closingHeading}</h2>}{page.closingDescription && <p>{page.closingDescription}</p>}{page.closingTagline && <strong>{page.closingTagline}</strong>}</section>}
      {(page.ctaTitle || page.ctaDescription) && <section className="about-cta"><div className="blog-container about-cta-inner">{page.ctaTitle && <h2>{page.ctaTitle}</h2>}{page.ctaDescription && <p>{page.ctaDescription}</p>}<div className="about-cta-actions">{(page.ctaButtons || []).map((button) => <Link key={button._key || button.label} href={button.href} className={button.style === "secondary" ? "about-cta-secondary" : "about-cta-primary"}>{button.label}</Link>)}</div></div></section>}
    </div>
    <SiteFooter settings={settings} footer={footer}/>
  </main>;
}
