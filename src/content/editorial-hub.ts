import { validateContentMetadata } from "./content-metadata";
import { validateRichText, type RichText } from "./rich-text";
import type { EditorialHub, EditorialHubEntry } from "./types";

export type EditorialHubEntrySource = {
  kind: string;
  target?: string;
  displayTitle: string;
  summary?: string;
};

export type EditorialHubSource = Omit<EditorialHub, "entries"> & {
  entries: EditorialHubEntrySource[];
};

export type EditorialHubTarget = {
  identity: string;
  href: string;
  fallbackTitle: string;
  fallbackSummary?: string;
  available: boolean;
};

function fail(path: string, message: string): never {
  throw new Error(`Editorial hub validation failed at ${path}: ${message}`);
}

function record(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) fail(path, "expected an object");
  return value as Record<string, unknown>;
}

function text(value: unknown, path: string) {
  if (typeof value !== "string" || value.trim() === "") fail(path, "expected a non-empty string");
  return value;
}

function optionalText(value: unknown, path: string) {
  if (value === undefined || value === null || value === "") return undefined;
  return text(value, path);
}

function optionalRichText(value: unknown, path: string): RichText | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return validateRichText(value, path);
}

export function validateEditorialHubSource(value: unknown, path: string): EditorialHubSource {
  const source = record(value, path);
  if (!Array.isArray(source.entries)) fail(`${path}.entries`, "expected an ordered array");

  return {
    metadata: validateContentMetadata(source.metadata, `${path}.metadata`),
    label: text(source.label, `${path}.label`),
    heading: validateRichText(source.heading, `${path}.heading`),
    introduction: optionalRichText(source.introduction, `${path}.introduction`),
    entries: source.entries.map((entry, index) => {
      const entryPath = `${path}.entries[${index}]`;
      const block = record(entry, entryPath);
      const kind = typeof block.discriminant === "string" ? block.discriminant : text(block.kind, `${entryPath}.kind`);
      const fields = record("value" in block ? block.value : block, `${entryPath}.value`);
      return {
        kind,
        target: optionalText(fields.target, `${entryPath}.target`),
        displayTitle: text(fields.displayTitle, `${entryPath}.displayTitle`),
        summary: optionalText(fields.summary, `${entryPath}.summary`),
      };
    }),
  };
}

export function resolveEditorialHub(
  source: EditorialHubSource,
  path: string,
  resolveTarget: (entry: EditorialHubEntrySource, entryPath: string) => EditorialHubTarget,
): EditorialHub {
  const identities = new Set<string>();
  const entries: EditorialHubEntry[] = [];

  source.entries.forEach((entry, index) => {
    const entryPath = `${path}.entries[${index}]`;
    const target = resolveTarget(entry, entryPath);
    if (identities.has(target.identity)) fail(entryPath, `duplicates target identity "${target.identity}"`);
    identities.add(target.identity);
    if (!target.available) return;
    entries.push({
      identity: target.identity,
      href: target.href,
      title: entry.displayTitle || target.fallbackTitle,
      ...(entry.summary ?? target.fallbackSummary ? { summary: entry.summary ?? target.fallbackSummary } : {}),
    });
  });

  return {
    metadata: source.metadata,
    label: source.label,
    heading: source.heading,
    ...(source.introduction ? { introduction: source.introduction } : {}),
    entries,
  };
}
