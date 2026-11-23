"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Category = { _id: string; name: string };
type PortableBlock = { _type: "block"; _key: string; style: "normal" | "h2" | "h3" | "h4" | "blockquote"; listItem?: "bullet" | "number"; level?: number; markDefs: { _key: string; _type: "link"; href: string }[]; children: { _type: "span"; _key: string; text: string; marks: string[] }[] };
type PortableImage = { _type: "image"; _key: string; asset: { _type: "reference"; _ref: string; url?: string }; alt: string; caption?: string };
type PortableNode = PortableBlock | PortableImage;
type FeaturedImage = { assetId: string; url: string; alt: string; caption?: string } | null;
type InitialArticle = { _id: string; title: string; excerpt: string; categoryId: string; body: PortableNode[]; featuredImage?: { asset?: { _id: string; url: string }; alt?: string; caption?: string } };

const key = () => Math.random().toString(36).slice(2, 11);
function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!); }
function portableTextToHtml(nodes: PortableNode[] = []) {
  return nodes.map((node) => {
    if (node._type === "image") return node.asset.url ? `<p><img src="${escapeHtml(node.asset.url)}" data-asset-id="${escapeHtml(node.asset._ref)}" alt="${escapeHtml(node.alt)}" data-caption="${escapeHtml(node.caption || "")}" style="max-width:100%;height:auto" /></p>` : `<p><em>[Embedded image: ${escapeHtml(node.alt)}]</em></p>`;
    const text = node.children.map((span) => {
      let value = escapeHtml(span.text);
      if (span.marks.includes("strong")) value = `<strong>${value}</strong>`;
      if (span.marks.includes("em")) value = `<em>${value}</em>`;
      if (span.marks.includes("underline")) value = `<u>${value}</u>`;
      const link = node.markDefs.find((mark) => span.marks.includes(mark._key));
      if (link) value = `<a href="${escapeHtml(link.href)}">${value}</a>`;
      return value;
    }).join("");
    const tag = node.style === "h2" ? "h2" : node.style === "h3" ? "h3" : node.style === "h4" ? "h4" : node.style === "blockquote" ? "blockquote" : "p";
    return node.listItem ? `<${node.listItem === "bullet" ? "ul" : "ol"}><li>${text}</li></${node.listItem === "bullet" ? "ul" : "ol"}>` : `<${tag}>${text}</${tag}>`;
  }).join("") || "<p></p>";
}
function htmlToPortableText(html: string): PortableNode[] {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const output: PortableNode[] = [];
  const walkBlock = (element: HTMLElement, listItem?: "bullet" | "number") => {
    const markDefs: PortableBlock["markDefs"] = [];
    const children: PortableBlock["children"] = [];
    const walk = (node: Node, marks: string[] = []) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        if (text) children.push({ _type: "span", _key: key(), text, marks });
        return;
      }
      if (!(node instanceof HTMLElement)) return;
      const next = [...marks];
      if (node.tagName === "STRONG" || node.tagName === "B") next.push("strong");
      if (node.tagName === "EM" || node.tagName === "I") next.push("em");
      if (node.tagName === "U") next.push("underline");
      if (node.tagName === "A") {
        const href = node.getAttribute("href") || "";
        try { const safe = new URL(href); if (["http:", "https:"].includes(safe.protocol)) { const markKey = key(); markDefs.push({ _key: markKey, _type: "link", href: safe.toString() }); next.push(markKey); } } catch { /* discard invalid links */ }
      }
      node.childNodes.forEach((child) => walk(child, next));
    };
    element.childNodes.forEach((child) => walk(child));
    if (children.length) {
      const styleMap: Record<string, PortableBlock["style"]> = { H2: "h2", H3: "h3", H4: "h4", BLOCKQUOTE: "blockquote" };
      output.push({ _type: "block", _key: key(), style: styleMap[element.tagName] || "normal", ...(listItem ? { listItem, level: 1 } : {}), markDefs, children });
    }
  };
  for (const element of Array.from(parsed.body.children)) {
    if (!(element instanceof HTMLElement)) continue;
    const embedded = element.querySelector("img[data-asset-id]");
    if (embedded) {
      const assetId = embedded.getAttribute("data-asset-id") || "";
      const alt = embedded.getAttribute("alt") || "";
      if (assetId && alt) output.push({ _type: "image", _key: key(), asset: { _type: "reference", _ref: assetId }, alt, caption: embedded.getAttribute("data-caption") || "" });
      continue;
    }
    if (element.tagName === "UL" || element.tagName === "OL") {
      const listItem = element.tagName === "UL" ? "bullet" : "number";
      Array.from(element.children).filter((child): child is HTMLElement => child instanceof HTMLElement && child.tagName === "LI").forEach((item) => walkBlock(item, listItem));
    } else walkBlock(element);
  }
  return output;
}

export function ArticleEditor({ categories, userId, initialArticle }: { categories: Category[]; userId: string; initialArticle?: InitialArticle }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inlineFileRef = useRef<HTMLInputElement>(null);
  const articleId = useRef<string | null>(initialArticle?._id || null);
  const [title, setTitle] = useState(initialArticle?.title || "");
  const [excerpt, setExcerpt] = useState(initialArticle?.excerpt || "");
  const [categoryId, setCategoryId] = useState(initialArticle?.categoryId || "");
  const [featuredImage, setFeaturedImage] = useState<FeaturedImage>(initialArticle?.featuredImage?.asset?._id ? { assetId: initialArticle.featuredImage.asset._id, url: initialArticle.featuredImage.asset.url, alt: initialArticle.featuredImage.alt || "", caption: initialArticle.featuredImage.caption } : null);
  const [message, setMessage] = useState("Your work is saved only when you choose Save Draft.");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [inlineUploading, setInlineUploading] = useState(false);
  const [bodyReady, setBodyReady] = useState(false);
  const bodyNodes = useMemo(() => initialArticle?.body || [], [initialArticle]);

  useEffect(() => { if (editorRef.current && !bodyReady) { editorRef.current.innerHTML = portableTextToHtml(bodyNodes); setBodyReady(true); } }, [bodyNodes, bodyReady]);

  function format(command: string, value?: string) { editorRef.current?.focus(); document.execCommand(command, false, value); }
  function addLink() { const href = window.prompt("Enter the full https:// link"); if (href) { try { const parsed = new URL(href); if (["https:", "http:"].includes(parsed.protocol)) format("createLink", parsed.toString()); else setMessage("Please use a valid http or https link."); } catch { setMessage("Please enter a valid link."); } } }

  async function uploadFeatured(file?: File) {
    if (!file) return;
    setUploading(true); setMessage("");
    try {
      const form = new FormData(); form.append("file", file);
      const response = await fetch("/api/contributor/assets", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Image upload failed.");
      setFeaturedImage({ assetId: result.asset._id, url: result.asset.url, alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "), caption: "" });
      setMessage("Featured image uploaded. Add descriptive alt text before saving.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Image upload failed."); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  async function uploadInline(file?: File) {
    if (!file) return;
    const alt = window.prompt("Describe this image for accessibility")?.trim();
    if (!alt) { setMessage("Inline image upload cancelled. Alt text is required."); return; }
    setInlineUploading(true);
    try {
      const form = new FormData(); form.append("file", file);
      const response = await fetch("/api/contributor/assets", { method: "POST", body: form });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "Image upload failed.");
      editorRef.current?.focus();
      document.execCommand("insertHTML", false, `<p><img src="${escapeHtml(result.asset.url)}" data-asset-id="${escapeHtml(result.asset._id)}" alt="${escapeHtml(alt)}" data-caption="" style="max-width:100%;height:auto" /></p><p><br></p>`);
      setMessage("Image added to your article content.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Image upload failed."); }
    finally { setInlineUploading(false); if (inlineFileRef.current) inlineFileRef.current.value = ""; }
  }

  async function persist(status: "draft" | "pendingReview") {
    const body = htmlToPortableText(editorRef.current?.innerHTML || "");
    const textLength = body.filter((node): node is PortableBlock => node._type === "block").flatMap((node) => node.children).reduce((sum, span) => sum + span.text.trim().length, 0);
    if (status === "pendingReview" && (!title.trim() || !excerpt.trim() || !categoryId || !featuredImage || textLength < 100)) { setMessage("Before submitting, add a title, description, category, featured image and at least 100 characters of article content."); return; }
    if (status === "draft" && !title.trim()) { setMessage("Add a title before saving your draft."); return; }
    if (featuredImage && featuredImage.alt.trim().length < 3) { setMessage("Please add meaningful alt text for the featured image."); return; }
    setBusy(true); setMessage("");
    try {
      const payload = { title, excerpt, categoryId, body, featuredImage: featuredImage ? { assetId: featuredImage.assetId, alt: featuredImage.alt, caption: featuredImage.caption } : null, status };
      const response = await fetch(articleId.current ? `/api/contributor/articles/${articleId.current}` : "/api/contributor/articles", { method: articleId.current ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save article.");
      articleId.current = result.article?._id || articleId.current || result.id;
      setMessage(status === "pendingReview" ? "Your article has been submitted for editorial review." : "Draft saved successfully.");
      if (status === "pendingReview") window.location.assign("/contributor/dashboard?submitted=1");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save article."); }
    finally { setBusy(false); }
  }

  return <div className="article-editor-form" data-contributor={userId}>
    <div className="editor-field"><label htmlFor="article-title">Title</label><input id="article-title" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="Give your story a clear title" /></div>
    <div className="editor-field"><label htmlFor="article-excerpt">Description</label><textarea id="article-excerpt" value={excerpt} maxLength={240} onChange={(e) => setExcerpt(e.target.value)} placeholder="A short summary that helps readers understand your story" rows={3} /><small>{excerpt.length}/240 characters</small></div>
    <div className="editor-field"><label htmlFor="article-category">Category</label><select id="article-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}><option value="">Select a category</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></div>
    <div className="editor-field"><label>Featured image</label><div className="featured-image-upload">{featuredImage ? <div className="featured-image-preview"><img src={featuredImage.url} alt={featuredImage.alt || "Featured image preview"} /><button type="button" onClick={() => setFeaturedImage(null)}>Remove image</button></div> : <button type="button" className="image-picker" onClick={() => fileRef.current?.click()} disabled={uploading}>{uploading ? "Uploading…" : "＋ Upload featured image"}<small>JPG, PNG, WebP or AVIF · up to 8 MB</small></button>}<input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(e) => uploadFeatured(e.target.files?.[0])} /></div>{featuredImage && <><input aria-label="Featured image alt text" value={featuredImage.alt} onChange={(e) => setFeaturedImage({ ...featuredImage, alt: e.target.value })} placeholder="Describe the image for accessibility" /><input aria-label="Image caption" value={featuredImage.caption || ""} onChange={(e) => setFeaturedImage({ ...featuredImage, caption: e.target.value })} placeholder="Image caption (optional)" /></>}</div>
    <div className="editor-field"><label>Article content</label><div className="portable-toolbar" role="toolbar" aria-label="Article formatting"><button type="button" onClick={() => format("bold")}><strong>B</strong></button><button type="button" onClick={() => format("italic")}><em>I</em></button><button type="button" onClick={() => format("underline")}><u>U</u></button><button type="button" onClick={() => format("formatBlock", "<h2>")}>H2</button><button type="button" onClick={() => format("formatBlock", "<h3>")}>H3</button><button type="button" onClick={() => format("insertUnorderedList")}>• List</button><button type="button" onClick={() => format("insertOrderedList")}>1. List</button><button type="button" onClick={() => format("formatBlock", "<blockquote>")}>Quote</button><button type="button" onClick={addLink}>Link</button><button type="button" onClick={() => inlineFileRef.current?.click()} disabled={inlineUploading}>{inlineUploading ? "Uploading…" : "Image"}</button><input ref={inlineFileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(e) => uploadInline(e.target.files?.[0])} /></div><div ref={editorRef} className="portable-editor-surface" contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" aria-label="Article content editor" data-placeholder="Start writing your story…" /></div>
    <p className="editor-status" aria-live="polite">{message}</p>
    <div className="editor-actions"><Link href="/contributor/dashboard">Back to dashboard</Link><div><button type="button" className="button-secondary" onClick={() => persist("draft")} disabled={busy || uploading}>{busy ? "Saving…" : "Save Draft"}</button><button type="button" className="button-primary" onClick={() => persist("pendingReview")} disabled={busy || uploading}>{busy ? "Saving…" : "Submit for Review"}</button></div></div>
  </div>;
}
