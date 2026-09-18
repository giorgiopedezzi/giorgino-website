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

const reflectionScale = { en: "small", it: "medium" } as const;
for (const locale of ["en", "it"] as const) {
  const reflection = getAboutContent(locale).personalNarrative.missingMan.reflection;
  assert.ok(reflection, `${locale} bundled Missing Man reflection remains present`);
  assert.deepEqual(richTextPresentation(reflection), { scale: reflectionScale[locale] }, `${locale} Missing Man reflection preserves its local Scale override`);
}
const renderer = readFileSync("src/components/primitives/RichText.module.css", "utf8");
const rendererComponent = readFileSync("src/components/primitives/RichText.tsx", "utf8");
assert.match(renderer, /presentationScaleMedium/);
assert.match(renderer, /\.inline\.presentation \{ font-size: calc\(1em \* var\(--rich-text-scale\)\); \}/, "inline rendering uses the shared semantic Scale multiplier");
assert.doesNotMatch(renderer, /\.82em|\.inline\.presentationScale/, "inline rendering does not fork a contradictory Scale ladder");
assert.match(rendererComponent, /if \(composed\.scale\) classes\.push/, "Scale classes are emitted only for explicitly composed Scale values");
assert.match(rendererComponent, /if \(composed\.measure\) classes\.push/, "legacy Measure classes remain available only when explicitly composed");
assert.match(rendererComponent, /if \(composed\.tone\) classes\.push/, "legacy Tone classes remain available only when explicitly composed");
assert.doesNotMatch(rendererComponent, /resolvePresentation\(/, "rendering a Scale override must not synthesize Measure or Tone defaults");
const aboutRenderer = readFileSync("src/components/about/ReallyAboutMe.tsx", "utf8");
assert.match(aboutRenderer, /<EditorialHeading as="h3"><RichTextInline[^]*missingMan\.reflection/, "Missing Man reflection uses structural typography plus its local Scale");
assert.doesNotMatch(readFileSync("src/components/about/ReallyAboutMe.module.css", "utf8"), /\.reflect\s*\{/, "Missing Man does not add a bespoke sizing path");
assert.doesNotMatch(aboutRenderer, /reflection}\/>a/, "Missing Man reflection has no stray literal suffix");

console.log("Verified semantic presentation persistence, local overrides, reset-to-inheritance behavior, and inline composition.");
