import {PortableText,type PortableTextComponents} from "@portabletext/react";
import Link from "next/link";
import {imageUrl} from "@/lib/sanity/image";
const components:PortableTextComponents={types:{image:({value})=><figure className="cms-inline-image"><img src={imageUrl(value,1200)} alt={value.alt||""}/>{value.caption&&<figcaption>{value.caption}</figcaption>}</figure>,youtubeVideo:({value})=><figure className="cms-video"><iframe src={value.url?.replace("watch?v=","embed/")} title={value.caption||"Embedded video"} allowFullScreen loading="lazy"/>{value.caption&&<figcaption>{value.caption}</figcaption>}</figure>},marks:{link:({children,value})=><a href={value?.href} target="_blank" rel="noreferrer">{children}</a>,internalLink:({children,value})=><Link href={value?.reference?.slug?"/article/"+value.reference.slug:"#"}>{children}</Link>}};
export function PortableContent({value}:{value:any[]}){return <PortableText value={value||[]} components={components}/>;}
