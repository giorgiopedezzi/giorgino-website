import { notFound } from "next/navigation";

import { isLocale, locales } from "@/content/locales";
import { getLocaleMetadata } from "@/content/locale-metadata";
import { getSiteSettings } from "@/content/site-settings";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return getLocaleMetadata(locale, `/${locale}`, getSiteSettings(locale).metadata);
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <div lang={locale} dir="ltr">{children}</div>;
}
