import assert from "node:assert/strict";

import { getHomeContent, validateHomeContent } from "../src/content/home";
import { validateSiteAuthoringUpdate } from "../src/content/thinking-authoring-validation";
import { effectiveDarkMatterPhase, isDarkMatterVisible, prepareNarrative } from "../src/components/home/home-animation";

const english = getHomeContent("en");
const italian = getHomeContent("it");

assert.equal(english.hero.heading, "Technology keeps changing. The difficult part rarely does.");
assert.equal(english.belief.statements.length, 4);
assert.equal(english.darkMatter.narrative.length, 2);
assert.equal(english.personalNarrative.missingMan.body, "When I left a long project, I posted the missing-man formation from Goose's funeral. At night. Then I left the chat. I wanted the image to be the first thing they saw the next morning.");
assert.equal(italian.personalNarrative.book.heading, "Un giorno vorrei scrivere un libro.");
const editedNarrative = prepareNarrative(["An editorial edit, with punctuation.", "A second paragraph."]);
assert.equal(editedNarrative.canonical, "An editorial edit, with punctuation.\n\nA second paragraph.");
assert.equal(editedNarrative.stripped, "an editorial edit with punctuation a second paragraph");
assert.equal(effectiveDarkMatterPhase(true, "idle"), "final", "reduced motion must skip animation phases");
assert.equal(isDarkMatterVisible(true, false, "idle"), true, "reduced motion must reveal Dark Matter immediately");
assert.equal(effectiveDarkMatterPhase(false, "restoring"), "restoring", "normal motion must retain the active phase");
assert.equal(isDarkMatterVisible(false, true, "narrative"), true, "normal motion reveals Dark Matter after belief completion");

const withMedia = structuredClone(english) as unknown as Record<string, unknown>;
const personalNarrative = (withMedia.personalNarrative as Record<string, unknown>);
const missingMan = personalNarrative.missingMan as Record<string, unknown>;
missingMan.artifact = {
  placeholder: "Fallback",
  media: { src: "/site-media/missing-man.gif", alt: "Missing-man formation", caption: "Farewell artifact" },
};
assert.equal(validateHomeContent(withMedia).personalNarrative.missingMan.artifact.media?.caption, "Farewell artifact");

const noAlt = structuredClone(withMedia) as Record<string, unknown>;
const noAltPersonal = noAlt.personalNarrative as Record<string, unknown>;
const noAltMissing = noAltPersonal.missingMan as Record<string, unknown>;
noAltMissing.artifact = { placeholder: "Fallback", media: { src: "/site-media/missing-man.gif", alt: "" } };
assert.throws(() => validateHomeContent(noAlt), /expected a non-empty string/);

const tooManyBeliefs = structuredClone(english) as unknown as Record<string, unknown>;
(tooManyBeliefs.belief as Record<string, unknown>).statements = Array.from({ length: 7 }, (_, index) => `Belief ${index}`);
assert.throws(() => validateHomeContent(tooManyBeliefs), /between 1 and 6 items/);

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
