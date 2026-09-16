import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { Locale } from "./locales";
import { validateContentMetadata } from "./content-metadata";
import type { ContentBlock, HomeContent, LinkedContentBlock, SiteMedia } from "./types";
import { validateRichText, type RichText } from "./rich-text";

const mediaExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function fail(path: string, message: string): never {
  throw new Error(`Homepage content validation failed at ${path}: ${message}`);
}

function record(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) fail(path, "expected an object");
  return value as Record<string, unknown>;
}

function text(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim() === "") fail(path, "expected a non-empty string");
  return value;
}

function optionalText(value: unknown, path: string): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return text(value, path);
}

function href(value: unknown, path: string): string {
  const valueAsText = text(value, path);
  if (!valueAsText.startsWith("/") && !/^https?:\/\//i.test(valueAsText)) fail(path, "must be an internal path or an http(s) URL");
  return valueAsText;
}

function textArray(value: unknown, path: string, minimum: number): string[] {
  if (!Array.isArray(value) || value.length < minimum) {
    fail(path, `expected at least ${minimum} items`);
  }
  return value.map((entry, index) => text(entry, `${path}[${index}]`));
}

function richTextArray(value: unknown, path: string, minimum: number): RichText[] {
  if (!Array.isArray(value) || value.length < minimum) {
    fail(path, `expected at least ${minimum} items`);
  }
  return value.map((entry, index) => validateRichText(entry, `${path}[${index}]`));
}

function optionalRichText(value: unknown, path: string): RichText | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return validateRichText(value, path);
}

function block(value: unknown, path: string): ContentBlock {
  const source = record(value, path);
  return { label: text(source.label, `${path}.label`), heading: text(source.heading, `${path}.heading`), body: validateRichText(source.body, `${path}.body`) };
}

function linkedBlock(value: unknown, path: string): LinkedContentBlock {
  const source = record(value, path);
  const result: LinkedContentBlock = {
    label: text(source.label, `${path}.label`),
    heading: text(source.heading, `${path}.heading`),
    linkLabel: text(source.linkLabel, `${path}.linkLabel`),
    linkHref: href(source.linkHref, `${path}.linkHref`),
  };
  const body = optionalRichText(source.body, `${path}.body`);
  if (body) result.body = body;
  return result;
}

function optionalMedia(value: unknown, path: string): SiteMedia | undefined {
  if (value === undefined || value === null) return undefined;
  const source = record(value, path);
  if (source.src === undefined || source.src === null || source.src === "") return undefined;
  const src = text(source.src, `${path}.src`);
  if (!src.startsWith("/site-media/") || !mediaExtensions.has(src.slice(src.lastIndexOf(".")).toLowerCase())) {
    fail(`${path}.src`, "must reference a repository-owned image asset");
  }
  const media: SiteMedia = { src, alt: text(source.alt, `${path}.alt`) };
  const caption = optionalText(source.caption, `${path}.caption`);
  if (caption) media.caption = caption;
  if (source.stretch === true) media.stretch = true;
  return media;
}

export function validateHomeContent(value: unknown, path = "home.json"): HomeContent {
  const source = record(value, path);
  const metadata = record(source.metadata, `${path}.metadata`);
  const belief = record(source.belief, `${path}.belief`);
  const darkMatter = record(source.darkMatter, `${path}.darkMatter`);
  const thinking = record(source.thinking, `${path}.thinking`);
  const running = record(source.running, `${path}.running`);
  const result: HomeContent = {
    metadata: validateContentMetadata(metadata, `${path}.metadata`),
    nextLabel: text(source.nextLabel, `${path}.nextLabel`),
    hero: block(source.hero, `${path}.hero`),
    belief: { label: text(belief.label, `${path}.belief.label`), statements: textArray(belief.statements, `${path}.belief.statements`, 1) },
    darkMatter: {
      label: text(darkMatter.label, `${path}.darkMatter.label`),
      heading: text(darkMatter.heading, `${path}.darkMatter.heading`),
      narrative: richTextArray(darkMatter.narrative, `${path}.darkMatter.narrative`, 1),
    },
    thinking: linkedBlock(thinking, `${path}.thinking`),
    running: {
      label: text(running.label, `${path}.running.label`),
      heading: text(running.heading, `${path}.running.heading`),
      linkLabel: text(running.linkLabel, `${path}.running.linkLabel`),
      linkHref: href(running.linkHref, `${path}.running.linkHref`),
    },
    human: linkedBlock(source.human, `${path}.human`),
  };
  const closingThought = optionalRichText(darkMatter.closingThought, `${path}.darkMatter.closingThought`);
  const darkSupportingText = optionalRichText(darkMatter.supportingText, `${path}.darkMatter.supportingText`);
  const runningMedia = optionalMedia(running.media, `${path}.running.media`);
  if (closingThought) result.darkMatter.closingThought = closingThought;
  if (darkSupportingText) result.darkMatter.supportingText = darkSupportingText;
  if (runningMedia) result.running.media = runningMedia;
  return result;
}

export function getHomeContent(locale: Locale): HomeContent {
  const path = join(process.cwd(), "src", "content", "site", locale, "home.json");
  try {
    return validateHomeContent(JSON.parse(readFileSync(path, "utf8")), `${locale}/home.json`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not load homepage content for ${locale}: ${message}`);
  }
}
