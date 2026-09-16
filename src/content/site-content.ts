import { readFileSync } from "node:fs";
import { join } from "node:path";

import { isLocale, type Locale } from "./locales";
import { isNormalPageSectionType, type NormalPageSection } from "./page-sections";
import { validateRichText } from "./rich-text";
import type { EditorialLink } from "./types";

export type AuthoringMedia = { src: string; alt: string; caption?: string; decorative?: boolean; presentation?: "default" | "wide" | "full"; stretch?: boolean };
export type AuthoringFoundation = {
  title: string;
  summary: string;
  isVisible: boolean;
  link?: string;
  media: AuthoringMedia[];
  items: Array<{ order: number; label: string; href: string }>;
  sections: NormalPageSection[];
};

const mediaExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function fail(path: string, message: string): never {
  throw new Error(`Site content validation failed at ${path}: ${message}`);
}

function record(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) fail(path, "expected an object");
  return value as Record<string, unknown>;
}

function string(value: unknown, path: string) {
  if (typeof value !== "string" || value.trim() === "") fail(path, "expected a non-empty string");
  return value;
}

function link(value: unknown, path: string) {
  const href = string(value, path);
  if (!href.startsWith("/") && !/^https?:\/\//i.test(href)) fail(path, "must be an internal path or an http(s) URL");
  return href;
}

function media(value: unknown, path: string): AuthoringMedia {
  const entry = record(value, path);
  const src = string(entry.src, `${path}.src`);
  const extension = src.slice(src.lastIndexOf(".")).toLowerCase();
  if (!src.startsWith("/site-media/") || !mediaExtensions.has(extension)) fail(`${path}.src`, "must reference a repository-owned JPEG, PNG, WebP, or GIF asset");
  const decorative = entry.decorative === true;
  if (decorative && entry.alt !== undefined && entry.alt !== null && entry.alt !== "") fail(`${path}.alt`, "must be empty when decorative is selected");
  if (!decorative && (typeof entry.alt !== "string" || entry.alt.trim() === "")) fail(`${path}.alt`, "is required for informative images");
  const result: AuthoringMedia = { src, alt: decorative ? "" : entry.alt as string };
  if (decorative) result.decorative = true;
  if (entry.caption !== undefined && entry.caption !== null) result.caption = string(entry.caption, `${path}.caption`);
  if (entry.presentation !== undefined && entry.presentation !== null && entry.presentation !== "default") {
    if (entry.presentation !== "wide" && entry.presentation !== "full") fail(`${path}.presentation`, "must be a supported semantic presentation value");
    result.presentation = entry.presentation;
  }
  if (entry.stretch === true) result.stretch = true;
  return result;
}

function normalSections(value: unknown, path: string): NormalPageSection[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) fail(path, "expected an array");
  return value.map((entry, index) => {
    const sectionPath = `${path}[${index}]`;
    const source = record(entry, sectionPath);
    const type = typeof source.discriminant === "string" ? source.discriminant : source.type;
    const section = "value" in source && typeof source.value === "object" && source.value !== null ? source.value as Record<string, unknown> : source;
    if (!isNormalPageSectionType(type)) fail(`${sectionPath}.type`, "must be a supported normal section type");
    const label = string(section.label, `${sectionPath}.label`);
    const heading = validateRichText(section.heading, `${sectionPath}.heading`);
    if (type === "editorial") {
      const result: Extract<NormalPageSection, { type: "editorial" }> = { type, label, heading, body: validateRichText(section.body, `${sectionPath}.body`) };
      if (section.media !== undefined && section.media !== null && (section.media as Record<string, unknown>).src) result.media = media(section.media, `${sectionPath}.media`);
      return result;
    }
    if (!Array.isArray(section.links)) fail(`${sectionPath}.links`, "expected an array");
    const seen = new Set<string>();
    const links: EditorialLink[] = section.links.map((entry, linkIndex) => {
      const linkValue = record(entry, `${sectionPath}.links[${linkIndex}]`);
      const href = link(linkValue.href, `${sectionPath}.links[${linkIndex}].href`);
      if (seen.has(href)) fail(`${sectionPath}.links[${linkIndex}].href`, "must not duplicate another link in this section");
      seen.add(href);
      const result: EditorialLink = { label: string(linkValue.label, `${sectionPath}.links[${linkIndex}].label`), href };
      if (linkValue.note !== undefined && linkValue.note !== null && linkValue.note !== "") result.note = string(linkValue.note, `${sectionPath}.links[${linkIndex}].note`);
      return result;
    });
    return { type, label, heading, links };
  });
}

export function validateAuthoringFoundation(value: unknown, path = "authoring-foundation.json"): AuthoringFoundation {
  const source = record(value, path);
  if (!Array.isArray(source.media) || !Array.isArray(source.items)) fail(path, "media and items must be arrays");
  if (typeof source.isVisible !== "boolean") fail(`${path}.isVisible`, "expected a boolean");
  const items = source.items.map((value, index) => {
    const item = record(value, `${path}.items[${index}]`);
    if (typeof item.order !== "number" || !Number.isInteger(item.order) || item.order < 1) fail(`${path}.items[${index}].order`, "must be a positive integer");
    return { order: item.order, label: string(item.label, `${path}.items[${index}].label`), href: link(item.href, `${path}.items[${index}].href`) };
  });
  if (new Set(items.map((item) => item.order)).size !== items.length) fail(`${path}.items`, "orders must be unique");
  const result: AuthoringFoundation = { title: string(source.title, `${path}.title`), summary: string(source.summary, `${path}.summary`), isVisible: source.isVisible, media: source.media.map((value, index) => media(value, `${path}.media[${index}]`)), items: items.sort((left, right) => left.order - right.order), sections: normalSections(source.sections, `${path}.sections`) };
  if (source.link !== undefined && source.link !== null) result.link = link(source.link, `${path}.link`);
  return result;
}

export function getAuthoringFoundation(locale: Locale) {
  const path = join(process.cwd(), "src", "content", "site", locale, "authoring-foundation.json");
  try {
    return validateAuthoringFoundation(JSON.parse(readFileSync(path, "utf8")), `${locale}/authoring-foundation.json`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not load authoring foundation for ${locale}: ${message}`);
  }
}

export function isAuthoringFoundationLocale(value: string): value is Locale {
  return isLocale(value);
}
