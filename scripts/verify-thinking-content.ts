import assert from "node:assert/strict";

import { getEditorialArticle, getThinkingContent, getTranslatedThinkingSlug, validateThinkingRepository } from "../src/content/thinking";
import { getLocalePath } from "../src/content/locale-routing";

const indexes = {
  en: { label: "Thinking", heading: "Heading", introduction: "Introduction", dialogueArtifacts: [] },
  it: { label: "Pensieri", heading: "Titolo", introduction: "Introduzione", dialogueArtifacts: [] },
};

function article(overrides: Record<string, unknown> = {}) {
  return {
    translationKey: "paired-article",
    locale: "en",
    slug: "paired-article",
    title: "Paired article",
    excerpt: "An excerpt.",
    publishedAt: null,
    status: "draft",
    order: 1,
    body: [],
    ...overrides,
  };
}

function pairedArticles(overrides: Record<string, unknown> = {}) {
  return [
    { path: "en/articles/paired-article.json", value: article(overrides) },
    { path: "it/articles/articolo-abbinato.json", value: article({ locale: "it", slug: "articolo-abbinato", title: "Articolo abbinato", ...overrides }) },
  ];
}

function expectValidationFailure(overrides: Record<string, unknown>, evidence: string) {
  assert.throws(
    () => validateThinkingRepository(indexes, pairedArticles(overrides)),
    (error: unknown) => error instanceof Error && error.message.includes(evidence),
  );
}

assert.equal(getThinkingContent("en").articles.length, 0, "draft entries must not appear in the public English index");
assert.equal(getThinkingContent("it").articles.length, 0, "draft entries must not appear in the public Italian index");
assert.equal(getEditorialArticle("en", "the-tears-were-ours"), undefined, "draft detail entries must not be publicly readable");
assert.equal(getTranslatedThinkingSlug("en", "the-tears-were-ours", "it"), "le-lacrime-erano-nostre");
assert.equal(getLocalePath("/en/thinking/the-tears-were-ours", "it"), "/it/thinking/le-lacrime-erano-nostre");
assert.equal(getLocalePath("/en/thinking/unknown", "it"), "/it/thinking");

expectValidationFailure({ locale: "fr" }, "unsupported locale");
expectValidationFailure({ status: "scheduled" }, "unsupported status");
expectValidationFailure({ slug: "Not a valid slug" }, "lowercase URL slug");
expectValidationFailure({ translationKey: "Not a valid identity" }, "stable identity");
expectValidationFailure({ body: [{ type: "not-a-block" }] }, "unsupported block type");
assert.throws(
  () => validateThinkingRepository(indexes, [pairedArticles()[0]]),
  (error: unknown) => error instanceof Error && error.message.includes("every supported locale"),
);

console.log("Verified Thinking content loading, draft exclusion, translation-key routing, and actionable schema validation.");
