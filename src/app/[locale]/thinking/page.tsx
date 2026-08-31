import { notFound } from "next/navigation";

import { SiteNavigation } from "@/components/navigation/SiteNavigation";
import { EditorialIndex } from "@/components/thinking/EditorialSystem";
import { isLocale } from "@/content/locales";
import { getLocaleMetadata } from "@/content/locale-metadata";
import { thinkingContent } from "@/content/thinking";

export async function generateMetadata({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return getLocaleMetadata(
    locale,
    `/${locale}/thinking`,
    locale === "it" ? "Pensieri — Giorgio Pedezzi" : "Thinking — Giorgio Pedezzi",
    thinkingContent[locale].introduction,
  );
}

export default async function ThinkingPage({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <><SiteNavigation locale={locale} placement="header" /><main><EditorialIndex locale={locale} {...thinkingContent[locale]} /></main></>;
}
