export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

const stripTags = (html: string) => html.replace(/<[^>]+>/g, " ");

/** URL-safe version of a title, e.g. "Learn Python Fast!" -> "learn-python-fast". */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Turns a post's raw HTML into what the article page renders:
 * headings get ids (and are collected for the table of contents),
 * and code blocks get a wrapper with a copy button.
 */
export function prepareArticle(rawHtml: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const used = new Set<string>();

  let html = rawHtml.replace(/<h([23])[^>]*>([\s\S]*?)<\/h\1>/g, (_match, level: string, inner: string) => {
    const text = stripTags(inner).replace(/\s+/g, " ").trim();
    const base = slugify(text) || "section";
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    toc.push({ id, text, level: Number(level) as 2 | 3 });
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });

  html = html.replace(
    /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/g,
    (_match, code: string) =>
      `<div class="code-block"><button type="button" class="code-copy" data-copy>Copy</button><pre><code>${code.trim()}</code></pre></div>`
  );

  return { html, toc };
}

/** Estimated reading time at 200 words per minute, e.g. "5 min read". */
export function readingTime(html: string): string {
  const words = stripTags(html).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

/** ISO date for <time dateTime> from a display date such as "Oct 5, 2024". */
export function isoDate(displayDate: string): string {
  const parsed = new Date(displayDate);
  return Number.isNaN(parsed.getTime()) ? displayDate : parsed.toISOString().slice(0, 10);
}
