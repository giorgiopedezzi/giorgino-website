"use client";

import { Extension } from "@tiptap/core";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import type { FormFieldInputProps } from "@keystatic/core";

import { textSizeOptions, toRichTextDocument, type RichText, type TextSize } from "./rich-text";
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
];

function activeSize(editor: ReturnType<typeof useEditor>): TextSize {
  const size = editor?.getAttributes("textStyle").textSize;
  return textSizeOptions.includes(size) ? size : "normal";
}

export function RichTextInput({ value, onChange }: FormFieldInputProps<RichText>) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: toRichTextDocument(value),
    onUpdate: ({ editor }) => onChange(editor.getJSON() as RichText),
    editorProps: { attributes: { class: styles.editor, "aria-label": "Rich text" } },
  });

  if (!editor) return null;
  const applySize = (size: TextSize) => {
    const chain = editor.chain().focus();
    if (size === "normal") chain.unsetMark("textStyle").run();
    else chain.setMark("textStyle", { textSize: size }).run();
  };

  return <div className={styles.field}>
    <div className={styles.toolbar} aria-label="Text formatting">
      <button type="button" aria-label="Bold" aria-pressed={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></button>
      <button type="button" aria-label="Italic" aria-pressed={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></button>
      <button type="button" aria-label="Underline" aria-pressed={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><span className={styles.underline}>U</span></button>
      <button type="button" aria-label="Strikethrough" aria-pressed={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><span className={styles.strike}>S</span></button>
      <label>Size
        <select aria-label="Text size" value={activeSize(editor)} onChange={(event) => applySize(event.target.value as TextSize)}>
          <option value="small">Small</option><option value="normal">Normal</option><option value="large">Large</option><option value="emphasis">Emphasis</option>
        </select>
      </label>
    </div>
    <EditorContent editor={editor} />
  </div>;
}
