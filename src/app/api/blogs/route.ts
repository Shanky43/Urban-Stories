import {NextRequest,NextResponse} from "next/server";
import {sanityFetch} from "@/lib/sanity/client";
import {ARTICLE_CURSOR_QUERY,ARTICLE_PAGE_QUERY} from "@/lib/sanity/queries";
import type {Article} from "@/lib/sanity/types";
const PAGE_SIZE=10;
export async function GET(request:NextRequest){
 const lastPublishedAt=request.nextUrl.searchParams.get("lastPublishedAt");
 const lastId=request.nextUrl.searchParams.get("lastId");
 if(Boolean(lastPublishedAt)!==Boolean(lastId))return NextResponse.json({error:"A complete pagination cursor is required."},{status:400});
 const rows=await sanityFetch<Article[]>({query:lastPublishedAt?ARTICLE_CURSOR_QUERY:ARTICLE_PAGE_QUERY,params:lastPublishedAt?{lastPublishedAt,lastId}:{},tags:["articles"]});
 if(!rows)return NextResponse.json({error:"Stories are temporarily unavailable. Please try again."},{status:503});
 const hasMore=rows.length>PAGE_SIZE,articles=rows.slice(0,PAGE_SIZE),last=articles.at(-1);
 return NextResponse.json({articles,hasMore,nextCursor:hasMore&&last?{lastPublishedAt:last.publishedAt,lastId:last._id}:null},{headers:{"Cache-Control":"private, no-store"}});
}
