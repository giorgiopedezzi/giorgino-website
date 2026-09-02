"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Locale } from "@/content/locales";

import styles from "./SiteNavigation.module.css";

export function LanguageSwitcher({ locale, copy }: { locale: Locale; copy: { label: string; english: string; italian: string } }) {
  const pathname = usePathname() ?? `/${locale}`;

  return (
    <nav aria-label={copy.label} className={styles.languageSwitcher}>
      {(["en", "it"] as const).map((nextLocale) => (
        nextLocale === "it" ? (
          <span aria-disabled="true" className={styles.disabledLanguage} key={nextLocale} lang={nextLocale}>
            {copy.italian}
          </span>
        ) : (
          <Link
            aria-current={nextLocale === locale ? "page" : undefined}
            className={nextLocale === locale ? styles.activeLanguage : undefined}
            href={`/locale/${nextLocale}?returnTo=${encodeURIComponent(pathname)}`}
            key={nextLocale}
            lang={nextLocale}
          >
            {copy.english}
          </Link>
        )
      ))}
    </nav>
  );
}
