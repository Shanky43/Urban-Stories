"use client";

import { useEffect, useRef, useState } from "react";

type Category = { _id: string; name: string };
type EditorValues = { title: string; excerpt: string; categoryId: string; body: string };

export function ArticleEditor({ categories }: { categories: Category[]; userId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const articleId = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valuesRef = useRef<EditorValues>({ title: "", excerpt: "", categoryId: "", body: "" });
  const [message, setMessage] = useState("Your work is saved manually or automatically as a draft.");
  const [busy, setBusy] = useState(false);
  const [values, setValues] = useState<EditorValues>({ title: "", excerpt: "", categoryId: "", body: "" });

  async function persist(nextValues: EditorValues, status: "draft" | "pendingReview", quiet = false) {
    if (!nextValues.title.trim() || !nextValues.excerpt.trim() || !nextValues.categoryId || nextValues.body.trim().length < 100) {
      if (!quiet) setMessage("Add a title, description, category and at least 100 characters before saving.");
      return false;
    }
    setBusy(true);
    if (!quiet) setMessage("");
    try {
      const response = await fetch(articleId.current ? `/api/contributor/articles/${articleId.current}` : "/api/community/articles", {
        method: articleId.current ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...nextValues, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save article.");
      if (result.article?._id) articleId.current = result.article._id;
      if (result.id) articleId.current = result.id;
      setMessage(status === "pendingReview" ? "Submitted for editorial review." : "Draft saved.");
      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save article.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function update(field: keyof EditorValues, value: string) {
    const nextValues = { ...valuesRef.current, [field]: value };
    valuesRef.current = nextValues;
    setValues(nextValues);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { void persist(nextValues, "draft", true); }, 1600);
  }

  return (
    <form ref={formRef} className="community-form" onSubmit={(event) => { event.preventDefault(); void persist(valuesRef.current, "draft"); }}>
      <label>Article title<input name="title" required maxLength={120} value={values.title} onChange={(event) => update("title", event.target.value)} /></label>
      <label>Short description<textarea name="excerpt" required maxLength={240} value={values.excerpt} onChange={(event) => update("excerpt", event.target.value)} /></label>
      <label>Primary category<select name="categoryId" required value={values.categoryId} onChange={(event) => update("categoryId", event.target.value)}><option value="">Select category</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label>
      <label>Article content<textarea name="body" required minLength={100} rows={18} value={values.body} onChange={(event) => update("body", event.target.value)} placeholder="Write your story here… Separate paragraphs with a blank line." /></label>
      <p className="community-muted">Drafts autosave to Sanity after a short pause. Content is currently stored as paragraph-based Portable Text; rich formatting, media upload and live preview remain outstanding.</p>
      <div className="community-editor-actions">
        <button type="submit" disabled={busy}>{busy ? "Saving…" : "Save draft"}</button>
        <button type="button" disabled={busy} onClick={() => void persist(valuesRef.current, "pendingReview")}>{busy ? "Saving…" : "Submit for review"}</button>
      </div>
      {message && <p role="status" aria-live="polite">{message}</p>}
    </form>
  );
}
