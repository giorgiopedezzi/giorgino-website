import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  getStandardPageFromRepository,
  getStandardPageNavigationEntriesFromRepository,
  getStandardPagesFromRepository,
  getTranslatedStandardPageSlugFromRepository,
  validateStandardPageRepository,
} from "../src/content/standard-pages";
import { validateSiteAuthoringUpdate } from "../src/content/thinking-authoring-validation";

const page = (overrides: Record<string, unknown> = {}) => ({
  slug: "field-notes",
  locale: "en",
  translationKey: "field-notes",
  title: "Field notes",
  metadata: { title: "Field notes", description: "A standard editorial page." },
  status: "published",
  navigationLabel: "Field notes",
  showInNavigation: true,
  navigationOrder: 1,
  sections: [
    { discriminant: "editorial", value: { label: "Editorial", heading: "A heading", body: "A body" } },
    { discriminant: "links", value: { label: "Links", heading: "Further reading", links: [{ label: "Home", href: "/en" }] } },
  ],
  ...overrides,
});

const valid = validateStandardPageRepository([{ path: "en/pages/field-notes.json", value: page() }]);
assert.deepEqual(valid[0].sections.map((section) => section.type), ["editorial", "links"]);
assert.equal(valid[0].sections[0].type, "editorial");
if (valid[0].sections[0].type === "editorial") assert.equal(valid[0].sections[0].media, undefined, "editorial media must be optional");
const emptyOptionalMedia = validateStandardPageRepository([{ path: "en/pages/field-notes.json", value: page({ sections: [{ discriminant: "editorial", value: { label: "Editorial", heading: "A heading", body: "A body", media: { src: null, alt: "", decorative: false } } }] }) }]);
if (emptyOptionalMedia[0].sections[0].type === "editorial") assert.equal(emptyOptionalMedia[0].sections[0].media, undefined, "an unselected optional media field must stay absent");
assert.throws(() => validateStandardPageRepository([{ path: "en/pages/field-notes.json", value: page({ sections: [{ discriminant: "editorial", value: { label: "Editorial", heading: "A heading", body: "A body", media: { src: "/outside/image.svg", alt: "Invalid" } } }] }) }]), /repository-owned JPEG, PNG, WebP, or GIF/, "a present optional media source must still be validated strictly");
const authoringConfig = readFileSync("src/content/thinking-keystatic.config.ts", "utf8");
assert.match(authoringConfig, /editorialImageFields\("Optional media", optionalSiteMedia\)/, "the editor must not mark optional editorial media as required");
assert.match(authoringConfig, /en: "src\/content\/site\/en\/pages\/\*"/, "English standard pages must save in their approved locale directory");
assert.match(authoringConfig, /it: "src\/content\/site\/it\/pages\/\*"/, "Italian standard pages must save in their approved locale directory");
assert.match(authoringConfig, /englishStandardPages: standardPageCollection\("en"/, "English page creation must use the English collection");
assert.match(authoringConfig, /italianStandardPages: standardPageCollection\("it"/, "Italian page creation must use the Italian collection");
assert.deepEqual(validateStandardPageRepository([{ path: "en/pages/field-notes.json", value: page({ sections: [page().sections[1], page().sections[0]] }) }])[0].sections.map((section) => section.type), ["links", "editorial"]);
assert.throws(() => validateStandardPageRepository([{ path: "en/pages/invalid.json", value: page({ slug: "Not valid" }) }]), /lowercase URL slug/);
for (const slug of ["about", "authoring-foundation", "contact", "really-about-me", "running", "thinking"]) assert.throws(() => validateStandardPageRepository([{ path: `en/pages/${slug}.json`, value: page({ slug }) }]), /reserved/);
assert.throws(() => validateStandardPageRepository([{ path: "a", value: page() }, { path: "b", value: page() }]), /duplicate slug/);
assert.throws(() => validateStandardPageRepository([{ path: "a", value: page() }, { path: "b", value: page({ slug: "other" }) }]), /duplicate translation identity/);
assert.doesNotThrow(() => validateStandardPageRepository([{ path: "en/pages/field-notes.json", value: page() }]));
assert.throws(() => validateStandardPageRepository([{ path: "a", value: page() }, { path: "b", value: page({ slug: "other", translationKey: "other", navigationOrder: 1 }) }]), /duplicate visible navigation order/);

const repository = validateStandardPageRepository([
  { path: "en/pages/field-notes.json", value: page({ navigationOrder: 2 }) },
  { path: "en/pages/first-note.json", value: page({ slug: "first-note", translationKey: "first-note", navigationLabel: "First note", navigationOrder: 1 }) },
  { path: "en/pages/hidden-note.json", value: page({ slug: "hidden-note", translationKey: "hidden-note", showInNavigation: false, navigationOrder: 3 }) },
  { path: "en/pages/draft-note.json", value: page({ slug: "draft-note", translationKey: "draft-note", status: "draft", navigationOrder: 4 }) },
  { path: "it/pages/appunti.json", value: page({ locale: "it", slug: "appunti", translationKey: "field-notes", navigationLabel: "Appunti", navigationOrder: 1 }) },
]);

assert.deepEqual(getStandardPageNavigationEntriesFromRepository(repository, "en"), [
  { label: "First note", href: "/en/first-note" },
  { label: "Field notes", href: "/en/field-notes" },
]);
assert.equal(getStandardPageFromRepository(repository, "en", "hidden-note")?.slug, "hidden-note");
assert.equal(getStandardPageFromRepository(repository, "en", "draft-note"), undefined);
assert.equal(getStandardPageFromRepository(repository, "en", "draft-note", true)?.slug, "draft-note");
assert.deepEqual(getStandardPagesFromRepository(repository, "en").map((entry) => entry.slug), ["field-notes", "first-note", "hidden-note"]);
assert.equal(getTranslatedStandardPageSlugFromRepository(repository, "en", "field-notes", "it"), "appunti");
assert.equal(getTranslatedStandardPageSlugFromRepository(repository, "en", "first-note", "it"), undefined);
assert.doesNotThrow(() => validateSiteAuthoringUpdate({ additions: [{ path: "src/content/site/en/pages/field-notes.json", contents: Buffer.from(JSON.stringify(page({ showInNavigation: false }))).toString("base64url") }], deletions: [] }));
assert.doesNotThrow(() => validateSiteAuthoringUpdate({ additions: [{ path: "src/content/site/it/pages/appunti.json", contents: Buffer.from(JSON.stringify(page({ locale: "it", slug: "appunti", showInNavigation: false }))).toString("base64url") }], deletions: [] }));
assert.throws(() => validateSiteAuthoringUpdate({ additions: [{ path: "src/content/site/en/pages/contact.json", contents: Buffer.from(JSON.stringify(page({ slug: "contact" }))).toString("base64url") }], deletions: [] }), /reserved/);

console.log("Verified standard-page validation, section reuse, publication filtering, navigation, and translation identity.");
