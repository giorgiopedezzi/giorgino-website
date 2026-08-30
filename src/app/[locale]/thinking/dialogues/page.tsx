import { notFound } from "next/navigation";

import { RoutePlaceholder } from "@/components/routes/RoutePlaceholder";
import { isLocale } from "@/content/locales";

export default async function DialoguesPage({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return <RoutePlaceholder locale={locale} label={locale === "it" ? "Dialoghi con l'AI" : "Dialogues with AI"} heading={locale === "it" ? "Conversazioni da tenere aperte." : "Conversations worth keeping open."} body={locale === "it" ? "Qui troveranno posto riflessioni nate da conversazioni reali." : "Reflections from real conversations will find their place here."} />;
}
