import type { PresentationScale } from "./presentation";
import type { RichTextDocument, RichTextMark, RichTextNode } from "./rich-text";

export type RichTextMigration = {
  value: unknown;
  actions: string[];
};

function isDocument(value: unknown): value is RichTextDocument {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    && (value as Record<string, unknown>).type === "doc"
    && Array.isArray((value as Record<string, unknown>).content);
}

function textNodes(document: RichTextDocument) {
  return document.content.flatMap((node) => node.type === "paragraph" ? (node.content ?? []).filter((child): child is Extract<RichTextNode, { type: "text" }> => child.type === "text" && child.text.length > 0) : []);
}

function markedScale(node: Extract<RichTextNode, { type: "text" }>): PresentationScale | undefined {
  const sizes = (node.marks ?? []).filter((mark): mark is Extract<RichTextMark, { type: "textStyle" }> => mark.type === "textStyle").map((mark) => mark.attrs?.textSize);
  return sizes.length === 1 && (sizes[0] === "small" || sizes[0] === "large") ? sizes[0] : undefined;
}

function uniformScale(document: RichTextDocument): PresentationScale | undefined {
  const nodes = textNodes(document);
  if (nodes.length === 0) return undefined;
  const scales = nodes.map(markedScale);
  return scales.every((scale) => scale === scales[0]) ? scales[0] : undefined;
}

function withoutTextSizes(document: RichTextDocument, sizes: ReadonlySet<string>) {
  let changed = false;
  const content = document.content.map((node) => {
    if (node.type !== "paragraph" || !node.content) return node;
    const children = node.content.map((child) => {
      if (child.type !== "text" || !child.marks) return child;
      const marks = child.marks.filter((mark) => {
        const remove = mark.type === "textStyle" && typeof mark.attrs?.textSize === "string" && sizes.has(mark.attrs.textSize);
        if (remove) changed = true;
        return !remove;
      });
      if (!changed) return child;
      const text = { type: child.type, text: child.text } as const;
      return marks.length > 0 ? { ...text, marks } : text;
    });
    return changed ? { ...node, content: children } : node;
  });
  return { document: changed ? { ...document, content } : document, changed };
}

function migrateDocument(document: RichTextDocument, canAddScale: boolean) {
  const actions: string[] = [];
  const normal = withoutTextSizes(document, new Set(["normal"]));
  let migrated = normal.document;
  if (normal.changed) actions.push("removed legacy textSize normal marks");
  const scale = canAddScale ? uniformScale(migrated) : undefined;
  if (scale) {
    const lifted = withoutTextSizes(migrated, new Set([scale]));
    migrated = lifted.document;
    actions.push(`lifted uniform textSize ${scale} to whole-field Scale`);
  }
  return { document: migrated, scale, actions };
}

export function migrateRichTextSemantics(value: unknown): RichTextMigration {
  if (isDocument(value)) {
    const migrated = migrateDocument(value, true);
    return {
      value: migrated.scale ? { text: migrated.document, presentation: { scale: migrated.scale } } : migrated.document,
      actions: migrated.actions,
    };
  }
  if (typeof value === "object" && value !== null && !Array.isArray(value) && "text" in value && isDocument((value as Record<string, unknown>).text)) {
    const wrapper = value as { text: RichTextDocument; presentation?: Record<string, unknown> };
    const migrated = migrateDocument(wrapper.text, wrapper.presentation?.scale === undefined);
    const presentation = migrated.scale ? { ...wrapper.presentation, scale: migrated.scale } : wrapper.presentation;
    return {
      value: { ...wrapper, text: migrated.document, ...(presentation && Object.keys(presentation).length > 0 ? { presentation } : {}) },
      actions: migrated.actions,
    };
  }
  return { value, actions: [] };
}

export function migrateRichTextTree(value: unknown, path = "$", report: string[] = []): unknown {
  const richTextValue = isDocument(value)
    || (typeof value === "object" && value !== null && !Array.isArray(value) && "text" in value && isDocument((value as Record<string, unknown>).text));
  if (richTextValue) {
    const direct = migrateRichTextSemantics(value);
    report.push(...direct.actions.map((action) => `${path}: ${action}`));
    return direct.value;
  }
  if (Array.isArray(value)) return value.map((entry, index) => migrateRichTextTree(entry, `${path}[${index}]`, report));
  if (typeof value !== "object" || value === null) return value;
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, migrateRichTextTree(entry, `${path}.${key}`, report)]));
}
