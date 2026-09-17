import assert from "node:assert/strict";

import { getStandardPageNavigationEntries, getStandardPages, getTranslatedStandardPageSlug, validateStandardPageRepository } from "../src/content/standard-pages";
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
assert.deepEqual(validateStandardPageRepository([{ path: "en/pages/field-notes.json", value: page({ sections: [page().sections[1], page().sections[0]] }) }])[0].sections.map((section) => section.type), ["links", "editorial"]);
assert.throws(() => validateStandardPageRepository([{ path: "en/pages/invalid.json", value: page({ slug: "Not valid" }) }]), /lowercase URL slug/);
for (const slug of ["authoring-foundation", "contact", "really-about-me", "running", "thinking"]) assert.throws(() => validateStandardPageRepository([{ path: `en/pages/${slug}.json`, value: page({ slug }) }]), /reserved/);
assert.throws(() => validateStandardPageRepository([{ path: "a", value: page() }, { path: "b", value: page() }]), /duplicate slug/);
assert.throws(() => validateStandardPageRepository([{ path: "a", value: page() }, { path: "b", value: page({ slug: "other" }) }]), /duplicate translation identity/);
assert.doesNotThrow(() => validateStandardPageRepository([{ path: "en/pages/field-notes.json", value: page() }]));
assert.throws(() => validateStandardPageRepository([{ path: "a", value: page() }, { path: "b", value: page({ slug: "other", translationKey: "other", navigationOrder: 1 }) }]), /duplicate visible navigation order/);

const drafts = getStandardPages("en", true);
assert.ok(drafts.every((entry) => entry.status === "published" || entry.status === "draft"));
assert.ok(getStandardPages("en").every((entry) => entry.status === "published"));
assert.ok(getStandardPageNavigationEntries("en").every((entry, index, items) => index === 0 || entry.href > "" && items[index - 1].href > ""));
assert.equal(getTranslatedStandardPageSlug("en", "missing", "it"), undefined);
assert.doesNotThrow(() => validateSiteAuthoringUpdate({ additions: [{ path: "src/content/site/en/pages/field-notes.json", contents: Buffer.from(JSON.stringify(page())).toString("base64url") }], deletions: [] }));
assert.throws(() => validateSiteAuthoringUpdate({ additions: [{ path: "src/content/site/en/pages/contact.json", contents: Buffer.from(JSON.stringify(page({ slug: "contact" }))).toString("base64url") }], deletions: [] }), /reserved/);

console.log("Verified standard-page validation, section reuse, publication filtering, navigation, and translation identity.");
