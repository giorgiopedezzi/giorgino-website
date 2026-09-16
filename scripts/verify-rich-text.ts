import assert from "node:assert/strict";

import { plainTextToRichText, toRichTextDocument, validateRichText } from "../src/content/rich-text";

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
assert.throws(
  () => validateRichText({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "unsafe", marks: [{ type: "humanAside", attrs: { class: "foreign" } }] }] }] }, "unsafe"),
  /unsupported Tiptap node or mark/,
);

console.log("Verified legacy rich text, inline Human Aside persistence, compatible multiple marks, and constrained mark validation.");
