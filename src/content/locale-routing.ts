import { thinkingContent } from "./thinking";
import type { Locale } from "./locales";

function pathSegments(pathname: string) {
  return pathname.split("?")[0].split("#")[0].split("/").filter(Boolean);
}

export function getLocalePath(pathname: string, targetLocale: Locale) {
  const segments = pathSegments(pathname);
  const currentLocale = segments[0] as Locale | undefined;

  if (!currentLocale || (currentLocale !== "en" && currentLocale !== "it")) {
    return `/${targetLocale}`;
  }

  if (currentLocale === targetLocale) {
    return pathname;
  }

  if (segments[1] === "thinking" && segments[2]) {
    const articleIndex = thinkingContent[currentLocale].articles.findIndex((article) => article.slug === segments[2]);
    const translatedArticle = thinkingContent[targetLocale].articles[articleIndex];

    if (!translatedArticle) {
      return `/${targetLocale}/thinking`;
    }

    return `/${targetLocale}/thinking/${translatedArticle.slug}`;
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
