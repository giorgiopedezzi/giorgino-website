import { createElement } from "react";

import { RichTextInput } from "./RichTextField";
import { plainTextToRichText, validateRichText, type RichText } from "./rich-text";

export type RichTextRendererMode = "copy" | "inline" | "protected-copy" | "protected-inline";

export function richText({ label, mode, description, required = true, editorLabel }: { label: string; mode: RichTextRendererMode; description?: string; required?: boolean; editorLabel?: string }) {
  return {
    kind: "form" as const,
    label,
    ...(description ? { description } : {}),
    Input: (props: Parameters<typeof RichTextInput>[0]) => createElement(RichTextInput, { ...props, label: editorLabel, mode }),
    defaultValue: () => plainTextToRichText(""),
    parse: (value: unknown) => validateRichText(value, label, required),
    serialize: (value: RichText) => ({ value: validateRichText(value, label, required) }),
    validate: (value: RichText) => validateRichText(value, label, required),
    reader: { parse: (value: unknown) => validateRichText(value, label, required) },
  };
}
