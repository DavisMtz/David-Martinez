import { marked } from "marked";

marked.use({ gfm: true, breaks: true });

/** Render trusted (admin-authored) Markdown to HTML. */
export function renderMarkdown(source: string | null | undefined): string {
  if (!source) return "";
  return marked.parse(source, { async: false }) as string;
}

/** Strip markdown to plain text (for meta descriptions). */
export function plainText(source: string | null | undefined, max = 160): string {
  if (!source) return "";
  const text = source
    .replace(/[#*_`>\[\]()!-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
}
