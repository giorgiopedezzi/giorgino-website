import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { locales, type Locale } from "./locales";
import { validateHomeContent } from "./home";
import { validateAboutContent } from "./about";
import { validateAuthoringFoundation } from "./site-content";
import { validateRunningContent } from "./running";
import { validateContactContent } from "./contact";
import { validateSiteSettings } from "./site-settings";
import { validateThinkingRepository } from "./thinking";

type LocalUpdate = { additions: Array<{ path: string; contents: string }>; deletions: Array<{ path: string }> };

const contentRoot = join(process.cwd(), "src", "content", "thinking");
const siteContentRoot = join(process.cwd(), "src", "content", "site");
const contentPath = /^src\/content\/thinking\/(en|it)\/(index|articles\/[a-z0-9]+(?:-[a-z0-9]+)*)\.json$/;
const mediaPath = /^public\/thinking-media\/[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
const siteContentPath = /^src\/content\/site\/(en|it)\/(?:about|authoring-foundation|contact|home|running|site-settings)\.json$/;
const siteMediaPath = /^public\/site-media\/[a-zA-Z0-9][a-zA-Z0-9._-]*(?:\/[a-zA-Z0-9][a-zA-Z0-9._-]*)*\.(?:jpe?g|png|webp|gif)$/i;

function parseUpdate(value: unknown): LocalUpdate {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("expected an update object");
  const { additions, deletions } = value as Record<string, unknown>;
  if (!Array.isArray(additions) || !Array.isArray(deletions)) throw new Error("expected additions and deletions arrays");
  if (!additions.every((entry) => typeof entry === "object" && entry !== null && typeof (entry as Record<string, unknown>).path === "string" && typeof (entry as Record<string, unknown>).contents === "string")) throw new Error("each addition must have a path and base64url contents");
  if (!deletions.every((entry) => typeof entry === "object" && entry !== null && typeof (entry as Record<string, unknown>).path === "string")) throw new Error("each deletion must have a path");
  return { additions: additions as LocalUpdate["additions"], deletions: deletions as LocalUpdate["deletions"] };
}

function readJson(path: string) {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function parseJsonAddition(contents: string, path: string) {
  try {
    return JSON.parse(Buffer.from(contents, "base64url").toString("utf8")) as unknown;
  } catch {
    throw new Error(`${path} must contain valid JSON`);
  }
}

export function validateThinkingAuthoringUpdate(value: unknown) {
  const update = parseUpdate(value);
  const additions = new Map(update.additions.map((entry) => [entry.path, entry.contents]));
  const deletions = new Set(update.deletions.map((entry) => entry.path));
  for (const path of [...additions.keys(), ...deletions]) if (!contentPath.test(path) && !mediaPath.test(path)) throw new Error(`saving ${path} is outside the Thinking content and media directories`);

  const readCandidate = (relativePath: string) => {
    if (deletions.has(relativePath)) throw new Error(`${relativePath} is required`);
    const addition = additions.get(relativePath);
    return addition === undefined ? readJson(join(contentRoot, relativePath.slice("src/content/thinking/".length))) : parseJsonAddition(addition, relativePath);
  };
  const indexes = Object.fromEntries(locales.map((locale) => [locale, readCandidate(`src/content/thinking/${locale}/index.json`)])) as Record<Locale, unknown>;
  const articles = locales.flatMap((locale) => {
    const directory = join(contentRoot, locale, "articles");
    const paths = new Set(readdirSync(directory).filter((name) => name.endsWith(".json")).map((name) => `src/content/thinking/${locale}/articles/${name}`));
    for (const path of additions.keys()) if (path.startsWith(`src/content/thinking/${locale}/articles/`)) paths.add(path);
    return [...paths].filter((path) => !deletions.has(path)).sort().map((path) => ({ path: path.replace("src/content/thinking/", ""), value: readCandidate(path) }));
  });
  validateThinkingRepository(indexes, articles);
}

export function validateSiteAuthoringUpdate(value: unknown) {
  const update = parseUpdate(value);
  const additions = new Map(update.additions.map((entry) => [entry.path, entry.contents]));
  const deletions = new Set(update.deletions.map((entry) => entry.path));

  for (const path of [...additions.keys(), ...deletions]) {
    if (!contentPath.test(path) && !mediaPath.test(path) && !siteContentPath.test(path) && !siteMediaPath.test(path)) {
      throw new Error(`saving ${path} is outside approved site content and media directories`);
    }
  }

  const touchesThinking = [...additions.keys(), ...deletions].some((path) => contentPath.test(path) || mediaPath.test(path));
  if (touchesThinking) validateThinkingAuthoringUpdate(value);

  const readFoundation = (locale: Locale) => {
    const path = `src/content/site/${locale}/authoring-foundation.json`;
    if (deletions.has(path)) throw new Error(`${path} is required`);
    const addition = additions.get(path);
    const source = addition === undefined
      ? readJson(join(siteContentRoot, locale, "authoring-foundation.json"))
      : parseJsonAddition(addition, path);
    return validateAuthoringFoundation(source, `${locale}/authoring-foundation.json`);
  };

  const readHome = (locale: Locale) => {
    const path = `src/content/site/${locale}/home.json`;
    if (deletions.has(path)) throw new Error(`${path} is required`);
    const addition = additions.get(path);
    const source = addition === undefined
      ? readJson(join(siteContentRoot, locale, "home.json"))
      : parseJsonAddition(addition, path);
    return validateHomeContent(source, `${locale}/home.json`);
  };

  const readAbout = (locale: Locale) => {
    const path = `src/content/site/${locale}/about.json`;
    if (deletions.has(path)) throw new Error(`${path} is required`);
    const addition = additions.get(path);
    const source = addition === undefined ? readJson(join(siteContentRoot, locale, "about.json")) : parseJsonAddition(addition, path);
    return validateAboutContent(source, `${locale}/about.json`);
  };

  const readRunning = (locale: Locale) => {
    const path = `src/content/site/${locale}/running.json`;
    if (deletions.has(path)) throw new Error(`${path} is required`);
    const addition = additions.get(path);
    const source = addition === undefined ? readJson(join(siteContentRoot, locale, "running.json")) : parseJsonAddition(addition, path);
    return validateRunningContent(source, `${locale}/running.json`);
  };

  const readLocalized = (locale: Locale, name: "contact" | "site-settings") => {
    const path = `src/content/site/${locale}/${name}.json`;
    if (deletions.has(path)) throw new Error(`${path} is required`);
    const addition = additions.get(path);
    const source = addition === undefined ? readJson(join(siteContentRoot, locale, `${name}.json`)) : parseJsonAddition(addition, path);
    return name === "contact" ? validateContactContent(source, `${locale}/${name}.json`) : validateSiteSettings(source, `${locale}/${name}.json`);
  };

  for (const locale of locales) {
    readFoundation(locale);
    readHome(locale);
    readAbout(locale);
    readRunning(locale);
    readLocalized(locale, "contact");
    readLocalized(locale, "site-settings");
  }
}
