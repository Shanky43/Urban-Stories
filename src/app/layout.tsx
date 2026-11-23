import type {Metadata} from "next";
export const instant = false;
import {sanityFetch} from "@/lib/sanity/client";
import {SITE_QUERY} from "@/lib/sanity/queries";
import type {SiteSettings} from "@/lib/sanity/types";
import "./globals.css";
import {AuthProvider} from "@/lib/auth/clerk-provider";

export async function generateMetadata():Promise<Metadata>{
 const settings=await sanityFetch<SiteSettings>({query:SITE_QUERY,tags:["settings"]});
 const title=settings?.defaultSeoTitle||settings?.siteName||"Urban Stories";
 const description=settings?.defaultSeoDescription||settings?.description;
 const image=settings?.defaultSocialImage?.asset?.url;
 return {title:{default:title,template:"%s | "+(settings?.siteName||"Urban Stories")},description,applicationName:settings?.siteName,icons:settings?.favicon?.asset?.url?{icon:settings.favicon.asset.url}:undefined,openGraph:{type:"website",siteName:settings?.siteName,title,description,images:image?[image]:undefined},twitter:{card:"summary_large_image",title,description,images:image?[image]:undefined}};
}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><AuthProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>{children}</AuthProvider></body></html>}
