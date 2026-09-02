import Link from "next/link";

import type { Locale } from "@/content/locales";
import { getSiteSettings } from "@/content/site-settings";

import { LanguageSwitcher } from "./LanguageSwitcher";
import styles from "./SiteNavigation.module.css";

type SiteNavigationProps = {
  locale: Locale;
  placement: "footer" | "header";
};

export function SiteNavigation({ locale, placement }: SiteNavigationProps) {
  const settings = getSiteSettings(locale);
  const text = settings.navigation;
  const basePath = `/${locale}`;
  const links = [
    [text.thinking, "thinking"],
    [text.dialogues, "thinking/dialogues"],
    [text.running, "running"],
    [text.about, "really-about-me"],
    [text.contact, "contact"],
  ] as const;

  if (placement === "header") {
    return (
      <header className={styles.header}>
        <Link className={styles.homeLink} href={basePath}>{text.home}</Link>
        <div className={styles.headerActions}>
          <LanguageSwitcher locale={locale} copy={settings.language} />
          <details className={styles.menu}>
            <summary>{text.menu}</summary>
            <nav aria-label={text.menu} className={styles.menuLinks}>
              {links.map(([label, path]) => <Link href={`${basePath}/${path}`} key={path}>{label}</Link>)}
            </nav>
          </details>
        </div>
      </header>
    );
  }

  return (
    <footer className={styles.footer} aria-labelledby="explore-heading">
      <p className={styles.eyebrow}>{text.footerLabel}</p>
      <h2 id="explore-heading">{text.footerHeading}</h2>
      <nav aria-label={text.footerLabel} className={styles.footerLinks}>
        {links.map(([label, path]) => <Link href={`${basePath}/${path}`} key={path}>{label}</Link>)}
      </nav>
      <LanguageSwitcher locale={locale} copy={settings.language} />
    </footer>
  );
}
