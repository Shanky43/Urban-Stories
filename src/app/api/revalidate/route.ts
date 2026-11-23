import {revalidateTag} from "next/cache";
import {NextRequest,NextResponse} from "next/server";
export async function POST(request:NextRequest){
 const secret=process.env.SANITY_REVALIDATE_SECRET;
 if(!secret||request.headers.get("x-sanity-secret")!==secret)return NextResponse.json({message:"Unauthorized"},{status:401});
 const body=await request.json().catch(()=>({}));
 const type=body?._type as string|undefined;
 const slug=body?.slug?.current as string|undefined;
 revalidateTag("sanity","max");
 if(type==="article")revalidateTag("articles","max");
 if(type==="category")revalidateTag("categories","max");
 if(type==="homePage")revalidateTag("homepage","max");
 if(type==="siteSettings")revalidateTag("settings","max");
 if(type==="navigation")revalidateTag("navigation","max");
 if(type==="siteFooter")revalidateTag("footer","max");
 if(slug)revalidateTag(type+":"+slug,"max");
 return NextResponse.json({revalidated:true});
}
