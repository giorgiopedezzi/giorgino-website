import { notFound } from "next/navigation";

import { SiteNavigation } from "@/components/navigation/SiteNavigation";
import { BodyCopy, DisplayHeading, PageContainer, Section, SectionLabel } from "@/components/primitives/Editorial";
import { DialogueArtifacts } from "@/components/thinking/EditorialSystem";
import { isLocale } from "@/content/locales";
import { thinkingContent } from "@/content/thinking";

export default async function DialoguesPage({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const isItalian = locale === "it";
  return <><SiteNavigation locale={locale} placement="header" /><main><Section aria-labelledby="dialogues-heading"><PageContainer><SectionLabel>{isItalian ? "Dialoghi con l'AI" : "Dialogues with AI"}</SectionLabel><DisplayHeading id="dialogues-heading">{isItalian ? "Conversazioni da tenere aperte." : "Conversations worth keeping open."}</DisplayHeading><BodyCopy>{isItalian ? "Riflessioni nate da conversazioni reali, con i loro artefatti originali." : "Reflections from real conversations, with their original artifacts."}</BodyCopy><DialogueArtifacts artifacts={thinkingContent[locale].dialogueArtifacts} emptyLabel={isItalian ? "Nessun dialogo pubblicato." : "No dialogues published."} /></PageContainer></Section></main></>;
}
