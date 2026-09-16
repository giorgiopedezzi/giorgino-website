"use client";

import { Extension, Mark } from "@tiptap/core";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import type { FormFieldInputProps } from "@keystatic/core";

import { blockRoleOptions, richTextContent, richTextPresentation, textSizeOptions, toRichTextDocument, type BlockRole, type RichText, type RichTextContent, type TextSize } from "./rich-text";
import type { PresentationControl } from "./rich-text-field";
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
  }),
  TextStyle,
  Underline,
  TextSizeExtension,
  BlockRoleExtension,
  InterruptionExtension,
];

function activeSize(editor: ReturnType<typeof useEditor>): TextSize {
  const size = editor?.getAttributes("textStyle").textSize;
  return textSizeOptions.includes(size) ? size : "normal";
}

function activeRole(editor: ReturnType<typeof useEditor>): BlockRole | "none" {
  const role = editor?.getAttributes("paragraph").role;
  return blockRoleOptions.includes(role) ? role : "none";
}

const typographyLabels: Record<TextSize, string> = {
  small: "Label",
  normal: "Body",
  large: "Editorial",
  emphasis: "Editorial emphasis",
};

const roleLabels: Record<BlockRole | "none", string> = {
  none: "Body",
  humanAside: "Human Aside",
  editorialLead: "Editorial Lead",
};

const presentationLabels = {
  scale: { label: "Scale", options: [["default", "Default"], ["small", "Small"], ["medium", "Medium"], ["large", "Large"]] },
  measure: { label: "Measure", options: [["default", "Default"], ["narrow", "Narrow"], ["wide", "Wide"]] },
  tone: { label: "Tone", options: [["default", "Default"], ["quiet", "Quiet"], ["strong", "Strong"]] },
} as const;

export function RichTextInput({ value, onChange, label, presentationControls = [] }: FormFieldInputProps<RichText> & { label?: string; presentationControls?: PresentationControl[] }) {
  const savedPresentation = richTextPresentation(value);
  const updatePresentation = (property: PresentationControl, selected: string) => {
    const next: PresentationOverrides = { ...savedPresentation };
    if (selected === "default") delete next[property];
    else next[property] = selected as never;
    const text = richTextContent(value);
    onChange(Object.keys(next).length ? { text, presentation: next } : text);
  };
  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: toRichTextDocument(value),
    onUpdate: ({ editor }) => onChange(savedPresentation ? { text: editor.getJSON() as RichTextContent, presentation: savedPresentation } : editor.getJSON() as RichText),
    editorProps: { attributes: { class: styles.editor, "aria-label": "Rich text" } },
  });

  if (!editor) return null;
  const selectedSize = activeSize(editor);
  const applySize = (size: TextSize) => {
    const chain = editor.chain().focus();
    if (size === "normal") chain.unsetMark("textStyle").run();
    else chain.setMark("textStyle", { textSize: size }).run();
  };
  const selectedRole = activeRole(editor);
  const applyRole = (role: BlockRole | "none") => {
    const chain = editor.chain().focus();
    chain.updateAttributes("paragraph", { role: role === "none" ? null : role }).run();
  };

  return <div className={styles.field}>
    {label && <p className={styles.fieldLabel}>{label}</p>}
    <div className={styles.toolbar} aria-label="Text formatting">
      <button type="button" title="Bold" aria-label="Bold" aria-pressed={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></button>
      <button type="button" title="Italic" aria-label="Italic" aria-pressed={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></button>
      <button type="button" title="Underline" aria-label="Underline" aria-pressed={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><span className={styles.underline}>U</span></button>
      <button type="button" title="Strikethrough" aria-label="Strikethrough" aria-pressed={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><span className={styles.strike}>S</span></button>
      <button type="button" title="Editorial emphasis" aria-label="Editorial emphasis" aria-pressed={editor.isActive("interruption")} onClick={() => editor.chain().focus().toggleMark("interruption").run()}><span className={styles.interruption}>E</span></button>
      <label>Typography
        <select aria-label="Typography style" value={selectedSize} onChange={(event) => applySize(event.target.value as TextSize)}>
          <option value="small">Label</option><option value="normal">Body</option><option value="large">Editorial</option><option value="emphasis">Editorial emphasis</option>
        </select>
        <span className={[styles.typePreview, styles[`typePreview${selectedSize[0].toUpperCase()}${selectedSize.slice(1)}`]].join(" ")} aria-hidden="true">{typographyLabels[selectedSize]}</span>
      </label>
      <label>Role
        <select aria-label="Editorial role" value={selectedRole} onChange={(event) => applyRole(event.target.value as BlockRole | "none")}>
          <option value="none">{roleLabels.none}</option><option value="humanAside">{roleLabels.humanAside}</option><option value="editorialLead">{roleLabels.editorialLead}</option>
        </select>
      </label>
      {presentationControls.map((property) => {
        const control = presentationLabels[property];
        const selected = savedPresentation?.[property] ?? "default";
        return <label key={property}>{control.label}
          <select aria-label={`${control.label} override`} value={selected} onChange={(event) => updatePresentation(property, event.target.value)}>
            {control.options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
          </select>
        </label>;
      })}
    </div>
    <EditorContent editor={editor} />
  </div>;
}
