"use client";
import {useEffect,useState} from "react";
import {SignInButton,SignedIn,SignedOut,useUser} from "@clerk/nextjs";
type Comment={_id:string;body:string;createdAt:string;authorName:string;authorImage?:string;clerkUserId:string};
export function Comments({articleId}:{articleId:string}){
 const [comments,setComments]=useState<Comment[]>([]);const [body,setBody]=useState("");const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);const {user}=useUser();
 async function load(){const r=await fetch("/api/community/comments?articleId="+encodeURIComponent(articleId));const j=await r.json();if(r.ok)setComments(j.comments||[]);else setMessage(j.error||"Comments are temporarily unavailable.");}
 useEffect(()=>{load()},[articleId]);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage("");const r=await fetch("/api/community/comments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({articleId,body})});const j=await r.json();if(r.ok){setBody("");await load()}else setMessage(j.error||"Unable to post comment.");setBusy(false);}
 async function remove(id:string){const r=await fetch("/api/community/comments/"+id,{method:"DELETE"});if(r.ok)await load();else setMessage("Unable to delete comment.");}
 return <section className="community-comments" id="comments"><h2>Comments <span>{comments.length}</span></h2><SignedIn><form onSubmit={submit}><textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Share your thoughts…" minLength={2} maxLength={2000} required/><button disabled={busy||!body.trim()}>{busy?"Posting…":"Post comment"}</button></form></SignedIn><SignedOut><p>Join the conversation.</p><SignInButton mode="modal"><button>Sign in to comment</button></SignInButton></SignedOut>{message&&<p role="status">{message}</p>}<div className="community-comment-list">{comments.map(c=><article key={c._id}><div><strong>{c.authorName}</strong><time>{new Date(c.createdAt).toLocaleString()}</time></div><p>{c.body}</p>{user?.id===c.clerkUserId&&<button onClick={()=>remove(c._id)}>Delete</button>}</article>)}</div></section>
}
