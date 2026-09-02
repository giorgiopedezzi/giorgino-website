import { notFound } from "next/navigation";

import { SiteNavigation } from "@/components/navigation/SiteNavigation";
import { RunningProject } from "@/components/running/RunningProject";
import { isLocale } from "@/content/locales";
import { getLocaleMetadata } from "@/content/locale-metadata";
import { getRunningContent } from "@/content/running";

export async function generateMetadata({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const content = getRunningContent(locale);
  return getLocaleMetadata(locale, `/${locale}/running`, content.metadata);
}

export default async function RunningPage({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <><SiteNavigation locale={locale} placement="header" /><main><RunningProject locale={locale} /></main></>;
}
