import assert from "node:assert/strict";

import { validateThinkingAuthoringUpdate } from "../src/content/thinking-authoring-validation";
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
expectValidationFailure({ body: [{ discriminant: "image", value: { src: "/thinking-media/example.png", alt: "" } }] }, "expected a non-empty string");
expectValidationFailure({ body: [{ discriminant: "paragraph", value: "" }] }, "expected a non-empty string");
assert.throws(
  () => validateThinkingRepository(indexes, [pairedArticles()[0]]),
  (error: unknown) => error instanceof Error && error.message.includes("every supported locale"),
);
assert.throws(
  () => validateThinkingRepository({
    ...indexes,
    en: {
      ...indexes.en,
      dialogueArtifacts: [{
        discriminant: "dialogueArtifact",
        value: { screenshot: "/thinking-media/dialogue.png", alt: "A dialogue screenshot", line: "A short line", href: "javascript:alert(1)" },
      }],
    },
  }, pairedArticles()),
  (error: unknown) => error instanceof Error && error.message.includes("internal path or an http(s) URL"),
);
assert.throws(
  () => validateThinkingAuthoringUpdate({ additions: [{ path: "src/content/home.ts", contents: "" }], deletions: [] }),
  (error: unknown) => error instanceof Error && error.message.includes("outside the Thinking content and media directories"),
);
assert.throws(
  () => validateThinkingAuthoringUpdate({
    additions: [{
      path: "src/content/thinking/en/articles/the-tears-were-ours.json",
      contents: Buffer.from(JSON.stringify(article({ slug: "signal-noise-and-plausible-answers" }))).toString("base64url"),
    }],
    deletions: [],
  }),
  (error: unknown) => error instanceof Error && error.message.includes("duplicate slug"),
);

console.log("Verified Thinking content loading, draft exclusion, translation-key routing, Keystatic block mapping, and guarded authoring updates.");
