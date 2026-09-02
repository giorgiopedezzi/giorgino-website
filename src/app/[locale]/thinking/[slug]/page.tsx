import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { SiteNavigation } from "@/components/navigation/SiteNavigation";
import { EditorialArticleView } from "@/components/thinking/EditorialSystem";
import { ThinkingPreviewState } from "@/components/thinking/ThinkingPreviewState";
import { isLocale } from "@/content/locales";
import { getLocaleMetadata } from "@/content/locale-metadata";
import { getEditorialArticle, getThinkingContent } from "@/content/thinking";
import { getSiteSettings } from "@/content/site-settings";

export async function generateMetadata({ params }: Readonly<{ params: Promise<{ locale: string; slug: string }> }>) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const { isEnabled: isPreview } = await draftMode();
  const article = getEditorialArticle(locale, slug, isPreview);
  if (!article) notFound();
  if (isPreview) return { robots: { index: false, follow: false } };

  const metadata = article.metadata ?? {
    title: `${article.title} — ${getSiteSettings(locale).siteName}`,
    description: article.excerpt,
  };
  return getLocaleMetadata(locale, `/${locale}/thinking/${slug}`, metadata);
}

export default async function ThinkingArticlePage({ params }: Readonly<{ params: Promise<{ locale: string; slug: string }> }>) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const { isEnabled: isPreview } = await draftMode();

  const article = getEditorialArticle(locale, slug, isPreview);
  if (!article) notFound();

  const { articleLabels } = getThinkingContent(locale, isPreview);
  return <><SiteNavigation locale={locale} placement="header" /><main>{isPreview && <ThinkingPreviewState />}<EditorialArticleView article={article} referenceLabel={articleLabels.references} relatedLinksLabel={articleLabels.relatedLinks} /></main></>;
}
