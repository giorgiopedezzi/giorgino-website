import type { MetadataRoute } from "next";

import { locales } from "@/content/locales";
import { getThinkingContent } from "@/content/thinking";
import { getStandardPages } from "@/content/standard-pages";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const staticPaths = ["", "/contact", "/really-about-me", "/running", "/thinking", "/thinking/dialogues"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries = locales.flatMap((locale) => {
    const localePaths = [
      ...staticPaths,
      ...getThinkingContent(locale).articles.map((article) => `/thinking/${article.slug}`),
      ...getStandardPages(locale).map((page) => `/${page.slug}`),
    ];

    return localePaths.map((path) => ({
      url: new URL(`/${locale}${path}`, siteUrl).toString(),
    }));
  });

  return entries;
}
