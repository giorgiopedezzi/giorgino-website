import Image from "next/image";
import Link from "next/link";

import { BodyCopy, DisplayHeading, PageContainer, Section, SectionLabel } from "@/components/primitives/Editorial";
import type { Locale } from "@/content/locales";
import type { AboutContent } from "@/content/about";
import type { PersonalArtifact, PersonalNarrative } from "@/content/types";

import styles from "./ReallyAboutMe.module.css";

function Artifact({ artifact, label, dark = false }: { artifact: PersonalArtifact; label: string; dark?: boolean }) {
  return (
    <figure className={[styles.artifact, dark ? styles.artifactDark : ""].filter(Boolean).join(" ")}>
      <span>{label}</span>
      {artifact.media ? (
        <>
          <Image className={styles.artifactImage} src={artifact.media.src} alt={artifact.media.alt} width={860} height={420} unoptimized />
          {artifact.media.caption && <figcaption>{artifact.media.caption}</figcaption>}
        </>
      ) : <p>{artifact.placeholder}</p>}
    </figure>
  );
}

export function ReallyAboutMe({ arc, content, locale }: { arc: AboutContent["arc"]; content: PersonalNarrative; locale: Locale }) {
  const basePath = `/${locale}`;

  return <>
    <Section className={styles.hero} aria-labelledby="about-heading"><PageContainer><div className={styles.heroStack}>
      <SectionLabel>{content.label}</SectionLabel><DisplayHeading id="about-heading">{content.stillHere}</DisplayHeading><DisplayHeading as="p" className={styles.thanks}>{content.thanks}</DisplayHeading>
      <div className={styles.heart}>{content.opening.slice(0, 4).map((line) => <BodyCopy key={line}>{line}</BodyCopy>)}</div>
      <div className={styles.human}>{content.opening.slice(4, 6).map((line) => <BodyCopy key={line}>{line}</BodyCopy>)}<DisplayHeading as="p">{content.opening[6]}</DisplayHeading></div>
    </div></PageContainer></Section>

    <Section className={styles.bordered} aria-labelledby="ideas-heading"><PageContainer><div className={styles.stack}>
      <DisplayHeading as="h2" id="ideas-heading" className={styles.sectionHeading}>{content.decadeHeading}</DisplayHeading>
      <div className={styles.timeline}>{content.decadeEntries.map((idea, index) => <BodyCopy className={index === 3 ? styles.timelineFinal : ""} key={idea}>{idea}</BodyCopy>)}</div>
    </div></PageContainer></Section>

    <Section className={styles.bordered} aria-labelledby="personal-arc-heading"><PageContainer><div className={styles.stack}>
      <SectionLabel>{arc.label}</SectionLabel><DisplayHeading as="h2" id="personal-arc-heading" className={styles.sectionHeading}>{arc.heading}</DisplayHeading>
      <div className={styles.arcTimeline}>{arc.timeline.map((entry) => <BodyCopy key={entry}>{entry}</BodyCopy>)}</div>
    </div></PageContainer></Section>

    <Section tone="darkMatter" aria-labelledby="missing-heading"><PageContainer><div className={styles.stack}>
      <DisplayHeading as="h2" id="missing-heading" className={styles.sectionHeading}>{content.missingMan.heading}</DisplayHeading><BodyCopy>{content.missingMan.body}</BodyCopy><Artifact artifact={content.missingMan.artifact} label={content.artifactLabel} /><DisplayHeading as="p" className={styles.reflect}>{content.missingMan.reflection}</DisplayHeading><p className={styles.muted}>{content.missingMan.signoff}</p>
    </div></PageContainer></Section>

    <Section className={styles.pizza} aria-labelledby="pizza-heading"><PageContainer><div className={styles.pizzaStack}>
      <DisplayHeading as="h2" id="pizza-heading" className={styles.sectionHeading}>{content.pizza.heading}</DisplayHeading>{content.pizza.lines.map((line, index) => <BodyCopy className={index > 3 ? styles.pizzaEnd : ""} key={line}>{line}</BodyCopy>)}
    </div></PageContainer></Section>

    <Section tone="running" aria-labelledby="wait-heading"><PageContainer><div className={styles.stack}>
      <DisplayHeading as="h2" id="wait-heading" className={styles.waitHeading}>{content.wait.heading}</DisplayHeading><BodyCopy>{content.wait.body}</BodyCopy><Artifact artifact={content.wait.artifact} label={content.artifactLabel} dark />
    </div></PageContainer></Section>

    <Section className={styles.nonnino} aria-labelledby="nonnino-heading"><PageContainer><div className={styles.nonninoStack}><SectionLabel>{content.nonnino.label}</SectionLabel><DisplayHeading as="h2" id="nonnino-heading" className={styles.sectionHeading}>{content.nonnino.heading}</DisplayHeading></div></PageContainer></Section>

    <Section className={styles.bordered} aria-labelledby="book-heading"><PageContainer><div className={styles.stack}>
      <SectionLabel>{content.book.label}</SectionLabel><DisplayHeading as="h2" id="book-heading" className={styles.sectionHeading}>{content.book.heading}</DisplayHeading>{content.book.lines.map((line) => <BodyCopy key={line}>{line}</BodyCopy>)}<p className={styles.muted}>{content.book.signoff}</p><Link className={styles.next} href={`${basePath}/contact`}>{content.continueLabel} →</Link>
    </div></PageContainer></Section>
  </>;
}
