import { RichTextInput } from "./RichTextField";
import { plainTextToRichText, validateRichText, type RichText } from "./rich-text";

export function richText({ label, description, required = true }: { label: string; description?: string; required?: boolean }) {
  return {
    kind: "form" as const,
    label,
    ...(description ? { description } : {}),
    Input: RichTextInput,
    defaultValue: () => plainTextToRichText(""),
    parse: (value: unknown) => validateRichText(value, label, required),
    serialize: (value: RichText) => ({ value: validateRichText(value, label, required) }),
    validate: (value: RichText) => validateRichText(value, label, required),
    reader: { parse: (value: unknown) => validateRichText(value, label, required) },
  };
}
