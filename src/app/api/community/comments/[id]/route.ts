import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {getUserAccess} from "@/lib/auth/roles";
import {getWriteClient} from "@/lib/sanity/write-client";
import {apiError} from "@/lib/community/http";
const bodySchema=z.object({body:z.string().trim().min(2).max(2000)});
export async function PATCH(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 try{const access=await getUserAccess();if(!access.userId)throw new Error("UNAUTHENTICATED");const {id}=await params;const {body}=bodySchema.parse(await request.json());const client=getWriteClient();const doc=await client.fetch('*[_type=="comment" && _id==$id][0]{_id,clerkUserId,status}',{id});if(!doc) return NextResponse.json({error:"Not found"},{status:404});if(doc.clerkUserId!==access.userId&&access.role!=="admin")throw new Error("FORBIDDEN");await client.patch(id).set({body,updatedAt:new Date().toISOString()}).commit();return NextResponse.json({ok:true});}catch(e){return apiError(e);}
}
export async function DELETE(_:NextRequest,{params}:{params:Promise<{id:string}>}){
 try{const access=await getUserAccess();if(!access.userId)throw new Error("UNAUTHENTICATED");const {id}=await params;const client=getWriteClient();const doc=await client.fetch('*[_type=="comment" && _id==$id][0]{_id,clerkUserId}',{id});if(!doc)return NextResponse.json({error:"Not found"},{status:404});if(doc.clerkUserId!==access.userId&&access.role!=="admin")throw new Error("FORBIDDEN");await client.patch(id).set({status:"deleted",updatedAt:new Date().toISOString()}).commit();return NextResponse.json({ok:true});}catch(e){return apiError(e);}
}
