import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { plainTextToRichText, richTextPresentation, toRichTextDocument, validateRichText, withRichTextPresentation, type RichTextDocument } from "../src/content/rich-text";
import { migrateRichTextSemantics } from "../src/content/rich-text-migration";

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
const toolbarStyles = readFileSync("src/content/RichTextField.module.css", "utf8");
const schema = readFileSync("src/content/thinking-keystatic.config.ts", "utf8");
assert.match(fieldFactory, /type RichTextRendererMode = "copy" \| "inline" \| "protected-copy" \| "protected-inline"/, "the renderer contract is exactly the four approved modes");
assert.match(fieldFactory, /\{ label, mode, description/, "richText requires an explicit mode with no silent default");
assert.doesNotMatch(fieldFactory, /Capabilities|capabilities|profile/i, "capability profiles must be removed");
assert.doesNotMatch(schema, /capabilities|richTextCapabilities/, "schema declarations must use modes directly");
assert.doesNotMatch(toolbar, />Typography|title="Human Aside"|>Measure<|>Tone</, "deprecated authoring controls must not be exposed");
assert.doesNotMatch(toolbar, /setMark\("textStyle"|toggleMark\("humanAside"/, "new saves cannot create deprecated phrase-size or inline-Human-Aside marks");
assert.match(toolbar, /TextSizeExtension[^]*InlineHumanAsideExtension/, "legacy size and inline-Human-Aside extensions remain installed for lossless editing");
assert.match(toolbar, /StarterKit\.configure\(\{[^]*?underline: false,[^]*?\}\),[^]*?\n  Underline,/, "Underline is registered explicitly without duplicating StarterKit's built-in extension");
assert.match(toolbar, /supportsParagraphRole\(mode\).*<div[^]*?<span>Paragraph<\/span>/, "paragraph roles are mode-gated");
assert.match(toolbar, /supportsScale\(mode\).*<div[^]*?<span>Whole field<\/span>/, "whole-field Scale is mode-gated");
assert.match(toolbar, /mode === "copy" \|\| mode === "inline"/, "only ordinary Copy and Inline expose Scale");
assert.match(toolbar, /mode === "copy";/, "only ordinary Copy exposes Paragraph Role");
assert.match(toolbar, /selectedTextHelp = "Applies to selected text\."/, "phrase controls explain their selected-text scope");
assert.match(toolbar, /<span>Selected text<\/span>/, "the selected-text scope is visibly labeled");
assert.match(toolbar, /Paragraph Role\. Applies to the current paragraph\./, "Paragraph Role explains its paragraph scope");
assert.match(toolbar, /Scale\. Applies to the whole field\./, "Scale explains its whole-field scope");
assert.match(toolbarStyles, /\.field \{ width: 100%; min-width: 0;[^}]*overflow: hidden;/, "the editor field contains narrow-width overflow");
assert.match(toolbarStyles, /\.toolbar select \{ max-width: 100%;/, "toolbar selects cannot exceed the editor width");
assert.match(toolbarStyles, /@media \(max-width: 25rem\)[^]*\.toolbarGroup \{ width: 100%;/, "scope groups stack at 400px and below");
const declarations = schema.match(/richText\(\{[^}]*\}\)/g) ?? [];
assert.ok(declarations.length > 0 && declarations.every((declaration) => /\bmode(?:\s*:|\s*[,}])/.test(declaration)), "every direct rich-text declaration must include a mode");
assert.match(schema, /mode: "protected-copy"[^\n]*animated composition/, "Dark Matter narrative uses protected-copy");
assert.match(schema, /closingThought: richText\(\{[^\n]*mode: "protected-inline"/, "Dark Matter closing thought uses protected-inline");
assert.match(schema, /opening: richTextList\("Opening lines", "protected-inline"/, "the choreographed opening has one explicit renderer mode");
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

const normalMigration = migrateRichTextSemantics({ type: "doc", content: [{ type: "paragraph", attrs: { role: "humanAside" }, content: [{ type: "text", text: "Inherited", marks: [{ type: "textStyle", attrs: { textSize: "normal" } }, { type: "italic" }] }] }] });
assert.deepEqual(normalMigration.value, { type: "doc", content: [{ type: "paragraph", attrs: { role: "humanAside" }, content: [{ type: "text", text: "Inherited", marks: [{ type: "italic" }] }] }] }, "safe normal migration preserves paragraph roles and other marks");
const uniformLegacyDocument = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "One", marks: [{ type: "textStyle", attrs: { textSize: "small" } }] }, { type: "text", text: " two", marks: [{ type: "textStyle", attrs: { textSize: "small" } }, { type: "bold" }] }] }] };
const uniformMigration = migrateRichTextSemantics(uniformLegacyDocument);
assert.deepEqual(uniformMigration.value, { text: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "One" }, { type: "text", text: " two", marks: [{ type: "bold" }] }] }] }, presentation: { scale: "small" } }, "uniform whole-field Small safely migrates to Scale");
const partial = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Only", marks: [{ type: "textStyle", attrs: { textSize: "large" } }] }, { type: "text", text: " part" }] }] };
assert.deepEqual(migrateRichTextSemantics(partial).value, partial, "partial-selection size semantics are not guessed");
const existingScale = { text: uniformLegacyDocument, presentation: { scale: "large", tone: "quiet" } };
assert.deepEqual(migrateRichTextSemantics(existingScale).value, existingScale, "existing Scale and legacy Tone remain untouched when a second migration would be ambiguous");

console.log("Verified legacy rich text, explicit renderer modes, scoped controls, compatible marks, and constrained validation.");
