import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { SiteNavigation } from "@/components/navigation/SiteNavigation";
import { EditorialIndex } from "@/components/thinking/EditorialSystem";
import { ThinkingPreviewState } from "@/components/thinking/ThinkingPreviewState";
import { isLocale } from "@/content/locales";
import { getLocaleMetadata } from "@/content/locale-metadata";
import { getThinkingContent } from "@/content/thinking";

export async function generateMetadata({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return getLocaleMetadata(locale, `/${locale}/thinking`, getThinkingContent(locale).metadata);
}

export default async function ThinkingPage({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { isEnabled: isPreview } = await draftMode();

  return <><SiteNavigation locale={locale} placement="header" /><main>{isPreview && <ThinkingPreviewState />}<EditorialIndex locale={locale} {...getThinkingContent(locale, isPreview)} /></main></>;
}
