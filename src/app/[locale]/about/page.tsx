import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { SiteNavigation } from "@/components/navigation/SiteNavigation";
import { EditorialIndex } from "@/components/thinking/EditorialSystem";
import { getAboutIndex } from "@/content/about-index";
import { isLocale } from "@/content/locales";
import { getLocaleMetadata } from "@/content/locale-metadata";

export async function generateMetadata({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return getLocaleMetadata(locale, `/${locale}/about`, getAboutIndex(locale).metadata);
}

export default async function AboutPage({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { isEnabled: isPreview } = await draftMode();
  const { label, heading, introduction, entries } = getAboutIndex(locale, isPreview);
  return <><SiteNavigation locale={locale} placement="header" /><main><EditorialIndex headingId="about-heading" label={label} heading={heading} introduction={introduction} entries={entries} /></main><SiteNavigation locale={locale} placement="footer" /></>;
}
