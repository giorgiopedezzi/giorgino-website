import assert from "node:assert/strict";

import { validateSiteAuthoringUpdate } from "../src/content/thinking-authoring-validation";
import { getAuthoringFoundation, validateAuthoringFoundation } from "../src/content/site-content";
import { getRunningContent, validateRunningContent } from "../src/content/running";
import { getHomeContent, validateHomeContent } from "../src/content/home";
import { getAboutContent, validateAboutContent } from "../src/content/about";
import { getContactContent, validateContactContent } from "../src/content/contact";
import { getSiteSettings, validateSiteSettings } from "../src/content/site-settings";
import { getLocaleMetadata } from "../src/content/locale-metadata";
import { richTextToPlainText } from "../src/content/rich-text";

const foundation = getAuthoringFoundation("en");
assert.equal(foundation.title, "Local authoring foundation");
assert.deepEqual(foundation.items.map((item) => item.order), [1, 2]);
assert.deepEqual(getAuthoringFoundation("it").items.map((item) => item.order), [1]);
const sections = validateAuthoringFoundation({ ...foundation, sections: [
  { discriminant: "editorial", value: { label: "Editorial", heading: "A heading", body: { text: "A body", presentation: { measure: "narrow" } } } },
  { discriminant: "links", value: { label: "Links", heading: "Resources", links: [{ label: "Home", href: "/en" }] } },
] }).sections;
assert.deepEqual(sections.map((section) => section.type), ["editorial", "links"], "block array order must be the persisted section order");
assert.deepEqual(validateAuthoringFoundation({ ...foundation, sections: [sections[1], sections[0]] }).sections.map((section) => section.type), ["links", "editorial"], "reordered sections must survive validation/reload");
assert.deepEqual(validateAuthoringFoundation({ ...foundation, sections: [sections[0]] }).sections.map((section) => section.type), ["editorial"], "removing a normal section must survive validation/reload");
assert.throws(() => validateAuthoringFoundation({ ...foundation, sections: [{ type: "hero", label: "No", heading: "No" }] }), /supported normal section type/);

const validMedia = { src: "/site-media/animated-proof.gif", alt: "An animated proof", caption: "GIF caption" };
assert.deepEqual(validateAuthoringFoundation({ ...foundation, media: [validMedia] }).media, [validMedia]);
assert.throws(
  () => validateAuthoringFoundation({ ...foundation, media: [{ src: "/site-media/unsupported.svg", alt: "SVG" }] }),
  /JPEG, PNG, WebP, or GIF/,
);

const settings = getSiteSettings("en");
assert.equal(getSiteSettings("it").navigation.contact, "Contatti");
assert.throws(() => validateSiteSettings({ ...settings, socialLinks: [{ label: "Unsafe", href: "javascript:alert(1)" }] }), /http\(s\) or mailto URL/);
assert.throws(() => validateSiteSettings({ ...settings, metadata: { ...settings.metadata, socialImage: "/outside/image.jpg" } }), /repository-owned/);
const contact = getContactContent("en");
assert.equal(richTextToPlainText(getContactContent("it").heading), "Continuiamo la conversazione.");
assert.throws(() => validateContactContent({ ...contact, details: [] }), /between 1 and 6/);
const metadata = getLocaleMetadata("en", "/en/contact", { ...contact.metadata, socialTitle: "Social Contact", socialImage: "/site-media/animated-authoring-proof.gif" });
assert.equal(metadata.alternates?.canonical, "/en/contact");
assert.deepEqual(metadata.alternates?.languages, { en: "/en/contact", it: "/it/contact", "x-default": "/en" });
assert.equal(metadata.openGraph?.title, "Social Contact");
assert.deepEqual(metadata.twitter?.images, ["/site-media/animated-authoring-proof.gif"]);
assert.throws(
  () => validateSiteAuthoringUpdate({ additions: [{ path: "src/content/site/fr/contact.json", contents: "" }], deletions: [] }),
  /outside approved site content and media directories/,
);
assert.throws(
  () => validateAuthoringFoundation({ ...foundation, link: "javascript:alert(1)" }),
  /internal path or an http\(s\) URL/,
);
assert.throws(
  () => validateAuthoringFoundation({ ...foundation, items: [{ order: 1, label: "One", href: "/en" }, { order: 1, label: "Two", href: "/en" }] }),
  /orders must be unique/,
);
assert.throws(
  () => validateSiteAuthoringUpdate({ additions: [{ path: "src/content/home.ts", contents: "" }], deletions: [] }),
  /outside approved site content and media directories/,
);
assert.throws(
  () => validateSiteAuthoringUpdate({ additions: [{ path: "src/content/site/fr/authoring-foundation.json", contents: "" }], deletions: [] }),
  /outside approved site content and media directories/,
);
assert.throws(
  () => validateSiteAuthoringUpdate({ additions: [{ path: "src/content/site/en/authoring-foundation.json", contents: Buffer.from(JSON.stringify({ ...foundation, title: "" })).toString("base64url") }], deletions: [] }),
  /expected a non-empty string/,
);

const running = getRunningContent("en");
const home = getHomeContent("en");
const about = getAboutContent("en");
assert.doesNotThrow(() => validateHomeContent({ ...home, thinking: { ...home.thinking, body: undefined }, human: { ...home.human, body: undefined } }), "optional Home section bodies must be removable");
assert.doesNotThrow(() => validateAboutContent({ ...about, personalNarrative: { ...about.personalNarrative, missingMan: { ...about.personalNarrative.missingMan, reflection: undefined, signoff: undefined } } }), "optional Missing Man reflection and signoff must be removable");
assert.doesNotThrow(() => validateRunningContent({ ...running, problem: { ...running.problem, body: undefined }, object: { ...running.object, body: undefined } }), "optional Running section bodies must be removable");
assert.equal(getRunningContent("it").hero.label, "Running / Lavori in corso");
assert.deepEqual(running.principles.items.map((item) => item.order), [1, 2, 3, 4, 5]);
assert.doesNotThrow(
  () => validateRunningContent({ ...running, principles: { ...running.principles, items: Array.from({ length: 9 }, (_, index) => ({ order: index + 1, text: `Principle ${index + 1}` })) } }),
  "principle-count guidance must not block saving a ninth ordered item",
);
assert.deepEqual(validateAuthoringFoundation({ ...foundation, media: [{ src: "/site-media/animated-proof.gif", alt: "", decorative: true, presentation: "wide" }] }).media[0], { src: "/site-media/animated-proof.gif", alt: "", decorative: true, presentation: "wide" });
assert.throws(() => validateAuthoringFoundation({ ...foundation, media: [{ src: "/site-media/animated-proof.gif", alt: "", presentation: "wide" }] }), /required for informative images/);
assert.throws(() => validateAuthoringFoundation({ ...foundation, media: [{ src: "/site-media/animated-proof.gif", alt: "Decorative", decorative: true }] }), /must be empty when decorative/);
assert.throws(() => validateAuthoringFoundation({ ...foundation, media: [{ src: "/site-media/animated-proof.gif", alt: "Image", presentation: "720px" }] }), /supported semantic presentation/);
assert.throws(
  () => validateRunningContent({ ...running, liveApp: { ...running.liveApp, href: "javascript:alert(1)" } }),
  /internal path or an http\(s\) URL/,
);
assert.deepEqual(validateRunningContent({ ...running, object: { ...running.object, media: [{ src: "/site-media/animated-proof.gif", alt: "", decorative: true, presentation: "full" }] } }).object.media[0], { src: "/site-media/animated-proof.gif", alt: "", decorative: true, presentation: "full" });
assert.throws(
  () => validateRunningContent({ ...running, object: { ...running.object, media: [{ src: "/site-media/unsupported.svg", alt: "SVG" }] } }),
  /JPEG, PNG, WebP, or GIF/,
);
assert.throws(
  () => validateRunningContent({ ...running, principles: { ...running.principles, items: [{ order: 1, text: "One" }, { order: 1, text: "Two" }] } }),
  /orders must be unique/,
);
assert.throws(
  () => validateSiteAuthoringUpdate({ additions: [{ path: "src/content/site/fr/running.json", contents: "" }], deletions: [] }),
  /outside approved site content and media directories/,
);

console.log("Verified localized site settings, Contact, homepage, Running, URL/media constraints, and approved write paths.");
