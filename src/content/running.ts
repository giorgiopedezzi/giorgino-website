import { readFileSync } from "node:fs";
import { extname, join } from "node:path";

import type { Locale } from "./locales";
import { validateRichText, type RichText } from "./rich-text";
import { validateContentMetadata, type ContentMetadata } from "./content-metadata";

export type RunningMedia = { src: string; alt: string; caption?: string };
export type RunningBlock = { label: string; heading: RichText; body: RichText; isVisible: boolean };
export type RunningContent = {
  metadata: ContentMetadata;
  hero: { label: string; heading: RichText; intro: RichText };
  problem: RunningBlock;
  restraint: RunningBlock;
  principles: { label: string; heading: RichText; items: Array<{ order: number; text: RichText }> };
  object: RunningBlock & { study: { title: RichText; label: string; body: RichText }; media: RunningMedia[] };
  build: RunningBlock;
  state: RunningBlock;
  liveApp: { label: string; href: string; isVisible: boolean };
};

const mediaExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
function fail(path: string, message: string): never { throw new Error(`Running content validation failed at ${path}: ${message}`); }
function record(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) fail(path, "expected an object");
  return value as Record<string, unknown>;
}
function text(value: unknown, path: string) {
  if (typeof value !== "string" || value.trim() === "") fail(path, "expected a non-empty string");
  return value;
}
function rich(value: unknown, path: string): RichText { return validateRichText(value, path); }
function visible(value: unknown, path: string) {
  if (typeof value !== "boolean") fail(path, "expected a boolean");
  return value;
}
function href(value: unknown, path: string) {
  const valueAsText = text(value, path);
  if (!valueAsText.startsWith("/") && !/^https?:\/\//i.test(valueAsText)) fail(path, "must be an internal path or an http(s) URL");
  return valueAsText;
}
function block(value: unknown, path: string): RunningBlock {
  const source = record(value, path);
  return { label: text(source.label, `${path}.label`), heading: rich(source.heading, `${path}.heading`), body: rich(source.body, `${path}.body`), isVisible: visible(source.isVisible, `${path}.isVisible`) };
}
function media(value: unknown, path: string): RunningMedia {
  const source = record(value, path);
  const src = text(source.src, `${path}.src`);
  if (!src.startsWith("/site-media/") || !mediaExtensions.has(extname(src).toLowerCase())) fail(`${path}.src`, "must reference a repository-owned JPEG, PNG, WebP, or GIF asset");
  const result: RunningMedia = { src, alt: text(source.alt, `${path}.alt`) };
  if (source.caption !== undefined && source.caption !== null && source.caption !== "") result.caption = text(source.caption, `${path}.caption`);
  return result;
}

export function validateRunningContent(value: unknown, path = "running.json"): RunningContent {
  const source = record(value, path);
  const metadata = record(source.metadata, `${path}.metadata`);
  const hero = record(source.hero, `${path}.hero`);
  const principles = record(source.principles, `${path}.principles`);
  const object = record(source.object, `${path}.object`);
  const study = record(object.study, `${path}.object.study`);
  if (!Array.isArray(principles.items) || principles.items.length < 1) fail(`${path}.principles.items`, "expected at least 1 item");
  if (!Array.isArray(object.media)) fail(`${path}.object.media`, "expected an array");
  const items = principles.items.map((value, index) => {
    const item = record(value, `${path}.principles.items[${index}]`);
    if (typeof item.order !== "number" || !Number.isInteger(item.order) || item.order < 1) fail(`${path}.principles.items[${index}].order`, "must be a positive integer");
    return { order: item.order, text: rich(item.text, `${path}.principles.items[${index}].text`) };
  });
  if (new Set(items.map((item) => item.order)).size !== items.length) fail(`${path}.principles.items`, "orders must be unique");
  const result = {
    metadata: validateContentMetadata(metadata, `${path}.metadata`),
    hero: { label: text(hero.label, `${path}.hero.label`), heading: rich(hero.heading, `${path}.hero.heading`), intro: rich(hero.intro, `${path}.hero.intro`) },
    problem: block(source.problem, `${path}.problem`),
    restraint: block(source.restraint, `${path}.restraint`),
    principles: { label: text(principles.label, `${path}.principles.label`), heading: rich(principles.heading, `${path}.principles.heading`), items: items.sort((left, right) => left.order - right.order) },
    object: { ...block(object, `${path}.object`), study: { title: rich(study.title, `${path}.object.study.title`), label: text(study.label, `${path}.object.study.label`), body: rich(study.body, `${path}.object.study.body`) }, media: object.media.map((value, index) => media(value, `${path}.object.media[${index}]`)) },
    build: block(source.build, `${path}.build`),
    state: block(source.state, `${path}.state`),
    liveApp: (() => { const app = record(source.liveApp, `${path}.liveApp`); return { label: text(app.label, `${path}.liveApp.label`), href: href(app.href, `${path}.liveApp.href`), isVisible: visible(app.isVisible, `${path}.liveApp.isVisible`) }; })(),
  } satisfies RunningContent;
  return result;
}

export function getRunningContent(locale: Locale): RunningContent {
  const path = join(process.cwd(), "src", "content", "site", locale, "running.json");
  try { return validateRunningContent(JSON.parse(readFileSync(path, "utf8")), `${locale}/running.json`); }
  catch (error) { throw new Error(`Could not load Running content for ${locale}: ${error instanceof Error ? error.message : String(error)}`); }
}
