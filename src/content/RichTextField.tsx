"use client";

import { Extension, Mark } from "@tiptap/core";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import type { FormFieldInputProps } from "@keystatic/core";

import { blockRoleOptions, richTextPresentation, toRichTextDocument, withRichTextPresentation, type BlockRole, type RichText, type RichTextContent } from "./rich-text";
import type { RichTextRendererMode } from "./rich-text-field";
import type { PresentationOverrides } from "./presentation";
import styles from "./RichTextField.module.css";

const TextSizeExtension = Extension.create({
  name: "textSize",
  addGlobalAttributes() {
    return [{
      types: ["textStyle"],
      attributes: {
        textSize: {
          default: null,
          parseHTML: (element) => element.getAttribute("data-text-size"),
          renderHTML: (attributes) => attributes.textSize ? { "data-text-size": attributes.textSize } : {},
        },
      },
    }];
  },
});

const BlockRoleExtension = Extension.create({
  name: "blockRole",
  addGlobalAttributes() {
    return [{
      types: ["paragraph"],
      attributes: {
        role: {
          default: null,
          parseHTML: (element) => element.getAttribute("data-role"),
          renderHTML: (attributes) => attributes.role ? { "data-role": attributes.role } : {},
        },
      },
    }];
  },
});

const InterruptionExtension = Mark.create({
  name: "interruption",
  parseHTML() {
    return [{ tag: "span[data-interruption]" }];
  },
  renderHTML() {
    return ["span", { "data-interruption": "true" }, 0];
  },
});

const InlineHumanAsideExtension = Mark.create({
  name: "humanAside",
  parseHTML() {
    return [{ tag: "span[data-human-aside]" }];
  },
  renderHTML() {
    return ["span", { "data-human-aside": "true" }, 0];
  },
});

const extensions = [
  StarterKit.configure({
    blockquote: false,
    bulletList: false,
    code: false,
    codeBlock: false,
    dropcursor: false,
    gapcursor: false,
    hardBreak: false,
    heading: false,
    horizontalRule: false,
    listItem: false,
    orderedList: false,
    strike: {},
    underline: false,
  }),
  TextStyle,
  Underline,
  TextSizeExtension,
  BlockRoleExtension,
  InterruptionExtension,
  InlineHumanAsideExtension,
];

function activeRole(editor: ReturnType<typeof useEditor>): BlockRole | "none" {
  const role = editor?.getAttributes("paragraph").role;
  return blockRoleOptions.includes(role) ? role : "none";
}

const roleLabels: Record<BlockRole | "none", string> = {
  none: "Body",
  humanAside: "Human Aside",
  editorialLead: "Editorial Lead",
};

const scaleOptions = [["default", "Default"], ["small", "Small"], ["medium", "Medium"], ["large", "Large"]] as const;

const supportsParagraphRole = (mode: RichTextRendererMode) => mode === "copy";
const supportsScale = (mode: RichTextRendererMode) => mode === "copy" || mode === "inline";
const selectedTextHelp = "Applies to selected text.";

export function RichTextInput({ value, onChange, label, mode }: FormFieldInputProps<RichText> & { label?: string; mode: RichTextRendererMode }) {
  const savedPresentation = richTextPresentation(value);
  const updateScale = (selected: string) => {
    const next: PresentationOverrides = { ...savedPresentation };
    if (selected === "default") delete next.scale;
    else next.scale = selected as NonNullable<PresentationOverrides["scale"]>;
    onChange(withRichTextPresentation(value, next));
  };
  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: toRichTextDocument(value),
    onUpdate: ({ editor }) => onChange(savedPresentation ? { text: editor.getJSON() as RichTextContent, presentation: savedPresentation } : editor.getJSON() as RichText),
    editorProps: { attributes: { class: styles.editor, "aria-label": "Rich text" } },
  });

  if (!editor) return null;
  const selectedRole = activeRole(editor);
  const applyRole = (role: BlockRole | "none") => {
    const chain = editor.chain().focus();
    chain.updateAttributes("paragraph", { role: role === "none" ? null : role }).run();
  };

  return <div className={styles.field}>
    {label && <p className={styles.fieldLabel}>{label}</p>}
    <div className={styles.toolbar} aria-label="Text formatting">
      <div className={styles.toolbarGroup} aria-label="Selected text controls"><span>Selected text</span>
        <button type="button" title={`Bold. ${selectedTextHelp}`} aria-label={`Bold. ${selectedTextHelp}`} aria-pressed={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></button>
        <button type="button" title={`Italic. ${selectedTextHelp}`} aria-label={`Italic. ${selectedTextHelp}`} aria-pressed={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></button>
        <button type="button" title={`Underline. ${selectedTextHelp}`} aria-label={`Underline. ${selectedTextHelp}`} aria-pressed={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><span className={styles.underline}>U</span></button>
        <button type="button" title={`Strikethrough. ${selectedTextHelp}`} aria-label={`Strikethrough. ${selectedTextHelp}`} aria-pressed={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><span className={styles.strike}>S</span></button>
        <button type="button" title={`Interruption. ${selectedTextHelp}`} aria-label={`Interruption. ${selectedTextHelp}`} aria-pressed={editor.isActive("interruption")} onClick={() => editor.chain().focus().toggleMark("interruption").run()}><span className={styles.interruption}>I</span></button>
      </div>
      {supportsParagraphRole(mode) && <div className={styles.toolbarGroup} aria-label="Paragraph controls"><span>Paragraph</span><label title="Applies to the current paragraph.">Role
        <select title="Paragraph Role applies to the current paragraph." aria-label="Paragraph Role. Applies to the current paragraph." value={selectedRole} onChange={(event) => applyRole(event.target.value as BlockRole | "none")}>
          <option value="none">{roleLabels.none}</option><option value="humanAside">{roleLabels.humanAside}</option><option value="editorialLead">{roleLabels.editorialLead}</option>
        </select>
      </label></div>}
      {supportsScale(mode) && <div className={styles.toolbarGroup} aria-label="Whole field controls"><span>Whole field</span><label title="Applies to the whole field.">Scale
        <select title="Scale applies to the whole field." aria-label="Scale. Applies to the whole field." value={savedPresentation?.scale ?? "default"} onChange={(event) => updateScale(event.target.value)}>
          {scaleOptions.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
        </select>
      </label></div>}
    </div>
    <EditorContent editor={editor} />
  </div>;
}
