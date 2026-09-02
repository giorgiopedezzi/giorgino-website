import { notFound } from "next/navigation";

import { RoutePlaceholder } from "@/components/routes/RoutePlaceholder";
import { isLocale } from "@/content/locales";
import { getLocaleMetadata } from "@/content/locale-metadata";
import { getContactContent } from "@/content/contact";
import { getSiteSettings } from "@/content/site-settings";

export async function generateMetadata({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return getLocaleMetadata(locale, `/${locale}/contact`, getContactContent(locale).metadata);
}

export default async function ContactPage({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  const content = getContactContent(locale);
  return <RoutePlaceholder locale={locale} label={content.label} heading={content.heading} body={content.body} details={content.details} links={getSiteSettings(locale).socialLinks} />;
}
