"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import type {Article} from "@/lib/sanity/types";
import {ArticleCard} from "@/components/cms/article-card";
type Cursor={lastPublishedAt:string;lastId:string};
export default function BlogPagination({initialArticles,initialHasMore,initialCursor}:{initialArticles:Article[];initialHasMore:boolean;initialCursor:Cursor|null}){
 const [articles,setArticles]=useState(initialArticles),[hasMore,setHasMore]=useState(initialHasMore),[cursor,setCursor]=useState<Cursor|null>(initialCursor),[loading,setLoading]=useState(false),[error,setError]=useState("");
 const sentinel=useRef<HTMLDivElement|null>(null),loadingRef=useRef(false);
 const loadMore=useCallback(async()=>{
  if(loadingRef.current||!hasMore||!cursor)return;
  loadingRef.current=true;setLoading(true);setError("");
  try{
   const params=new URLSearchParams({lastPublishedAt:cursor.lastPublishedAt,lastId:cursor.lastId});
   const response=await fetch("/api/blogs?"+params.toString(),{cache:"no-store"});
   if(!response.ok)throw new Error("Unable to load more stories.");
   const result:{articles:Article[];hasMore:boolean;nextCursor:Cursor|null}=await response.json();
   setArticles(current=>{const seen=new Set(current.map(article=>article._id));return [...current,...result.articles.filter(article=>!seen.has(article._id))]});
   setHasMore(result.hasMore);setCursor(result.nextCursor);
  }catch(e){setError(e instanceof Error?e.message:"Something went wrong. Please try again.");}
  finally{loadingRef.current=false;setLoading(false);}
 },[cursor,hasMore]);
 useEffect(()=>{
  const node=sentinel.current;if(!node||!hasMore)return;
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting))void loadMore();},{rootMargin:"500px 0px"});
  observer.observe(node);return()=>observer.disconnect();
 },[hasMore,loadMore]);
 return <><div className="cms-article-grid blogs-pagination-grid">{articles.map(article=><ArticleCard key={article._id} article={article}/>)}</div>
  {loading&&<p className="blogs-loading" role="status" aria-live="polite">Loading more stories...</p>}
  {error&&<div className="blogs-pagination-error" role="alert"><p>{error}</p><button type="button" onClick={()=>void loadMore()}>Retry</button></div>}
  {hasMore&&<div className="blogs-pagination-controls"><button type="button" onClick={()=>void loadMore()} disabled={loading}>{loading?"Loading...":"Load More"}</button><div ref={sentinel} className="blogs-scroll-sentinel" aria-hidden="true"/></div>}
  {!hasMore&&articles.length>0&&<p className="blogs-end-message">You&apos;ve reached the end of the stories.</p>}
 </>;
}
