import { notFound } from "next/navigation";

import { RoutePlaceholder } from "@/components/routes/RoutePlaceholder";
import { isLocale } from "@/content/locales";

export default async function ThinkingArticlePage({ params }: Readonly<{ params: Promise<{ locale: string; slug: string }> }>) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return <RoutePlaceholder locale={locale} label={locale === "it" ? "Articolo" : "Article"} heading={locale === "it" ? "Una linea di pensiero, seguita con calma." : "A line of thought, followed with care."} body={locale === "it" ? "Questo spazio ospiterà un articolo quando il sistema editoriale sarà pronto." : "This space will hold an article when the editorial system is ready."} />;
}
