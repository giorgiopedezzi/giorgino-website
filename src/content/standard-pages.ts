import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { validateContentMetadata, type ContentMetadata } from "./content-metadata";
import { locales, type Locale } from "./locales";
import type { NormalPageSection } from "./page-sections";
import { validateNormalPageSections } from "./site-content";

export type StandardPage = {
  slug: string;
  locale: Locale;
  translationKey: string;
  title: string;
  metadata: ContentMetadata;
  status: "draft" | "published";
  navigationLabel: string;
  showInNavigation: boolean;
  navigationOrder: number;
  sections: NormalPageSection[];
};

type StandardPageInput = { path: string; value: unknown };
const root = join(process.cwd(), "src", "content", "site");
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const reservedSlugs = new Set(["authoring-foundation", "contact", "really-about-me", "running", "thinking"]);

function fail(path: string, message: string): never { throw new Error(`Standard page validation failed at ${path}: ${message}`); }
function record(value: unknown, path: string): Record<string, unknown> { if (typeof value !== "object" || value === null || Array.isArray(value)) fail(path, "expected an object"); return value as Record<string, unknown>; }
function text(value: unknown, path: string) { if (typeof value !== "string" || value.trim() === "") fail(path, "expected a non-empty string"); return value; }
function positiveInteger(value: unknown, path: string) { if (typeof value !== "number" || !Number.isInteger(value) || value < 1) fail(path, "must be a positive integer"); return value; }

function validateStandardPage(value: unknown, path: string): StandardPage {
  const source = record(value, path);
  const locale = text(source.locale, `${path}.locale`);
  if (!locales.includes(locale as Locale)) fail(`${path}.locale`, `unsupported locale "${locale}"`);
  const slug = text(source.slug, `${path}.slug`);
  if (!slugPattern.test(slug)) fail(`${path}.slug`, "must be a lowercase URL slug");
  if (reservedSlugs.has(slug)) fail(`${path}.slug`, "is reserved by an existing special route");
  const translationKey = text(source.translationKey, `${path}.translationKey`);
  if (!slugPattern.test(translationKey)) fail(`${path}.translationKey`, "must be a lowercase stable identity");
  const status = text(source.status, `${path}.status`);
  if (status !== "draft" && status !== "published") fail(`${path}.status`, `unsupported status "${status}"`);
  if (typeof source.showInNavigation !== "boolean") fail(`${path}.showInNavigation`, "expected a boolean");
  return { slug, locale: locale as Locale, translationKey, title: text(source.title, `${path}.title`), metadata: validateContentMetadata(source.metadata, `${path}.metadata`), status, navigationLabel: text(source.navigationLabel, `${path}.navigationLabel`), showInNavigation: source.showInNavigation, navigationOrder: positiveInteger(source.navigationOrder, `${path}.navigationOrder`), sections: validateNormalPageSections(source.sections, `${path}.sections`) };
}

export function validateStandardPageRepository(entries: StandardPageInput[]): StandardPage[] {
  const pages = entries.map(({ path, value }) => validateStandardPage(value, path));
  const localeSlugs = new Set<string>();
  const localeTranslations = new Set<string>();
  const navigationOrders = new Set<string>();
  for (const page of pages) {
    const localeSlug = `${page.locale}:${page.slug}`;
    if (localeSlugs.has(localeSlug)) fail(page.slug, `duplicate slug for locale ${page.locale}`);
    localeSlugs.add(localeSlug);
    const localeTranslation = `${page.locale}:${page.translationKey}`;
    if (localeTranslations.has(localeTranslation)) fail(page.translationKey, `duplicate translation identity for locale ${page.locale}`);
    localeTranslations.add(localeTranslation);
    if (page.showInNavigation) {
      const navigationOrder = `${page.locale}:${page.navigationOrder}`;
      if (navigationOrders.has(navigationOrder)) fail(page.slug, `duplicate visible navigation order ${page.navigationOrder} for locale ${page.locale}`);
      navigationOrders.add(navigationOrder);
    }
  }
  return pages;
}

function loadRepository(): StandardPage[] {
  const entries = locales.flatMap((locale) => {
    const directory = join(root, locale, "pages");
    if (!existsSync(directory)) return [];
    return readdirSync(directory).filter((name) => name.endsWith(".json")).sort().map((name) => {
      const path = `${locale}/pages/${name}`;
      try { return { path, value: JSON.parse(readFileSync(join(directory, name), "utf8")) }; } catch (error) { fail(path, `could not read JSON (${error instanceof Error ? error.message : String(error)})`); }
    });
  });
  return validateStandardPageRepository(entries);
}

function pagesFor(locale: Locale, includeDrafts: boolean) { return loadRepository().filter((page) => page.locale === locale && (includeDrafts || page.status === "published")); }
export function getStandardPages(locale: Locale, includeDrafts = false) { return pagesFor(locale, includeDrafts); }
export function getStandardPage(locale: Locale, slug: string, includeDrafts = false) { return pagesFor(locale, includeDrafts).find((page) => page.slug === slug); }
export function getTranslatedStandardPageSlug(sourceLocale: Locale, sourceSlug: string, targetLocale: Locale, includeDrafts = false) { const source = getStandardPage(sourceLocale, sourceSlug, includeDrafts); return source ? getStandardPages(targetLocale, includeDrafts).find((page) => page.translationKey === source.translationKey)?.slug : undefined; }
export function getStandardPageNavigationEntries(locale: Locale) { return getStandardPages(locale).filter((page) => page.showInNavigation).sort((a, b) => a.navigationOrder - b.navigationOrder).map((page) => ({ label: page.navigationLabel, href: `/${locale}/${page.slug}` })); }
