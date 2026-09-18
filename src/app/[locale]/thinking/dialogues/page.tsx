import { notFound } from "next/navigation";

import { SiteNavigation } from "@/components/navigation/SiteNavigation";
import { DialogueArtifacts, EditorialPageShell } from "@/components/thinking/EditorialSystem";
import { isLocale } from "@/content/locales";
import { getLocaleMetadata } from "@/content/locale-metadata";
import { getThinkingContent } from "@/content/thinking";

export async function generateMetadata({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const dialogues = getThinkingContent(locale).dialogues;
  return getLocaleMetadata(locale, `/${locale}/thinking/dialogues`, dialogues.metadata);
}

export default async function DialoguesPage({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { dialogueArtifacts, dialogues } = getThinkingContent(locale);
  return <><SiteNavigation locale={locale} placement="header" /><main><EditorialPageShell headingId="dialogues-heading" label={dialogues.label} heading={dialogues.heading} introduction={dialogues.introduction}><DialogueArtifacts artifacts={dialogueArtifacts} emptyLabel={dialogues.emptyLabel} /></EditorialPageShell></main></>;
}
