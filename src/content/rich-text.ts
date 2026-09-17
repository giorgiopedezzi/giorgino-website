import { validatePresentationOverrides, type PresentationOverrides } from "./presentation";

export const textSizeOptions = ["small", "normal", "large", "emphasis"] as const;

export type TextSize = (typeof textSizeOptions)[number];

export const blockRoleOptions = ["humanAside", "editorialLead"] as const;

export type BlockRole = (typeof blockRoleOptions)[number];

export type RichTextMark =
  | { type: "bold" }
  | { type: "italic" }
  | { type: "underline" }
  | { type: "strike" }
  | { type: "textStyle"; attrs?: { textSize?: TextSize | null } }
  | { type: "interruption" }
  | { type: "humanAside" };

export type RichTextNode =
  | { type: "text"; text: string; marks?: RichTextMark[] }
  | { type: "paragraph"; attrs?: { role?: BlockRole | null }; content?: RichTextNode[] };

export type RichTextDocument = { type: "doc"; content: RichTextNode[] };
export type RichTextContent = string | RichTextDocument;
export type RichTextPresentation = {
  text: RichTextContent;
  presentation?: PresentationOverrides;
};
/** Legacy strings/documents remain valid; presentation is opt-in per text block. */
export type RichText = RichTextContent | RichTextPresentation;

function isTextSize(value: unknown): value is TextSize {
  return typeof value === "string" && (textSizeOptions as readonly string[]).includes(value);
}

function isBlockRole(value: unknown): value is BlockRole {
  return typeof value === "string" && (blockRoleOptions as readonly string[]).includes(value);
}

function isMark(value: unknown): value is RichTextMark {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const mark = value as Record<string, unknown>;
  if (mark.type === "bold" || mark.type === "italic" || mark.type === "underline" || mark.type === "strike" || mark.type === "interruption" || mark.type === "humanAside") return Object.keys(mark).every((key) => key === "type");
  if (mark.type !== "textStyle") return false;
  if (mark.attrs === undefined) return true;
  if (typeof mark.attrs !== "object" || mark.attrs === null || Array.isArray(mark.attrs)) return false;
  const size = (mark.attrs as Record<string, unknown>).textSize;
  return size === undefined || size === null || isTextSize(size);
}

function isNode(value: unknown): value is RichTextNode {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const node = value as Record<string, unknown>;
  if (node.type === "text") return typeof node.text === "string" && Object.keys(node).every((key) => key === "type" || key === "text" || key === "marks") && (node.marks === undefined || (Array.isArray(node.marks) && node.marks.every(isMark)));
  if (node.type !== "paragraph") return false;
  if (node.content !== undefined && !(Array.isArray(node.content) && node.content.every((child) => isRecordTextNode(child)))) return false;
  if (node.attrs === undefined) return true;
  if (typeof node.attrs !== "object" || node.attrs === null || Array.isArray(node.attrs)) return false;
  const role = (node.attrs as Record<string, unknown>).role;
  return role === undefined || role === null || isBlockRole(role);
}

function isRecordTextNode(value: unknown): value is Extract<RichTextNode, { type: "text" }> {
  return isNode(value) && value.type === "text";
}

export function plainTextToRichText(value: string): RichTextDocument {
  return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: value }] }] };
}

function isRichTextPresentation(value: RichText): value is RichTextPresentation {
  return typeof value === "object" && value !== null && "text" in value && !((value as Record<string, unknown>).type === "doc");
}

export function richTextContent(value: RichText): RichTextContent {
  return isRichTextPresentation(value) ? value.text : value;
}

export function richTextPresentation(value: RichText) {
  return isRichTextPresentation(value) ? value.presentation : undefined;
}

/** Updates only whole-field presentation, preserving the authored rich-text document. */
export function withRichTextPresentation(value: RichText, presentation: PresentationOverrides): RichText {
  const text = richTextContent(value);
  return Object.keys(presentation).length > 0 ? { text, presentation } : text;
}

export function toRichTextDocument(value: RichText): RichTextDocument {
  const content = richTextContent(value);
  return typeof content === "string" ? plainTextToRichText(content) : content;
}

function nodeToPlainText(node: RichTextNode): string {
  if (node.type === "text") return node.text;
  return (node.content ?? []).map(nodeToPlainText).join("");
}

export function richTextToPlainText(value: RichText): string {
  return toRichTextDocument(value).content.map(nodeToPlainText).join("\n\n");
}

export function validateRichText(value: unknown, path: string, required = true): RichText {
  if (typeof value === "string") {
    if (required && value.trim() === "") throw new Error(`Rich text validation failed at ${path}: expected a non-empty string`);
    return value;
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(`Rich text validation failed at ${path}: expected plain text or a Tiptap document`);
  const document = value as Record<string, unknown>;
  if ("text" in document && document.type !== "doc") {
    if (!Object.keys(document).every((key) => key === "text" || key === "presentation")) {
      throw new Error(`Rich text validation failed at ${path}: unsupported presentation wrapper property`);
    }
    const text = validateRichText(document.text, `${path}.text`, required);
    if (typeof text === "object" && text !== null && "text" in text && !((text as Record<string, unknown>).type === "doc")) {
      throw new Error(`Rich text validation failed at ${path}.text: nested presentation wrappers are not supported`);
    }
    const presentation = validatePresentationOverrides(document.presentation, `${path}.presentation`);
    return presentation ? { text: text as RichTextContent, presentation } : text;
  }
  if (document.type !== "doc" || !Array.isArray(document.content) || !document.content.every(isNode)) {
    throw new Error(`Rich text validation failed at ${path}: unsupported Tiptap node or mark`);
  }
  if (required && document.content.length === 0) throw new Error(`Rich text validation failed at ${path}: expected content`);
  return document as RichTextDocument;
}
