import Image from "next/image";
import Link from "next/link";
import { DisplayHeading, PageContainer, Section, SectionLabel } from "@/components/primitives/Editorial";
import { RichTextCopy, RichTextInline } from "@/components/primitives/RichText";
import type { Locale } from "@/content/locales";
import type { AboutContent } from "@/content/about";
import type { PersonalArtifact, PersonalNarrative } from "@/content/types";
import styles from "./ReallyAboutMe.module.css";

function Artifact({artifact, label, dark = false}: { artifact: PersonalArtifact; label: string; dark?: boolean }) {
  return <figure className={[styles.artifact, dark ? styles.artifactDark : ""].filter(Boolean).join(" ")}>
    <span>{label}</span>{artifact.media ? <><Image className={styles.artifactImage}
                                                   style={artifact.media.stretch ? {objectFit: "fill"} : undefined}
                                                   src={artifact.media.src} alt={artifact.media.alt} width={860}
                                                   height={420} unoptimized/>{artifact.media.caption &&
      <figcaption>{artifact.media.caption}</figcaption>}</> : <RichTextCopy value={artifact.placeholder}/>}</figure>;
}

export function ReallyAboutMe({arc, content, locale}: {
  arc: AboutContent["arc"];
  content: PersonalNarrative;
  locale: Locale
}) {
  const basePath = `/${locale}`;
  const copy = (value: import("@/content/rich-text").RichText, className?: string, key?: string | number) => <RichTextCopy key={key} value={value} className={className}/>;
  return <>
    <Section className={styles.hero} aria-labelledby="about-heading"><PageContainer>
      <div className={styles.heroStack}><SectionLabel>{content.label}</SectionLabel><DisplayHeading
        id="about-heading"><RichTextInline value={content.stillHere}/></DisplayHeading><DisplayHeading as="p"
                                                                                                       className={styles.thanks}><RichTextInline
        value={content.thanks}/></DisplayHeading>
        <div
          className={styles.heart}>{content.opening.slice(0, 4).map((line, index) => copy(line, String(index), index))}</div>
        <div
          className={styles.human}>{content.opening.slice(4, 6).map((line, index) => copy(line, String(index), index))}<DisplayHeading
          as="p"><RichTextInline value={content.opening[6]}/></DisplayHeading></div>
      </div>
    </PageContainer></Section>
    <Section className={styles.bordered} aria-labelledby="ideas-heading"><PageContainer>
      <div className={styles.stack}><DisplayHeading as="h2" id="ideas-heading"
                                                    className={styles.sectionHeading}><RichTextInline
        value={content.decadeHeading}/></DisplayHeading>
        <div
          className={styles.timeline}>{content.decadeEntries.map((idea, index) => copy(idea, index === content.decadeEntries.length - 1 ? styles.timelineFinal : String(index), index))}</div>
      </div>
    </PageContainer></Section>
    <Section className={styles.bordered} aria-labelledby="personal-arc-heading"><PageContainer>
      <div className={styles.stack}><SectionLabel>{arc.label}</SectionLabel><DisplayHeading as="h2"
                                                                                            id="personal-arc-heading"
                                                                                            className={styles.sectionHeading}><RichTextInline
        value={arc.heading}/></DisplayHeading>
        <div className={styles.arcTimeline}>{arc.timeline.map((entry, index) => copy(entry, String(index), index))}</div>
      </div>
    </PageContainer></Section>
    <Section tone="darkMatter" aria-labelledby="missing-heading"><PageContainer>
      <div className={styles.stack}><DisplayHeading as="h2" id="missing-heading"
                                                    className={styles.sectionHeading}><RichTextInline
        value={content.missingMan.heading}/></DisplayHeading>{copy(content.missingMan.body)}<Artifact
        artifact={content.missingMan.artifact} label={content.artifactLabel}/><DisplayHeading as="h3"
                                                                                              className={styles.reflect}><RichTextInline
        value={content.missingMan.reflection}/>a</DisplayHeading>
        <div className={styles.muted}>{copy(content.missingMan.signoff)}</div>
      </div>
    </PageContainer></Section>
    <Section className={styles.pizza} aria-labelledby="pizza-heading"><PageContainer>
      <div className={styles.pizzaStack}><DisplayHeading as="h2" id="pizza-heading"
                                                         className={styles.sectionHeading}><RichTextInline
        value={content.pizza.heading}/></DisplayHeading>{content.pizza.lines.map((line, index) => copy(line, index > 3 ? styles.pizzaEnd : String(index), index))}
      </div>
    </PageContainer></Section>
    <Section tone="running" aria-labelledby="wait-heading"><PageContainer>
      <div className={styles.stack}><DisplayHeading as="h2" id="wait-heading"
                                                    className={styles.waitHeading}><RichTextInline
        value={content.wait.heading}/></DisplayHeading>{copy(content.wait.body)}<Artifact
        artifact={content.wait.artifact} label={content.artifactLabel} dark/></div>
    </PageContainer></Section>
    <Section className={styles.nonnino} aria-labelledby="nonnino-heading"><PageContainer>
      <div className={styles.nonninoStack}><SectionLabel>{content.nonnino.label}</SectionLabel><DisplayHeading as="h2"
                                                                                                               id="nonnino-heading"
                                                                                                               className={styles.sectionHeading}><RichTextInline
        value={content.nonnino.heading}/></DisplayHeading></div>
    </PageContainer></Section>
    <Section className={styles.bordered} aria-labelledby="book-heading"><PageContainer>
      <div className={styles.stack}><SectionLabel>{content.book.label}</SectionLabel><DisplayHeading as="h2"
                                                                                                     id="book-heading"
                                                                                                     className={styles.sectionHeading}><RichTextInline
        value={content.book.heading}/></DisplayHeading>{content.book.lines.map((line, index) => copy(line, String(index), index))}
        <div className={styles.muted}>{copy(content.book.signoff)}</div>
        <Link className={styles.next} href={`${basePath}/contact`}>{content.continueLabel} →</Link></div>
    </PageContainer></Section>
  </>;
}
