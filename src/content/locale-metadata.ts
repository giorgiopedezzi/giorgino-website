import type { Metadata } from "next";

import type { ContentMetadata } from "./content-metadata";
import { getAlternateLocalePath } from "./locale-routing";
import type { Locale } from "./locales";
import { getSiteSettings } from "./site-settings";

const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");

export function getLocaleMetadata(locale: Locale, pathname: string, content: ContentMetadata): Metadata {
  const openGraphLocale = locale === "it" ? "it_IT" : "en_US";
  const settings = getSiteSettings(locale);
  const socialTitle = content.socialTitle ?? content.title;
  const socialDescription = content.socialDescription ?? content.description;
  const images = content.socialImage ? [{ url: content.socialImage }] : undefined;

  return {
    title: content.title,
    description: content.description,
    metadataBase,
    alternates: {
      canonical: pathname,
      languages: getAlternateLocalePath(locale, pathname),
    },
    openGraph: {
      type: "website",
      url: pathname,
      title: socialTitle,
      description: socialDescription,
      siteName: settings.siteName,
      locale: openGraphLocale,
      alternateLocale: locale === "it" ? "en_US" : "it_IT",
      images,
    },
    twitter: {
      card: content.socialImage ? "summary_large_image" : "summary",
      title: socialTitle,
      description: socialDescription,
      images: content.socialImage ? [content.socialImage] : undefined,
    },
  };
}
