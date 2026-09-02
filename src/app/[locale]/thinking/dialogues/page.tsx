import { notFound } from "next/navigation";

import { SiteNavigation } from "@/components/navigation/SiteNavigation";
import { BodyCopy, DisplayHeading, PageContainer, Section, SectionLabel } from "@/components/primitives/Editorial";
import { DialogueArtifacts } from "@/components/thinking/EditorialSystem";
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
  return <><SiteNavigation locale={locale} placement="header" /><main><Section aria-labelledby="dialogues-heading"><PageContainer><SectionLabel>{dialogues.label}</SectionLabel><DisplayHeading id="dialogues-heading">{dialogues.heading}</DisplayHeading><BodyCopy>{dialogues.introduction}</BodyCopy><DialogueArtifacts artifacts={dialogueArtifacts} emptyLabel={dialogues.emptyLabel} /></PageContainer></Section></main></>;
}
