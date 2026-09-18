import { readFileSync } from "node:fs";
import { join } from "node:path";

import { validateContentMetadata, type ContentMetadata } from "./content-metadata";
import type { Locale } from "./locales";

export type SiteSettings = {
  siteName: string;
  metadata: ContentMetadata;
  navigation: {
    home: string;
    menu: string;
    footerLabel: string;
    footerHeading: string;
    thinking: string;
    running: string;
    about: string;
    contact: string;
  };
  language: { label: string; english: string; italian: string };
  socialLinks: Array<{ label: string; href: string }>;
  aboutMetadata: ContentMetadata;
};

function fail(path: string, message: string): never { throw new Error(`Site settings validation failed at ${path}: ${message}`); }
function record(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) fail(path, "expected an object");
  return value as Record<string, unknown>;
}
function text(value: unknown, path: string) {
  if (typeof value !== "string" || value.trim() === "") fail(path, "expected a non-empty string");
  return value;
}
function href(value: unknown, path: string) {
  const result = text(value, path);
  if (!/^https?:\/\//i.test(result) && !/^mailto:/i.test(result)) fail(path, "must be an http(s) or mailto URL");
  return result;
}

export function validateSiteSettings(value: unknown, path = "site-settings.json"): SiteSettings {
  const source = record(value, path);
  const navigation = record(source.navigation, `${path}.navigation`);
  const language = record(source.language, `${path}.language`);
  if (!Array.isArray(source.socialLinks)) fail(`${path}.socialLinks`, "expected an array");
  const links = source.socialLinks.map((value, index) => {
    const item = record(value, `${path}.socialLinks[${index}]`);
    return { label: text(item.label, `${path}.socialLinks[${index}].label`), href: href(item.href, `${path}.socialLinks[${index}].href`) };
  });
  if (new Set(links.map((link) => link.href)).size !== links.length) fail(`${path}.socialLinks`, "URLs must be unique");
  return {
    siteName: text(source.siteName, `${path}.siteName`),
    metadata: validateContentMetadata(source.metadata, `${path}.metadata`),
    navigation: {
      home: text(navigation.home, `${path}.navigation.home`),
      menu: text(navigation.menu, `${path}.navigation.menu`),
      footerLabel: text(navigation.footerLabel, `${path}.navigation.footerLabel`),
      footerHeading: text(navigation.footerHeading, `${path}.navigation.footerHeading`),
      thinking: text(navigation.thinking, `${path}.navigation.thinking`),
      running: text(navigation.running, `${path}.navigation.running`),
      about: text(navigation.about, `${path}.navigation.about`),
      contact: text(navigation.contact, `${path}.navigation.contact`),
    },
    language: {
      label: text(language.label, `${path}.language.label`),
      english: text(language.english, `${path}.language.english`),
      italian: text(language.italian, `${path}.language.italian`),
    },
    socialLinks: links,
    aboutMetadata: validateContentMetadata(source.aboutMetadata, `${path}.aboutMetadata`),
  };
}

export function getSiteSettings(locale: Locale) {
  const path = join(process.cwd(), "src", "content", "site", locale, "site-settings.json");
  try { return validateSiteSettings(JSON.parse(readFileSync(path, "utf8")), `${locale}/site-settings.json`); }
  catch (error) { throw new Error(`Could not load site settings for ${locale}: ${error instanceof Error ? error.message : String(error)}`); }
}
