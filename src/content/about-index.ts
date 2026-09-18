import { readFileSync } from "node:fs";
import { join } from "node:path";

import { resolveEditorialHub, validateEditorialHubSource, type EditorialHubEntrySource, type EditorialHubSource } from "./editorial-hub";
import { locales, type Locale } from "./locales";
import { getStandardPages, type StandardPage } from "./standard-pages";
import type { EditorialHub } from "./types";

function fail(path: string, message: string): never {
  throw new Error(`About index validation failed at ${path}: ${message}`);
}

function targetSlug(target: string) {
  return target.split("/").filter(Boolean).at(-1) ?? target;
}

function resolveAboutEntry(entry: EditorialHubEntrySource, entryPath: string, locale: Locale, pages: StandardPage[], includeDrafts: boolean) {
  if (entry.kind === "reallyAboutMe") {
    return {
      identity: "about:really-about-me",
      href: `/${locale}/really-about-me`,
      fallbackTitle: locale === "it" ? "Davvero di me" : "Really About Me",
      available: true,
    };
  }
  if (entry.kind !== "standardPage") fail(`${entryPath}.kind`, `unsupported About target kind "${entry.kind}"`);
  const target = entry.target;
  if (!target) fail(`${entryPath}.target`, "is required for a standard page");
  const page = pages.find((candidate) => candidate.locale === locale && candidate.slug === targetSlug(target));
  if (!page) fail(`${entryPath}.target`, `does not identify a standard page in locale ${locale}`);
  return {
    identity: `standard-page:${page.translationKey}`,
    href: `/${locale}/${page.slug}`,
    fallbackTitle: page.title,
    fallbackSummary: page.metadata.description,
    available: includeDrafts || page.status === "published",
  };
}

export function validateAboutIndexes(indexes: Record<Locale, unknown>, pages: StandardPage[]) {
  const sources = Object.fromEntries(locales.map((locale) => [locale, validateEditorialHubSource(indexes[locale], `${locale}/about-index.json`)])) as Record<Locale, EditorialHubSource>;
  for (const locale of locales) {
    resolveAboutIndexFromRepository(sources[locale], locale, pages, true);
  }
  return sources;
}

export function resolveAboutIndexFromRepository(source: EditorialHubSource, locale: Locale, pages: StandardPage[], includeDrafts = false) {
  return resolveEditorialHub(source, `${locale}/about-index.json`, (entry, path) => resolveAboutEntry(entry, path, locale, pages, includeDrafts));
}

function readIndex(locale: Locale) {
  const path = join(process.cwd(), "src", "content", "site", locale, "about-index.json");
  try { return JSON.parse(readFileSync(path, "utf8")) as unknown; }
  catch (error) { fail(`${locale}/about-index.json`, `could not read JSON (${error instanceof Error ? error.message : String(error)})`); }
}

export function getAboutIndex(locale: Locale, includeDrafts = false): EditorialHub {
  const pages = getStandardPages(locale, true);
  const source = validateEditorialHubSource(readIndex(locale), `${locale}/about-index.json`);
  return resolveAboutIndexFromRepository(source, locale, pages, includeDrafts);
}
