import { notFound } from "next/navigation";

import { SiteNavigation } from "@/components/navigation/SiteNavigation";
import { RunningProject } from "@/components/running/RunningProject";
import { isLocale } from "@/content/locales";
import { getLocaleMetadata } from "@/content/locale-metadata";

export async function generateMetadata({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return getLocaleMetadata(
    locale,
    `/${locale}/running`,
    locale === "it" ? "Running / Building — Giorgio Pedezzi" : "Running / Building — Giorgio Pedezzi",
    locale === "it" ? "Un piccolo linguaggio visivo per una persona in movimento." : "A small visual language for a moving human being.",
  );
}

export default async function RunningPage({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return <><SiteNavigation locale={locale} placement="header" /><main><RunningProject locale={locale} /></main></>;
}
