import { notFound } from "next/navigation";

import { SiteNavigation } from "@/components/navigation/SiteNavigation";
import { DisplayHeading, PageContainer, Section, SectionLabel } from "@/components/primitives/Editorial";
import { RichTextCopy, RichTextInline } from "@/components/primitives/RichText";
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
  return <><SiteNavigation locale={locale} placement="header" /><main><Section aria-labelledby="dialogues-heading"><PageContainer><SectionLabel>{dialogues.label}</SectionLabel><DisplayHeading id="dialogues-heading"><RichTextInline value={dialogues.heading} /></DisplayHeading><RichTextCopy value={dialogues.introduction} /><DialogueArtifacts artifacts={dialogueArtifacts} emptyLabel={dialogues.emptyLabel} /></PageContainer></Section></main></>;
}
