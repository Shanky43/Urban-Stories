"use client";
import {useState} from "react";
export function NewsletterForm(){
 const [email,setEmail]=useState("");const [message,setMessage]=useState("");const [error,setError]=useState(false);const [busy,setBusy]=useState(false);
 async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setMessage("");setError(false);try{const response=await fetch("/api/newsletter",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});const result=await response.json();if(!response.ok)throw new Error(result.error||"We couldn't process your subscription.");setMessage(result.message||"Please check your inbox to confirm your subscription.");setEmail("");}catch(e){setError(true);setMessage(e instanceof Error?e.message:"Something went wrong. Please try again.");}finally{setBusy(false);}}
 return <form className="footer-newsletter-form" onSubmit={submit}>
  <label className="sr-only" htmlFor="footer-newsletter-email">Email address</label><div className="footer-newsletter-controls"><input id="footer-newsletter-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email address"/><button type="submit" disabled={busy}>{busy?"Submitting…":"Subscribe"}</button></div>
  <small>No spam. Unsubscribe anytime.</small>{message&&<p className={error?"newsletter-feedback is-error":"newsletter-feedback"} role="status">{message}</p>}
 </form>
}
