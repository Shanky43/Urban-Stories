/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import Image from "next/image";
import { imageUrl } from "@/lib/sanity/image";
import { NewsletterForm } from "@/components/community/newsletter-form";
import { SiteHeaderNav } from "@/components/cms/site-header-nav";

const existingFooterRoutes = new Set(["/", "/about", "/contact", "/search", "/contributor/editor", "/contributor/dashboard", "/admin"]);
function routeExists(path: string) { return existingFooterRoutes.has(path) || path.startsWith("/article/") || path.startsWith("/category/") || path.startsWith("/pages/") || path.startsWith("/articles/") || path.startsWith("/author/"); }
function navigationHref(item: any) {
  if (item?.kind === "external") return item.url || "";
  if (item?.kind === "article") return item.article?.slug ? "/article/" + item.article.slug : "";
  if (item?.kind === "category") return item.category?.slug ? "/category/" + item.category.slug : "";
  if (item?.kind === "page") return item.page?.slug ? "/pages/" + item.page.slug : "";
  return item?.path || "";
}
export function SiteHeader(props: { settings: any; navigation: any }) {
  void props;
  return <SiteHeaderNav />;
}
export function SiteFooter({ settings, footer }: { settings: any; footer: any }) {
  const contributorImage = imageUrl(footer?.contributorCtaImage, 1800);
  const configuredLinks = (footer?.groups || []).flatMap((group: any) => group?.links || [])
    .filter((item: any) => item?.visible !== false)
    .map((item: any) => ({ label: item.label, href: navigationHref(item), external: item.kind === "external" }))
    .filter((item: any) => item.label && item.href && (item.external || routeExists(item.href)));
  const footerLinks = configuredLinks.length ? configuredLinks : [
    { label: "About", href: "/about" }, { label: "Contact", href: "/contact" }, { label: "Blog", href: "/" },
  ];
  return <>
    <section className="contributor-cta" aria-labelledby="contributor-cta-title"
      style={contributorImage ? { backgroundImage: "linear-gradient(105deg,rgba(255,255,255,.91),rgba(239,246,255,.82)),url(" + contributorImage + ")" } : undefined}>
      <div className="blog-container contributor-cta-inner">
        <div className="contributor-cta-copy">
          <h2 id="contributor-cta-title">Have a story worth sharing?</h2>
          <p>Join the Urban Stories contributor community and share your perspective.</p>
          <Link href="/contributor/editor" className="contributor-cta-button">Become a Contributor</Link>
        </div>
      </div>
    </section>
    <footer className="site-footer">
      <div className="blog-container site-footer-grid">
        <div className="site-footer-brand">
          <Link href="/" className="brand-logo footer-brand-logo" aria-label="Urban Stories – Go to homepage">
            <Image src="/branding/urban-stories-logo.svg" alt="Urban Stories" width={205} height={45} />
          </Link>
          <p>Stories beyond boundaries. Perspectives for curious minds.</p>
        </div>
        <div className="site-footer-newsletter">
          <h2>Stay in the Story.</h2>
          <p>Get fresh perspectives on technology, culture and travel delivered straight to your inbox.</p>
          <NewsletterForm />
        </div>
      </div>
      <div className="blog-container site-footer-bottom">
        <nav className="footer-bottom-links" aria-label="Footer navigation">
          {footerLinks.map((item: any) => item.external
            ? <a key={item.label} href={item.href} target="_blank" rel="noreferrer">{item.label}</a>
            : <Link key={item.label} href={item.href}>{item.label}</Link>)}
        </nav>
        <span>{footer?.copyrightText || settings?.copyrightText || "© 2026 Urban Stories. All rights reserved."}</span>
      </div>
    </footer>
  </>;
}
