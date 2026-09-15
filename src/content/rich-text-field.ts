import { createElement } from "react";

import { RichTextInput } from "./RichTextField";
import { plainTextToRichText, validateRichText, type RichText } from "./rich-text";

export function richText({ label, description, required = true, editorLabel }: { label: string; description?: string; required?: boolean; editorLabel?: string }) {
  return {
    kind: "form" as const,
    label,
    ...(description ? { description } : {}),
    Input: editorLabel
      ? (props: Parameters<typeof RichTextInput>[0]) => createElement(RichTextInput, { ...props, label: editorLabel })
      : RichTextInput,
    defaultValue: () => plainTextToRichText(""),
    parse: (value: unknown) => validateRichText(value, label, required),
    serialize: (value: RichText) => ({ value: validateRichText(value, label, required) }),
    validate: (value: RichText) => validateRichText(value, label, required),
    reader: { parse: (value: unknown) => validateRichText(value, label, required) },
  };
}
