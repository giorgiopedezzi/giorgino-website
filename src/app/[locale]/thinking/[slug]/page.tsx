import { notFound } from "next/navigation";

import { SiteNavigation } from "@/components/navigation/SiteNavigation";
import { EditorialArticleView } from "@/components/thinking/EditorialSystem";
import { isLocale } from "@/content/locales";
import { getEditorialArticle } from "@/content/thinking";

export default async function ThinkingArticlePage({ params }: Readonly<{ params: Promise<{ locale: string; slug: string }> }>) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const article = getEditorialArticle(locale, slug);
  if (!article) notFound();

  return <><SiteNavigation locale={locale} placement="header" /><main><EditorialArticleView article={article} /></main></>;
}
