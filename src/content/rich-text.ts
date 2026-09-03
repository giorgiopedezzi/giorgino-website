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
  | { type: "interruption" };

export type RichTextNode =
  | { type: "text"; text: string; marks?: RichTextMark[] }
  | { type: "paragraph"; attrs?: { role?: BlockRole | null }; content?: RichTextNode[] };

export type RichTextDocument = { type: "doc"; content: RichTextNode[] };
export type RichText = string | RichTextDocument;

function isTextSize(value: unknown): value is TextSize {
  return typeof value === "string" && (textSizeOptions as readonly string[]).includes(value);
}

function isBlockRole(value: unknown): value is BlockRole {
  return typeof value === "string" && (blockRoleOptions as readonly string[]).includes(value);
}

function isMark(value: unknown): value is RichTextMark {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const mark = value as Record<string, unknown>;
  if (mark.type === "bold" || mark.type === "italic" || mark.type === "underline" || mark.type === "strike" || mark.type === "interruption") return true;
  if (mark.type !== "textStyle") return false;
  if (mark.attrs === undefined) return true;
  if (typeof mark.attrs !== "object" || mark.attrs === null || Array.isArray(mark.attrs)) return false;
  const size = (mark.attrs as Record<string, unknown>).textSize;
  return size === undefined || size === null || isTextSize(size);
}

function isNode(value: unknown): value is RichTextNode {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const node = value as Record<string, unknown>;
  if (node.type === "text") return typeof node.text === "string" && (node.marks === undefined || (Array.isArray(node.marks) && node.marks.every(isMark)));
  if (node.type !== "paragraph") return false;
  if (node.content !== undefined && !(Array.isArray(node.content) && node.content.every(isNode))) return false;
  if (node.attrs === undefined) return true;
  if (typeof node.attrs !== "object" || node.attrs === null || Array.isArray(node.attrs)) return false;
  const role = (node.attrs as Record<string, unknown>).role;
  return role === undefined || role === null || isBlockRole(role);
}

export function plainTextToRichText(value: string): RichTextDocument {
  return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: value }] }] };
}

export function toRichTextDocument(value: RichText): RichTextDocument {
  return typeof value === "string" ? plainTextToRichText(value) : value;
}

export function validateRichText(value: unknown, path: string, required = true): RichText {
  if (typeof value === "string") {
    if (required && value.trim() === "") throw new Error(`Rich text validation failed at ${path}: expected a non-empty string`);
    return value;
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(`Rich text validation failed at ${path}: expected plain text or a Tiptap document`);
  const document = value as Record<string, unknown>;
  if (document.type !== "doc" || !Array.isArray(document.content) || !document.content.every(isNode)) {
    throw new Error(`Rich text validation failed at ${path}: unsupported Tiptap node or mark`);
  }
  if (required && document.content.length === 0) throw new Error(`Rich text validation failed at ${path}: expected content`);
  return document as RichTextDocument;
}
