import { notFound } from "next/navigation";

import { SiteNavigation } from "@/components/navigation/SiteNavigation";
import { EditorialIndex } from "@/components/thinking/EditorialSystem";
import { isLocale } from "@/content/locales";
import { thinkingContent } from "@/content/thinking";

export default async function ThinkingPage({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <><SiteNavigation locale={locale} placement="header" /><main><EditorialIndex locale={locale} {...thinkingContent[locale]} /></main></>;
}
