import type { Metadata } from "next";

import { getAlternateLocalePath } from "./locale-routing";
import type { Locale } from "./locales";

const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");

export function getLocaleMetadata(locale: Locale, pathname: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    metadataBase,
    alternates: {
      canonical: pathname,
      languages: getAlternateLocalePath(locale, pathname),
    },
  };
}
