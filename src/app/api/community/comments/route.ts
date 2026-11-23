import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {getUserAccess} from "@/lib/auth/roles";
import {getWriteClient} from "@/lib/sanity/write-client";
import {apiError} from "@/lib/community/http";
const schema=z.object({articleId:z.string().min(1),body:z.string().trim().min(2).max(2000)});
export async function GET(request:NextRequest){
 try{const id=request.nextUrl.searchParams.get("articleId");if(!id)return NextResponse.json({error:"articleId required"},{status:400});const client=getWriteClient();const comments=await client.fetch('*[_type=="comment" && article._ref==$id && status=="visible"]|order(createdAt desc)[0...100]{_id,body,createdAt,authorName,authorImage,clerkUserId}',{id});return NextResponse.json({comments});}catch(e){return apiError(e);}
}
export async function POST(request:NextRequest){
 try{const access=await getUserAccess();if(!access.userId||!access.profile)throw new Error("UNAUTHENTICATED");const data=schema.parse(await request.json());const client=getWriteClient();const article=await client.fetch('*[_type=="article" && _id==$id && status=="published"][0]{_id}',{id:data.articleId});if(!article) return NextResponse.json({error:"Article not found"},{status:404});const user=access.profile;const doc=await client.create({_type:"comment",article:{_type:"reference",_ref:data.articleId},clerkUserId:access.userId,authorName:[user.firstName,user.lastName].filter(Boolean).join(" ")||"Reader",authorImage:user.imageUrl,body:data.body,createdAt:new Date().toISOString(),status:"visible"});return NextResponse.json({comment:{_id:doc._id}},{status:201});}catch(e){return apiError(e);}
}
