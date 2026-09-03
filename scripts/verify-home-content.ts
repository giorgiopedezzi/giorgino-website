import assert from "node:assert/strict";

import { getHomeContent, validateHomeContent } from "../src/content/home";
import { getAboutContent } from "../src/content/about";
import { validateSiteAuthoringUpdate } from "../src/content/thinking-authoring-validation";
import { effectiveDarkMatterPhase, isDarkMatterVisible, prepareNarrative } from "../src/components/home/home-animation";

const english = getHomeContent("en");
const italian = getHomeContent("it");
const englishAbout = getAboutContent("en");
const italianAbout = getAboutContent("it");

assert.equal(english.hero.heading, "Technology keeps changing. The difficult part rarely does.");
assert.doesNotThrow(() => validateHomeContent(english), "current structured homepage prose must remain valid");
assert.equal(english.belief.statements.length, 4);
assert.equal(english.darkMatter.narrative.length, 2);
assert.equal(english.thinking.linkLabel, "Follow the thinking");
assert.equal(english.thinking.linkHref, "/en/thinking");
assert.equal("articles" in english.thinking, false, "Home must not duplicate the Thinking index");
assert.equal(italian.belief.statements.length, 4);
assert.equal(italian.running.linkLabel, "Guarda l'esperimento");
assert.equal(italian.running.linkHref, "/it/running");
assert.equal("arc" in english, false, "Home must not retain the personal arc");
assert.equal("personalNarrative" in english, false, "Home must not retain the full personal narrative");
assert.equal(englishAbout.personalNarrative.missingMan.body, "When I left a long project, I posted the missing-man formation from Goose's funeral. At night. Then I left the chat. I wanted the image to be the first thing they saw the next morning.");
assert.equal(italianAbout.personalNarrative.book.heading, "Un giorno vorrei scrivere un libro.");
const editedNarrative = prepareNarrative(["An editorial edit, with punctuation.", "A second paragraph."]);
assert.equal(editedNarrative.canonical, "An editorial edit, with punctuation.\n\nA second paragraph.");
assert.equal(editedNarrative.stripped, "an editorial edit with punctuation a second paragraph");
assert.equal(effectiveDarkMatterPhase(true, "idle"), "final", "reduced motion must skip animation phases");
assert.equal(isDarkMatterVisible(true, "idle"), true, "reduced motion must reveal Dark Matter immediately");
assert.equal(effectiveDarkMatterPhase(false, "restoring"), "restoring", "normal motion must retain the active phase");
assert.equal(isDarkMatterVisible(false, "narrative"), true, "normal motion reveals Dark Matter independently of I Believe");

const tooManyBeliefs = structuredClone(english) as unknown as Record<string, unknown>;
(tooManyBeliefs.belief as Record<string, unknown>).statements = Array.from({ length: 7 }, (_, index) => `Belief ${index}`);
assert.throws(() => validateHomeContent(tooManyBeliefs), /between 1 and 6 items/);

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

console.log("Verified localized homepage loading, canonical personal narrative, constrained animation inputs, optional media accessibility, and guarded authoring updates.");
