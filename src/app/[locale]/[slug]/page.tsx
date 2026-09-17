import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { SiteNavigation } from "@/components/navigation/SiteNavigation";
import { DisplayHeading, PageContainer } from "@/components/primitives/Editorial";
import { NormalPageSections } from "@/components/page-sections/NormalPageSections";
import { isLocale } from "@/content/locales";
import { getLocaleMetadata } from "@/content/locale-metadata";
import { getStandardPage } from "@/content/standard-pages";

export async function generateMetadata({ params }: Readonly<{ params: Promise<{ locale: string; slug: string }> }>) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const { isEnabled: isPreview } = await draftMode();
  const page = getStandardPage(locale, slug, isPreview);
  if (!page) notFound();
  return isPreview ? { robots: { index: false, follow: false } } : getLocaleMetadata(locale, `/${locale}/${slug}`, page.metadata);
}

export default async function StandardPage({ params }: Readonly<{ params: Promise<{ locale: string; slug: string }> }>) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const { isEnabled: isPreview } = await draftMode();
  const page = getStandardPage(locale, slug, isPreview);
  if (!page) notFound();
  return <><SiteNavigation locale={locale} placement="header" /><main><PageContainer><DisplayHeading>{page.title}</DisplayHeading><NormalPageSections sections={page.sections} /></PageContainer></main></>;
}
