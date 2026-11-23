import {createImageUrlBuilder} from "@sanity/image-url";
import {sanityClient} from "./client";
const builder=createImageUrlBuilder(sanityClient);
export function imageUrl(source:unknown,width=1400){try{return builder.image(source as never).width(width).auto("format").url()}catch{return undefined}}
