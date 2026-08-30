import { notFound } from "next/navigation";

import { RoutePlaceholder } from "@/components/routes/RoutePlaceholder";
import { isLocale } from "@/content/locales";

export default async function ThinkingPage({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return <RoutePlaceholder locale={locale} label={locale === "it" ? "Pensieri" : "Thinking"} heading={locale === "it" ? "Appunti che vale la pena lasciare incompiuti." : "Some notes worth leaving unfinished."} body={locale === "it" ? "L'indice editoriale arriverà qui." : "The editorial index will live here."} />;
}
