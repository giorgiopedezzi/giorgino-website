"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
        nextLocale === "it" ? (
          <span aria-disabled="true" className={styles.disabledLanguage} key={nextLocale} lang={nextLocale}>
            {text.italian}
          </span>
        ) : (
          <Link
            aria-current={nextLocale === locale ? "page" : undefined}
            className={nextLocale === locale ? styles.activeLanguage : undefined}
            href={`/locale/${nextLocale}?returnTo=${encodeURIComponent(pathname)}`}
            key={nextLocale}
            lang={nextLocale}
          >
            {text.english}
          </Link>
        )
      ))}
    </nav>
  );
}
