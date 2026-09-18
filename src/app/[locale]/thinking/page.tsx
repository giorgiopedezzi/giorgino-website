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
  const { label, heading, introduction, entries } = getThinkingContent(locale, isPreview);

  return <><SiteNavigation locale={locale} placement="header" /><main>{isPreview && <ThinkingPreviewState />}<EditorialIndex headingId="thinking-heading" label={label} heading={heading} introduction={introduction} entries={entries} /></main></>;
}
