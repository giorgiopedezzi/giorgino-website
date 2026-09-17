import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { plainTextToRichText, richTextPresentation, toRichTextDocument, validateRichText, withRichTextPresentation, type RichTextDocument } from "../src/content/rich-text";

const markedSentence = {
  type: "doc",
  content: [{
    type: "paragraph",
    content: [
      { type: "text", text: "I learned what " },
      { type: "text", text: "really matters", marks: [{ type: "humanAside" }] },
      { type: "text", text: " when " },
      { type: "text", text: "everything else", marks: [{ type: "textStyle", attrs: { textSize: "large" } }, { type: "interruption" }] },
      { type: "text", text: " became noise." },
    ],
  }],
} as const;

assert.deepEqual(validateRichText(markedSentence, "inline-example"), markedSentence);
assert.deepEqual(toRichTextDocument("Legacy copy"), plainTextToRichText("Legacy copy"));
assert.deepEqual(
  validateRichText({ type: "doc", content: [{ type: "paragraph", attrs: { role: "editorialLead" }, content: [{ type: "text", text: "A deliberate lead." }] }] }, "paragraph-role"),
  { type: "doc", content: [{ type: "paragraph", attrs: { role: "editorialLead" }, content: [{ type: "text", text: "A deliberate lead." }] }] },
  "paragraph roles remain persisted rich-text semantics",
);
assert.deepEqual(
  validateRichText({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Inherited heading typography", marks: [{ type: "textStyle", attrs: { textSize: "normal" } }] }] }] }, "legacy-normal"),
  { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Inherited heading typography", marks: [{ type: "textStyle", attrs: { textSize: "normal" } }] }] }] },
  "legacy normal text styles remain readable as inherited typography",
);
const fieldFactory = readFileSync("src/content/rich-text-field.ts", "utf8");
const toolbar = readFileSync("src/content/RichTextField.tsx", "utf8");
assert.match(fieldFactory, /inlineHeading: \{ inlineTypography: true, paragraphRole: false, presentation: \["scale"\] \}/, "inline headings do not advertise paragraph roles");
assert.match(fieldFactory, /bodyCopy: \{ inlineTypography: true, paragraphRole: true, presentation: \[\] \}/, "body copy keeps paragraph semantics");
assert.match(toolbar, /Default \/ Inherit/, "the inherited Typography action is not called Body");
assert.match(toolbar, /capabilities\.paragraphRole &&/, "paragraph controls are capability-gated");
const presentationSource: RichTextDocument = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Keep this text" }] }] };
const withScale = withRichTextPresentation(presentationSource, { scale: "large", tone: "quiet" });
assert.deepEqual(toRichTextDocument(withScale), presentationSource, "changing whole-field presentation preserves text");
assert.deepEqual(richTextPresentation(withScale), { scale: "large", tone: "quiet" });
assert.deepEqual(richTextPresentation(withRichTextPresentation(withScale, { scale: "small", tone: "quiet" })), { scale: "small", tone: "quiet" }, "changing one presentation property preserves unrelated properties");
assert.equal(withRichTextPresentation(withScale, {}), presentationSource, "resetting the final presentation override restores inheritance");
assert.throws(
  () => validateRichText({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "unsafe", marks: [{ type: "humanAside", attrs: { class: "foreign" } }] }] }] }, "unsafe"),
  /unsupported Tiptap node or mark/,
);

console.log("Verified legacy rich text, inherited typography, paragraph-role persistence, capability profiles, compatible marks, and constrained validation.");
