import { notFound } from "next/navigation";

import { RoutePlaceholder } from "@/components/routes/RoutePlaceholder";
import { isLocale } from "@/content/locales";

export default async function ContactPage({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return <RoutePlaceholder locale={locale} label={locale === "it" ? "Contatti" : "Contact"} heading={locale === "it" ? "Continuiamo la conversazione." : "Continue the conversation."} body={locale === "it" ? "I dettagli di contatto confermati appariranno qui." : "Confirmed contact details will appear here."} />;
}
