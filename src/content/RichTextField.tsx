"use client";

import { Extension, Mark } from "@tiptap/core";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import type { FormFieldInputProps } from "@keystatic/core";

import { blockRoleOptions, richTextPresentation, textSizeOptions, toRichTextDocument, withRichTextPresentation, type BlockRole, type RichText, type RichTextContent, type TextSize } from "./rich-text";
import type { PresentationControl, RichTextCapabilities } from "./rich-text-field";
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
  }),
  TextStyle,
  Underline,
  TextSizeExtension,
  BlockRoleExtension,
  InterruptionExtension,
  InlineHumanAsideExtension,
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
  normal: "Default / Inherit",
  large: "Editorial (Lift)",
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

export function RichTextInput({ value, onChange, label, capabilities }: FormFieldInputProps<RichText> & { label?: string; capabilities: RichTextCapabilities }) {
  const savedPresentation = richTextPresentation(value);
  const updatePresentation = (property: PresentationControl, selected: string) => {
    const next: PresentationOverrides = { ...savedPresentation };
    if (selected === "default") delete next[property];
    else next[property] = selected as never;
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
      <div className={styles.toolbarGroup} aria-label="Text: selected phrase"><span>Text</span>
        <button type="button" title="Bold" aria-label="Bold" aria-pressed={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></button>
        <button type="button" title="Italic" aria-label="Italic" aria-pressed={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></button>
        <button type="button" title="Underline" aria-label="Underline" aria-pressed={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><span className={styles.underline}>U</span></button>
        <button type="button" title="Strikethrough" aria-label="Strikethrough" aria-pressed={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><span className={styles.strike}>S</span></button>
        <button type="button" title="Human Aside" aria-label="Human Aside" aria-pressed={editor.isActive("humanAside")} onClick={() => editor.chain().focus().toggleMark("humanAside").run()}><span className={styles.humanAside}>A</span></button>
        <button type="button" title="Interruption" aria-label="Interruption" aria-pressed={editor.isActive("interruption")} onClick={() => editor.chain().focus().toggleMark("interruption").run()}><span className={styles.interruption}>I</span></button>
        {capabilities.inlineTypography && <label>Typography
          <select aria-label="Typography for selected text" value={selectedSize} onChange={(event) => applySize(event.target.value as TextSize)}>
            <option value="normal">Default / Inherit</option><option value="small">Label</option><option value="large">Editorial Lift</option><option value="emphasis">Editorial Emphasis</option>
          </select>
          <span className={[styles.typePreview, styles[`typePreview${selectedSize[0].toUpperCase()}${selectedSize.slice(1)}`]].join(" ")} aria-hidden="true">{typographyLabels[selectedSize]}</span>
        </label>}
      </div>
      {capabilities.paragraphRole && <div className={styles.toolbarGroup} aria-label="Paragraph"><span>Paragraph</span><label>Role
        <select aria-label="Role for this paragraph" value={selectedRole} onChange={(event) => applyRole(event.target.value as BlockRole | "none")}>
          <option value="none">{roleLabels.none}</option><option value="humanAside">{roleLabels.humanAside}</option><option value="editorialLead">{roleLabels.editorialLead}</option>
        </select>
      </label></div>}
      {capabilities.presentation.length > 0 && <div className={styles.toolbarGroup} aria-label="Whole field presentation"><span>Whole field</span>{capabilities.presentation.map((property) => {
        const control = presentationLabels[property];
        const selected = savedPresentation?.[property] ?? "default";
        return <label key={property}>{control.label}
          <select aria-label={`${control.label} override`} value={selected} onChange={(event) => updatePresentation(property, event.target.value)}>
            {control.options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
          </select>
        </label>;
      })}</div>}
    </div>
    <EditorContent editor={editor} />
  </div>;
}
