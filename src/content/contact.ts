import { readFileSync } from "node:fs";
import { join } from "node:path";

import { validateContentMetadata, type ContentMetadata } from "./content-metadata";
import type { Locale } from "./locales";
import { validateRichText, type RichText } from "./rich-text";

export type ContactContent = {
  metadata: ContentMetadata;
  label: string;
  heading: RichText;
  body: RichText;
  details: RichText[];
  supportingText?: RichText;
};

function fail(path: string, message: string): never { throw new Error(`Contact content validation failed at ${path}: ${message}`); }
function text(value: unknown, path: string) {
  if (typeof value !== "string" || value.trim() === "") fail(path, "expected a non-empty string");
  return value;
}
function rich(value: unknown, path: string): RichText { return validateRichText(value, path); }
export function validateContactContent(value: unknown, path = "contact.json"): ContactContent {
  if (typeof value !== "object" || value === null || Array.isArray(value)) fail(path, "expected an object");
  const source = value as Record<string, unknown>;
  if (!Array.isArray(source.details) || source.details.length < 1 || source.details.length > 6) fail(`${path}.details`, "expected between 1 and 6 items");
  const result: ContactContent = {
    metadata: validateContentMetadata(source.metadata, `${path}.metadata`),
    label: text(source.label, `${path}.label`),
    heading: rich(source.heading, `${path}.heading`),
    body: rich(source.body, `${path}.body`),
    details: source.details.map((value, index) => rich(value, `${path}.details[${index}]`)),
  };
  if (source.supportingText !== undefined && source.supportingText !== null && source.supportingText !== "") result.supportingText = rich(source.supportingText, `${path}.supportingText`);
  return result;
}
export function getContactContent(locale: Locale) {
  const path = join(process.cwd(), "src", "content", "site", locale, "contact.json");
  try { return validateContactContent(JSON.parse(readFileSync(path, "utf8")), `${locale}/contact.json`); }
  catch (error) { throw new Error(`Could not load Contact content for ${locale}: ${error instanceof Error ? error.message : String(error)}`); }
}
