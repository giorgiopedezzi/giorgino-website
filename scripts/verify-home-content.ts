import assert from "node:assert/strict";

import { getHomeContent, validateHomeContent } from "../src/content/home";
import { getAboutContent, validateAboutContent } from "../src/content/about";
import { validateSiteAuthoringUpdate } from "../src/content/thinking-authoring-validation";
import { effectiveDarkMatterPhase, isDarkMatterVisible, prepareNarrative } from "../src/components/home/home-animation";
import { richTextToPlainText } from "../src/content/rich-text";

const english = getHomeContent("en");
const italian = getHomeContent("it");
const englishAbout = getAboutContent("en");
const italianAbout = getAboutContent("it");

assert.equal(english.hero.heading, "Technology keeps changing. The difficult part rarely does.");
assert.doesNotThrow(() => validateHomeContent(english), "current structured homepage prose must remain valid");
assert.equal(english.belief.statements.length, 2);
assert.equal(english.darkMatter.narrative.length, 2);
assert.equal(english.thinking.linkLabel, "Follow the thinking");
assert.equal(english.thinking.linkHref, "/en/thinking");
assert.equal(english.human.linkHref, "/en/really-about-me", "the homepage keeps its deliberate handoff to the bespoke personal page");
assert.equal("articles" in english.thinking, false, "Home must not duplicate the Thinking index");
assert.equal(italian.belief.statements.length, 4);
assert.equal(italian.running.linkLabel, "Guarda l'esperimento");
assert.equal(italian.running.linkHref, "/it/running");
assert.equal("arc" in english, false, "Home must not retain the personal arc");
assert.equal("personalNarrative" in english, false, "Home must not retain the full personal narrative");
assert.equal(richTextToPlainText(englishAbout.personalNarrative.missingMan.body), "How I left a project. No words. The right image. At the right time. At least, I felt it \"right\". Mine.");
assert.equal(richTextToPlainText(italianAbout.personalNarrative.book.heading), "Un giorno vorrei scrivere un libro.");

const flexibleAbout = structuredClone(englishAbout) as unknown as Record<string, unknown>;
const flexibleNarrative = flexibleAbout.personalNarrative as Record<string, unknown>;
const flexiblePizza = flexibleNarrative.pizza as Record<string, unknown>;
const flexibleBook = flexibleNarrative.book as Record<string, unknown>;
const flexibleArc = flexibleAbout.arc as Record<string, unknown>;
flexiblePizza.lines = Array.from({ length: 8 }, (_, index) => (englishAbout.personalNarrative.pizza.lines[index % englishAbout.personalNarrative.pizza.lines.length]));
flexibleBook.lines = Array.from({ length: 3 }, (_, index) => (englishAbout.personalNarrative.book.lines[index % englishAbout.personalNarrative.book.lines.length]));
flexibleArc.timeline = Array.from({ length: 7 }, (_, index) => (englishAbout.arc.timeline[index % englishAbout.arc.timeline.length]));
assert.doesNotThrow(() => validateAboutContent(flexibleAbout), "Pizza, Book, and Personal arc must accept counts above the recommended range");

const minimalAbout = structuredClone(englishAbout) as unknown as Record<string, unknown>;
const minimalNarrative = minimalAbout.personalNarrative as Record<string, unknown>;
(minimalNarrative.pizza as Record<string, unknown>).lines = [englishAbout.personalNarrative.pizza.lines[0]];
(minimalNarrative.book as Record<string, unknown>).lines = [englishAbout.personalNarrative.book.lines[0]];
assert.doesNotThrow(() => validateAboutContent(minimalAbout), "Pizza and Book must render from a single editorial line without placeholders");

const brokenOpening = structuredClone(englishAbout) as unknown as Record<string, unknown>;
(brokenOpening.personalNarrative as Record<string, unknown>).opening = englishAbout.personalNarrative.opening.slice(0, 6);
assert.throws(() => validateAboutContent(brokenOpening), /unexpected number of items/, "the bespoke 4 + 2 + 1 opening composition must remain protected");
const editedNarrative = prepareNarrative(["An editorial edit, with punctuation.", "A second paragraph."]);
assert.equal(editedNarrative.canonical, "An editorial edit, with punctuation.\n\nA second paragraph.");
assert.equal(editedNarrative.stripped, "an editorial edit with punctuation a second paragraph");
assert.equal(effectiveDarkMatterPhase(true, "idle"), "final", "reduced motion must skip animation phases");
assert.equal(isDarkMatterVisible(true, "idle"), true, "reduced motion must reveal Dark Matter immediately");
assert.equal(effectiveDarkMatterPhase(false, "restoring"), "restoring", "normal motion must retain the active phase");
assert.equal(isDarkMatterVisible(false, "narrative"), true, "normal motion reveals Dark Matter independently of I Believe");

const tooManyBeliefs = structuredClone(english) as unknown as Record<string, unknown>;
(tooManyBeliefs.belief as Record<string, unknown>).statements = Array.from({ length: 7 }, (_, index) => `Belief ${index}`);
assert.doesNotThrow(() => validateHomeContent(tooManyBeliefs), "belief guidance must not block saving a seventh statement");

const additionalNarrative = structuredClone(english) as unknown as Record<string, unknown>;
(additionalNarrative.darkMatter as Record<string, unknown>).narrative = Array.from({ length: 5 }, (_, index) => `Paragraph ${index}`);
assert.doesNotThrow(() => validateHomeContent(additionalNarrative), "the ordered Dark Matter animation must accept additional narrative paragraphs");

const legacyHomepage = structuredClone(english) as unknown as Record<string, unknown>;
(legacyHomepage.hero as Record<string, unknown>).body = "Existing plain homepage prose.";
assert.doesNotThrow(() => validateHomeContent(legacyHomepage), "existing plain homepage prose must remain valid");

const missingDeepLink = structuredClone(english) as unknown as Record<string, unknown>;
delete (missingDeepLink.thinking as Record<string, unknown>).linkLabel;
assert.throws(() => validateHomeContent(missingDeepLink), /thinking\.linkLabel/);

const unsafeDeepLink = structuredClone(english) as unknown as Record<string, unknown>;
(unsafeDeepLink.running as Record<string, unknown>).linkHref = "javascript:alert(1)";
assert.throws(() => validateHomeContent(unsafeDeepLink), /internal path or an http\(s\) URL/);

const formattedHomepage = structuredClone(english) as unknown as Record<string, unknown>;
(formattedHomepage.thinking as Record<string, unknown>).body = {
  type: "doc",
  content: [{
    type: "paragraph",
    content: [
      { type: "text", text: "Editorial ", marks: [{ type: "bold" }] },
      { type: "text", text: "emphasis", marks: [{ type: "italic" }, { type: "textStyle", attrs: { textSize: "emphasis" } }] },
    ],
  }],
};
assert.doesNotThrow(() => validateHomeContent(formattedHomepage));

const unsupportedFormatting = structuredClone(formattedHomepage) as Record<string, unknown>;
((((unsupportedFormatting.thinking as Record<string, unknown>).body as Record<string, unknown>).content as Array<Record<string, unknown>>)[0].content as Array<Record<string, unknown>>)[0].marks = [{ type: "link" }];
assert.throws(() => validateHomeContent(unsupportedFormatting), /unsupported Tiptap node or mark/);

const semanticRoles = structuredClone(english) as unknown as Record<string, unknown>;
(semanticRoles.human as Record<string, unknown>).body = {
  type: "doc",
  content: [{
    type: "paragraph",
    attrs: { role: "humanAside" },
    content: [
      { type: "text", text: "A personal aside with an " },
      { type: "text", text: "interruption", marks: [{ type: "interruption" }] },
      { type: "text", text: "." },
    ],
  }, {
    type: "paragraph",
    attrs: { role: "editorialLead" },
    content: [{ type: "text", text: "An editorial proposition." }],
  }],
};
assert.doesNotThrow(() => validateHomeContent(semanticRoles), "the new semantic block roles and interruption mark must remain valid");

const unsupportedRole = structuredClone(semanticRoles) as Record<string, unknown>;
(((unsupportedRole.human as Record<string, unknown>).body as Record<string, unknown>).content as Array<Record<string, unknown>>)[0].attrs = { role: "raw-size-99" };
assert.throws(() => validateHomeContent(unsupportedRole), /unsupported Tiptap node or mark/);

const encodedHome = Buffer.from(JSON.stringify(english)).toString("base64url");
assert.doesNotThrow(() => validateSiteAuthoringUpdate({
  additions: [{ path: "src/content/site/en/home.json", contents: encodedHome }],
  deletions: [],
}));
assert.throws(() => validateSiteAuthoringUpdate({
  additions: [{ path: "src/content/site/fr/home.json", contents: encodedHome }],
  deletions: [],
}), /outside approved site content and media directories/);

console.log("Verified localized homepage loading, canonical personal narrative, flexible ordered animation inputs, optional media accessibility, and guarded authoring updates.");
