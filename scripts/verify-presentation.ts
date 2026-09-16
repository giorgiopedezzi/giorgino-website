import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getAboutContent } from "../src/content/about";
import { resolvePresentation, validatePresentationOverrides } from "../src/content/presentation";
import { richTextPresentation, toRichTextDocument, validateRichText } from "../src/content/rich-text";

assert.deepEqual(resolvePresentation(), { scale: "medium", measure: "wide", tone: "strong" });
assert.deepEqual(
  resolvePresentation({ scale: "small", measure: "narrow", tone: "quiet" }, { scale: "large" }),
  { scale: "large", measure: "narrow", tone: "quiet" },
);
assert.deepEqual(resolvePresentation({ scale: "small" }, {}), { scale: "small", measure: "wide", tone: "strong" });
assert.deepEqual(validatePresentationOverrides({ scale: "medium", measure: "wide", tone: "quiet" }), { scale: "medium", measure: "wide", tone: "quiet" });
assert.equal(validatePresentationOverrides(undefined, "content.presentation"), undefined);
assert.throws(() => validatePresentationOverrides({ scale: "43px" }, "content.presentation"), /supported semantic value/);
assert.throws(() => validatePresentationOverrides({ width: "720px" }, "content.presentation"), /unsupported presentation property/);

const legacy = validateRichText("Existing plain text", "legacy");
assert.equal(legacy, "Existing plain text", "legacy/plain rich text remains supported");
const overridden = validateRichText({
  text: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Scaled inline", marks: [{ type: "textStyle", attrs: { textSize: "large" } }] }] }] },
  presentation: { scale: "medium", measure: "narrow", tone: "quiet" },
}, "overridden");
assert.deepEqual(richTextPresentation(overridden), { scale: "medium", measure: "narrow", tone: "quiet" });
assert.equal(toRichTextDocument(overridden).content[0].type, "paragraph", "presentation does not remove inline rich-text marks");
assert.throws(() => validateRichText({ text: "x", presentation: { scale: "24px" } }, "invalid"), /supported semantic value/);

for (const locale of ["en", "it"] as const) {
  const reflection = getAboutContent(locale).personalNarrative.missingMan.reflection;
  assert.deepEqual(richTextPresentation(reflection), { scale: "medium" }, `${locale} Missing Man reflection has a local medium override`);
}
const renderer = readFileSync("src/components/primitives/RichText.module.css", "utf8");
assert.match(renderer, /presentationScaleMedium/);
assert.match(renderer, /inline\.presentationScaleMedium/, "display-heading inline rendering has an explicit scale composition rule");
assert.match(readFileSync("src/components/about/ReallyAboutMe.tsx", "utf8"), /sectionDefaults=\{\{ scale: "large" \}\}/, "Missing Man keeps its large inherited default when the override is reset");
assert.doesNotMatch(readFileSync("src/components/about/ReallyAboutMe.tsx", "utf8"), /reflection}\/>a/, "Missing Man reflection has no stray literal suffix");

console.log("Verified semantic presentation persistence, local overrides, reset-to-inheritance behavior, and inline composition.");
