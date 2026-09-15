import { notFound } from "next/navigation";

import { HomePage } from "@/components/home/HomePage";
import { SiteNavigation } from "@/components/navigation/SiteNavigation";
import { getHomeContent } from "@/content/home";
import { getContactContent } from "@/content/contact";
import { getLocaleMetadata } from "@/content/locale-metadata";
import { isLocale, locales } from "@/content/locales";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { metadata } = getHomeContent(locale);

  return getLocaleMetadata(locale, `/${locale}`, metadata);
}

export default async function LocalizedHomePage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <>
      <SiteNavigation locale={locale} placement="header" />
      <HomePage
        content={getHomeContent(locale)}
        contact={getContactContent(locale)}
        footer={<SiteNavigation locale={locale} placement="footer" />}
      />
    </>
  );
}
