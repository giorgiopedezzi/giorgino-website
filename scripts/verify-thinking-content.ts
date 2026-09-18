import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { validateThinkingAuthoringUpdate } from "../src/content/thinking-authoring-validation";
import { getEditorialArticle, getThinkingContent, getTranslatedThinkingSlug, validateThinkingRepository } from "../src/content/thinking";
import { getLocalePath } from "../src/content/locale-routing";
import { richTextToPlainText } from "../src/content/rich-text";

const indexes = {
  en: { metadata: { title: "Thinking", description: "Introduction" }, label: "Thinking", heading: "Heading", introduction: "Introduction", entries: [{ discriminant: "article", value: { target: "paired-article", displayTitle: "Paired article", summary: "An excerpt." } }, { discriminant: "dialogues", value: { displayTitle: "Dialogues", summary: "Conversations." } }], articleLabels: { references: "References", relatedLinks: "Related reading" } },
  it: { metadata: { title: "Pensieri", description: "Introduzione" }, label: "Pensieri", heading: "Titolo", introduction: "Introduzione", entries: [{ discriminant: "article", value: { target: "articolo-abbinato", displayTitle: "Articolo abbinato", summary: "Un estratto." } }, { discriminant: "dialogues", value: { displayTitle: "Dialoghi", summary: "Conversazioni." } }], articleLabels: { references: "Riferimenti", relatedLinks: "Letture correlate" } },
};

const dialogues = {
  en: { metadata: { title: "Dialogues", description: "Introduction" }, label: "Dialogues", heading: "Heading", introduction: "Introduction", emptyLabel: "Empty", artifacts: [] },
  it: { metadata: { title: "Dialoghi", description: "Introduzione" }, label: "Dialoghi", heading: "Titolo", introduction: "Introduzione", emptyLabel: "Vuoto", artifacts: [] },
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
    () => validateThinkingRepository(indexes, dialogues, pairedArticles(overrides)),
    (error: unknown) => error instanceof Error && error.message.includes(evidence),
  );
}

const publicEnglishArticles = getThinkingContent("en").articles;
assert.deepEqual(publicEnglishArticles.map((entry) => entry.slug), ["the-humanities-belong-inside-the-ai-revolution"], "the public English index includes the one published repository article");
assert.ok(publicEnglishArticles.every((entry) => entry.status === "published"), "draft entries must not appear in the public English index");
assert.equal(getThinkingContent("it").articles.length, 0, "draft entries must not appear in the public Italian index");
assert.equal(getEditorialArticle("en", "the-tears-were-ours"), undefined, "draft detail entries must not be publicly readable");
assert.ok(getThinkingContent("en", true).articles.some((entry) => entry.status === "draft"), "draft preview must include English draft entries");
assert.equal(getEditorialArticle("en", "the-tears-were-ours", true)?.status, "draft", "draft preview must render draft detail entries");
assert.equal(getTranslatedThinkingSlug("en", "the-tears-were-ours", "it"), undefined, "locale switching must not expose an unpublished translation");
assert.equal(getLocalePath("/en/thinking/the-tears-were-ours", "it"), "/it/thinking");
assert.equal(getLocalePath("/en/thinking/unknown", "it"), "/it/thinking");
assert.equal(getLocalePath("/en/thinking/dialogues", "it"), "/it/thinking/dialogues");
assert.deepEqual(getThinkingContent("en").entries.map((entry) => entry.identity), ["thinking-article:the-humanities-belong-inside-the-ai-revolution", "thinking:dialogues"], "the curated public index keeps published targets and the specialized Dialogues child");
assert.ok(getThinkingContent("en", true).entries.some((entry) => entry.identity === "thinking-article:the-tears-were-ours"), "preview includes a curated draft target");
assert.equal(richTextToPlainText(getThinkingContent("en").heading), "Some notes worth leaving unfinished.", "the Thinking page title is migrated without visible changes");
assert.equal(richTextToPlainText(getThinkingContent("en").dialogues.heading), "Conversations worth keeping open.", "the Dialogues page title is migrated without visible changes");
assert.equal(richTextToPlainText(getThinkingContent("en").dialogues.introduction), "Reflections from real conversations, with their original artifacts.", "the Dialogues introduction is migrated without visible changes");

expectValidationFailure({ locale: "fr" }, "unsupported locale");
expectValidationFailure({ status: "scheduled" }, "unsupported status");
expectValidationFailure({ slug: "Not a valid slug" }, "lowercase URL slug");
expectValidationFailure({ translationKey: "Not a valid identity" }, "stable identity");
expectValidationFailure({ body: [{ type: "not-a-block" }] }, "unsupported block type");
expectValidationFailure({ body: [{ discriminant: "image", value: { src: "/thinking-media/example.png", alt: "" } }] }, "required for informative images");
expectValidationFailure({ body: [{ discriminant: "image", value: { src: "/thinking-media/example.png", alt: "Not empty", decorative: true } }] }, "must be empty when decorative");
expectValidationFailure({ body: [{ discriminant: "image", value: { src: "/thinking-media/example.png", alt: "Decorative", presentation: "720px" } }] }, "supported semantic presentation");
assert.deepEqual(
  validateThinkingRepository(indexes, dialogues, pairedArticles({ body: [{ discriminant: "image", value: { src: "/thinking-media/example.png", alt: "", decorative: true, presentation: "wide" } }] })).articles[0].body[0],
  { type: "image", src: "/thinking-media/example.png", alt: "", decorative: true, presentation: "wide" },
);
assert.deepEqual(
  validateThinkingRepository(indexes, dialogues, pairedArticles({ body: [{ discriminant: "paragraph", value: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "A rich paragraph." }] }] } }] })).articles[0].body[0],
  { type: "paragraph", text: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "A rich paragraph." }] }] } },
  "a Paragraph block saved by the editor must accept its Tiptap document directly",
);
expectValidationFailure({ body: [{ discriminant: "paragraph", value: "" }] }, "expected a non-empty string");
expectValidationFailure({ metadata: { title: "", description: "Description" } }, "metadata.title");
expectValidationFailure({ references: [{ label: "Unsafe", href: "javascript:alert(1)" }] }, "internal path or an http(s) URL");
expectValidationFailure({ relatedLinks: [{ label: "One", href: "/thinking" }, { label: "Two", href: "/thinking" }] }, "must not duplicate another link");
assert.doesNotThrow(
  () => validateThinkingRepository({ en: { ...indexes.en, entries: [] }, it: { ...indexes.it, entries: [] } }, dialogues, [pairedArticles()[0]]),
  "a locale-specific draft must be saveable before its translation is ready",
);
assert.throws(
  () => validateThinkingRepository({ en: { ...indexes.en, entries: [] }, it: { ...indexes.it, entries: [] } }, dialogues, [{ path: "en/articles/paired-article.json", value: article({ status: "published", publishedAt: "2026-09-17" }) }]),
  (error: unknown) => error instanceof Error && error.message.includes("every supported locale before publication"),
);

const reordered = validateThinkingRepository({
  en: { ...indexes.en, entries: [...indexes.en.entries].reverse() },
  it: indexes.it,
}, dialogues, pairedArticles());
assert.deepEqual(reordered.indexes.en.hub.entries.map((entry) => entry.kind), ["dialogues", "article"], "index entry collection order is preserved without a second order field");
const removed = validateThinkingRepository({ en: { ...indexes.en, entries: indexes.en.entries.slice(0, 1) }, it: indexes.it }, dialogues, pairedArticles());
assert.equal(removed.indexes.en.hub.entries.length, 1, "removing a curated index entry survives validation");

const editorialRenderer = readFileSync("src/components/thinking/EditorialSystem.tsx", "utf8");
const editorialStyles = readFileSync("src/components/thinking/EditorialSystem.module.css", "utf8");
assert.match(editorialRenderer, /block\.decorative \? "" : block\.alt/, "decorative images render with empty alt text");
assert.match(editorialStyles, /\.mediaWide/);
assert.match(editorialStyles, /\.mediaFull/);
assert.throws(
  () => validateThinkingRepository(indexes, {
    ...dialogues,
    en: {
      ...dialogues.en,
      artifacts: [{
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
