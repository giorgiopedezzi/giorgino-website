import { notFound } from "next/navigation";

import { RoutePlaceholder } from "@/components/routes/RoutePlaceholder";
import { isLocale } from "@/content/locales";

export default async function ReallyAboutMePage({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return <RoutePlaceholder locale={locale} label={locale === "it" ? "Davvero di me" : "Really About Me"} heading={locale === "it" ? "I dettagli cambiano l'insieme." : "The details change the whole."} body={locale === "it" ? "Questa pagina raccoglierà il lato più personale del percorso." : "This page will hold the more personal side of the journey."} />;
}
