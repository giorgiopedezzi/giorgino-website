import { notFound } from "next/navigation";

import { RoutePlaceholder } from "@/components/routes/RoutePlaceholder";
import { isLocale } from "@/content/locales";

export default async function RunningPage({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return <RoutePlaceholder locale={locale} label="Running / Building" heading={locale === "it" ? "Il runner dà significato ai dati." : "The runner gives the data meaning."} body={locale === "it" ? "Il progetto running avrà qui il suo spazio dedicato." : "The running project will have its dedicated space here."} />;
}
