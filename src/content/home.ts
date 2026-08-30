import { homeEn } from "./en/home";
import { homeIt } from "./it/home";
import type { Locale } from "./locales";
import type { HomeContent } from "./types";

const homeContent: Record<Locale, HomeContent> = {
  en: homeEn,
  it: homeIt,
};

export function getHomeContent(locale: Locale): HomeContent {
  return homeContent[locale];
}
