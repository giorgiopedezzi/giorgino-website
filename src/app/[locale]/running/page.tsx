import { notFound } from "next/navigation";

import { SiteNavigation } from "@/components/navigation/SiteNavigation";
import { RunningProject } from "@/components/running/RunningProject";
import { isLocale } from "@/content/locales";

export default async function RunningPage({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  return <><SiteNavigation locale={locale} placement="header" /><main><RunningProject locale={locale} /></main></>;
}
