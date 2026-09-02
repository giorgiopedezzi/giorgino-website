import { notFound } from "next/navigation";

import { ReallyAboutMe } from "@/components/about/ReallyAboutMe";
import { SiteNavigation } from "@/components/navigation/SiteNavigation";
import { getHomeContent } from "@/content/home";
import { isLocale } from "@/content/locales";
import { getLocaleMetadata } from "@/content/locale-metadata";
import { getSiteSettings } from "@/content/site-settings";

export async function generateMetadata({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return getLocaleMetadata(locale, `/${locale}/really-about-me`, getSiteSettings(locale).aboutMetadata);
}

export default async function ReallyAboutMePage({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return <><SiteNavigation locale={locale} placement="header" /><main><ReallyAboutMe content={getHomeContent(locale).personalNarrative} locale={locale} /></main><SiteNavigation locale={locale} placement="footer" /></>;
}
