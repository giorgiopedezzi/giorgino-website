import { notFound } from "next/navigation";

import { HomePage } from "@/components/home/HomePage";
import { SiteNavigation } from "@/components/navigation/SiteNavigation";
import { getHomeContent } from "@/content/home";
import { isLocale, locales } from "@/content/locales";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
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
      <HomePage content={getHomeContent(locale)} />
      <SiteNavigation locale={locale} placement="footer" />
    </>
  );
}
