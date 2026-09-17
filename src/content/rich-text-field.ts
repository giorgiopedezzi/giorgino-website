import { createElement } from "react";

import { RichTextInput } from "./RichTextField";
import { plainTextToRichText, validateRichText, type RichText } from "./rich-text";

export type PresentationControl = "scale" | "measure" | "tone";

export type RichTextCapabilities = {
  inlineTypography: boolean;
  paragraphRole: boolean;
  presentation: readonly PresentationControl[];
};

/** Profiles describe renderer capabilities, not a field label or visual preference. */
export const richTextCapabilities = {
  bodyCopy: { inlineTypography: true, paragraphRole: true, presentation: [] },
  bodyCopyWithPresentation: { inlineTypography: true, paragraphRole: true, presentation: ["scale", "measure", "tone"] },
  inlineHeading: { inlineTypography: true, paragraphRole: false, presentation: ["scale"] },
  protectedInline: { inlineTypography: true, paragraphRole: false, presentation: [] },
} as const satisfies Record<string, RichTextCapabilities>;

export function richText({ label, description, required = true, editorLabel, capabilities = richTextCapabilities.bodyCopy }: { label: string; description?: string; required?: boolean; editorLabel?: string; capabilities?: RichTextCapabilities }) {
  return {
    kind: "form" as const,
    label,
    ...(description ? { description } : {}),
    Input: (props: Parameters<typeof RichTextInput>[0]) => createElement(RichTextInput, { ...props, label: editorLabel, capabilities }),
    defaultValue: () => plainTextToRichText(""),
    parse: (value: unknown) => validateRichText(value, label, required),
    serialize: (value: RichText) => ({ value: validateRichText(value, label, required) }),
    validate: (value: RichText) => validateRichText(value, label, required),
    reader: { parse: (value: unknown) => validateRichText(value, label, required) },
  };
}
