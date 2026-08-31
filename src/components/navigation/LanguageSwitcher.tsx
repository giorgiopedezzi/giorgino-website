"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getLocalePath } from "@/content/locale-routing";
import type { Locale } from "@/content/locales";

import styles from "./SiteNavigation.module.css";

const copy = {
  en: { label: "Language", english: "EN", italian: "IT" },
  it: { label: "Lingua", english: "EN", italian: "IT" },
} as const;

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? `/${locale}`;
  const text = copy[locale];

  return (
    <nav aria-label={text.label} className={styles.languageSwitcher}>
      {(["en", "it"] as const).map((nextLocale) => (
        <Link
          aria-current={nextLocale === locale ? "page" : undefined}
          className={nextLocale === locale ? styles.activeLanguage : undefined}
          href={`/locale/${nextLocale}?returnTo=${encodeURIComponent(getLocalePath(pathname, nextLocale))}`}
          key={nextLocale}
          lang={nextLocale}
        >
          {nextLocale === "en" ? text.english : text.italian}
        </Link>
      ))}
    </nav>
  );
}
