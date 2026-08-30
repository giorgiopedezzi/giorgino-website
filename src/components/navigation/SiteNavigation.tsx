import Link from "next/link";

import type { Locale } from "@/content/locales";

import styles from "./SiteNavigation.module.css";

type SiteNavigationProps = {
  locale: Locale;
  placement: "footer" | "header";
};

const copy = {
  en: {
    home: "Home",
    heading: "Elsewhere",
    prompt: "Find a different thread.",
    menu: "Navigate",
    links: [
      ["Thinking", "thinking"],
      ["Dialogues with AI", "thinking/dialogues"],
      ["Running / Building", "running"],
      ["Really About Me", "really-about-me"],
      ["Contact", "contact"],
    ],
  },
  it: {
    home: "Home",
    heading: "Altrove",
    prompt: "Segui un altro filo.",
    menu: "Naviga",
    links: [
      ["Pensieri", "thinking"],
      ["Dialoghi con l'AI", "thinking/dialogues"],
      ["Running / Building", "running"],
      ["Davvero di me", "really-about-me"],
      ["Contatti", "contact"],
    ],
  },
} as const;

export function SiteNavigation({ locale, placement }: SiteNavigationProps) {
  const text = copy[locale];
  const basePath = `/${locale}`;

  if (placement === "header") {
    return (
      <header className={styles.header}>
        <Link className={styles.homeLink} href={basePath}>{text.home}</Link>
        <details className={styles.menu}>
          <summary>{text.menu}</summary>
          <nav aria-label={text.menu} className={styles.menuLinks}>
            {text.links.map(([label, path]) => <Link href={`${basePath}/${path}`} key={path}>{label}</Link>)}
          </nav>
        </details>
      </header>
    );
  }

  return (
    <footer className={styles.footer} aria-labelledby="explore-heading">
      <p className={styles.eyebrow}>{text.heading}</p>
      <h2 id="explore-heading">{text.prompt}</h2>
      <nav aria-label={text.heading} className={styles.footerLinks}>
        {text.links.map(([label, path]) => <Link href={`${basePath}/${path}`} key={path}>{label}</Link>)}
      </nav>
    </footer>
  );
}
