import { isLocale, type Locale } from "./locales";
import { getTranslatedThinkingSlug } from "./thinking";
import { getStandardPage, getTranslatedStandardPageSlug } from "./standard-pages";

function pathSegments(pathname: string) {
  return pathname.split("?")[0].split("#")[0].split("/").filter(Boolean);
}

export function getLocalePath(pathname: string, targetLocale: Locale) {
  const segments = pathSegments(pathname);
  const currentLocale = segments[0];

  if (!currentLocale || !isLocale(currentLocale)) return `/${targetLocale}`;
  if (currentLocale === targetLocale) return pathname;

  if (segments[1] === "thinking" && segments[2]) {
    const translatedSlug = getTranslatedThinkingSlug(currentLocale, segments[2], targetLocale);
    return translatedSlug ? `/${targetLocale}/thinking/${translatedSlug}` : `/${targetLocale}/thinking`;
  }

  if (segments.length === 2 && getStandardPage(currentLocale, segments[1], true)) {
    const translatedSlug = getTranslatedStandardPageSlug(currentLocale, segments[1], targetLocale);
    return translatedSlug ? `/${targetLocale}/${translatedSlug}` : `/${targetLocale}`;
  }

  return `/${targetLocale}${segments.length > 1 ? `/${segments.slice(1).join("/")}` : ""}`;
}

export function getAlternateLocalePath(locale: Locale, pathname: string) {
  return {
    en: getLocalePath(pathname, "en"),
    it: getLocalePath(pathname, "it"),
    "x-default": "/en",
  };
}
