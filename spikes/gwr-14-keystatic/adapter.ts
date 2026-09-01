import type { Entry } from "@keystatic/core/reader";

import type { EditorialArticle, EditorialBlock } from "../../src/content/types";
import keystaticConfig from "./keystatic.config";

type ProofArticleEntry = Entry<(typeof keystaticConfig.collections)["proofArticles"]>;

export function toEditorialArticle(slug: string, entry: ProofArticleEntry): EditorialArticle {
  return {
    slug,
    title: entry.title,
    locale: entry.locale,
    excerpt: entry.excerpt,
    status: entry.status,
    publishedAt: entry.publishedAt || undefined,
    body: entry.body.map(toEditorialBlock),
    references: [],
    relatedLinks: [],
  };
}

function toEditorialBlock(block: ProofArticleEntry["body"][number]): EditorialBlock {
  switch (block.discriminant) {
    case "paragraph":
      return { type: "paragraph", text: block.value };
    case "heading":
      return { type: "heading", text: block.value };
    case "quote":
      return {
        type: "quote",
        text: block.value.text,
        attribution: block.value.attribution || undefined,
      };
    case "note":
      return { type: "note", text: block.value };
  }
}
