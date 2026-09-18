import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getAboutIndex, resolveAboutIndexFromRepository } from "../src/content/about-index";
import { validateEditorialHubSource } from "../src/content/editorial-hub";
import { getLocalePath } from "../src/content/locale-routing";
import type { Locale } from "../src/content/locales";
import type { StandardPage } from "../src/content/standard-pages";

function page(locale: Locale, slug: string, translationKey: string, status: "draft" | "published" = "published"): StandardPage {
  return {
    slug,
    locale,
    translationKey,
    title: locale === "en" ? "Field notes" : "Appunti",
    metadata: { title: "Field notes", description: "A useful fallback summary." },
    status,
    navigationLabel: "Field notes",
    showInNavigation: false,
    navigationOrder: 1,
    sections: [],
  };
}

const source = validateEditorialHubSource({
  metadata: { title: "About", description: "About index" },
  label: "About",
  heading: "Choose a thread.",
  introduction: null,
  entries: [
    { discriminant: "reallyAboutMe", value: { displayTitle: "Really About Me", summary: "Personal." } },
    { discriminant: "standardPage", value: { target: "field-notes", displayTitle: "Selected field notes" } },
    { discriminant: "standardPage", value: { target: "draft-page", displayTitle: "Draft page" } },
  ],
}, "en/about-index.json");
const pages = [page("en", "field-notes", "field-notes"), page("en", "draft-page", "draft-page", "draft")];
const publicHub = resolveAboutIndexFromRepository(source, "en", pages);
assert.deepEqual(publicHub.entries.map((entry) => entry.identity), ["about:really-about-me", "standard-page:field-notes"], "unpublished targets are not exposed by public indexes");
assert.equal(publicHub.entries[1].title, "Selected field notes", "the index owns its display title independently from the child page");
assert.equal(publicHub.entries[1].summary, "A useful fallback summary.", "a standard page description is the summary fallback");
assert.equal(resolveAboutIndexFromRepository(source, "en", pages, true).entries.length, 3, "preview can include curated draft targets");

const reordered = { ...source, entries: [...source.entries].reverse() };
assert.deepEqual(resolveAboutIndexFromRepository(reordered, "en", pages, true).entries.map((entry) => entry.title), ["Draft page", "Selected field notes", "Really About Me"], "entry array order is the only index order");
assert.equal(resolveAboutIndexFromRepository({ ...source, entries: source.entries.slice(0, 1) }, "en", pages, true).entries.length, 1, "entries can be removed without a fixed slot model");

const translatedSource = validateEditorialHubSource({ ...source, entries: [{ discriminant: "standardPage", value: { target: "appunti", displayTitle: "Appunti scelti" } }] }, "it/about-index.json");
const translatedEntry = resolveAboutIndexFromRepository(translatedSource, "it", [page("it", "appunti", "field-notes")]).entries[0];
assert.equal(translatedEntry.identity, "standard-page:field-notes", "standard-page targets keep the same identity across locales");
assert.equal(translatedEntry.href, "/it/appunti");
assert.equal(getLocalePath("/en/boring-about-me", "it"), "/it", "a missing repository translation safely falls back instead of inventing a route");
assert.equal(getLocalePath("/en/about", "it"), "/it/about");
assert.equal(getLocalePath("/en/really-about-me", "it"), "/it/really-about-me");

const englishAbout = getAboutIndex("en");
const italianAbout = getAboutIndex("it");
assert.equal(englishAbout.entries[0].identity, "about:really-about-me", "the migrated English About index is seeded with the bespoke page first");
assert.equal(italianAbout.entries[0].identity, "about:really-about-me", "the migrated Italian About index is seeded with the bespoke page first");
assert.ok(englishAbout.entries.some((entry) => entry.identity === "standard-page:boring-about-me"), "standard About pages can be curated through stable identity");

const authoringConfig = readFileSync("src/content/thinking-keystatic.config.ts", "utf8");
for (const label of ["Page title", "Section title", "Introduction", "Body text", "Reflection", "Signoff"]) {
  assert.match(authoringConfig, new RegExp(`label: \\"${label}\\"`), `authoring exposes the editorial label ${label}`);
}
assert.doesNotMatch(authoringConfig, /description:\s*"[^"]*\b(?:copy|inline|Tiptap|renderer|CSS class|mark|persistence)\b/i, "author-facing descriptions must not expose implementation vocabulary");
assert.match(authoringConfig, /englishThinkingIndex[\s\S]*englishThinkingArticles[\s\S]*englishDialogues/, "Thinking index, article, and Dialogues authoring are separate concepts");
assert.match(authoringConfig, /englishAboutIndex/);
const thinkingArticleSchema = authoringConfig.slice(authoringConfig.indexOf("const thinkingArticleCollection"), authoringConfig.indexOf("export default config"));
assert.match(thinkingArticleSchema, /order: fields\.integer\(\{ label: "Legacy article order"/, "existing Thinking articles keep their persisted legacy order field when opened in the editor");

const navigation = readFileSync("src/components/navigation/SiteNavigation.tsx", "utf8");
assert.doesNotMatch(navigation, /text\.dialogues/, "Dialogues has no competing top-level navigation source");
assert.match(navigation, /\[text\.about, "about"\]/, "top-level About navigation points to the hub");

console.log("Verified shared hub identity, ordering, removal, publication filtering, localized About composition, author-facing terminology, and navigation ownership.");
