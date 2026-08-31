import { notFound } from "next/navigation";

import { ReallyAboutMe } from "@/components/about/ReallyAboutMe";
import { SiteNavigation } from "@/components/navigation/SiteNavigation";
import { isLocale } from "@/content/locales";

export default async function ReallyAboutMePage({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return <><SiteNavigation locale={locale} placement="header" /><main><ReallyAboutMe locale={locale} /></main><SiteNavigation locale={locale} placement="footer" /></>;
}
