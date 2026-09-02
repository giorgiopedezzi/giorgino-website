import Image from "next/image";

import {
  BodyCopy,
  DisplayHeading,
  EditorialHeading,
  NextLink,
  PageContainer,
  Section,
  SectionLabel,
} from "@/components/primitives/Editorial";
import type { HomeContent, PersonalArtifact } from "@/content/types";
import type { ContactContent } from "@/content/contact";

import { HomePageAnimations } from "./HomePageAnimations";
import styles from "./HomePage.module.css";

type HomePageProps = { content: HomeContent; contact: ContactContent };

const chartBars = [26, 42, 65, 88, 72, 52, 72, 102, 82, 45];

function Artifact({ artifact, label, dark = false }: { artifact: PersonalArtifact; label: string; dark?: boolean }) {
  return (
    <figure className={[styles.artifact, dark && styles.artifactDark].filter(Boolean).join(" ")}>
      <SectionLabel>{label}</SectionLabel>
      {artifact.media ? (
        <>
          <Image className={styles.artifactImage} src={artifact.media.src} alt={artifact.media.alt} width={860} height={420} unoptimized />
          {artifact.media.caption && <figcaption>{artifact.media.caption}</figcaption>}
        </>
      ) : <p>{artifact.placeholder}</p>}
    </figure>
  );
}

export function HomePage({ content, contact }: HomePageProps) {
  const articles = content.thinking.articles;
  const about = content.personalNarrative;

  return (
    <main>
      <Section className={styles.hero} aria-labelledby="hero-heading">
        <PageContainer>
          <div className={styles.stack}>
            <SectionLabel>{content.hero.label}</SectionLabel>
            <DisplayHeading id="hero-heading" className={styles.heroHeading}>{content.hero.heading}</DisplayHeading>
            <BodyCopy>{content.hero.body}</BodyCopy>
            <NextLink>{content.nextLabel}</NextLink>
          </div>
        </PageContainer>
      </Section>

      <HomePageAnimations
        beliefLabel={content.belief.label}
        beliefStatements={content.belief.statements}
        nextLabel={content.nextLabel}
        darkMatter={{
          label: content.darkMatter.label,
          heading: content.darkMatter.heading,
          narrative: content.darkMatter.narrative,
          closingThought: content.darkMatter.closingThought,
          supportingText: content.darkMatter.supportingText,
        }}
      >

      <Section className={styles.bordered} aria-labelledby="thinking-heading">
        <PageContainer>
          <div className={styles.thinkingStack}>
            <SectionLabel>{content.thinking.label}</SectionLabel>
            <DisplayHeading as="h2" id="thinking-heading" className={styles.sectionHeading}>{content.thinking.heading}</DisplayHeading>
            <BodyCopy>{content.thinking.body}</BodyCopy>
            <div className={styles.articleList}>
              {articles.map((article) => (
                <article className={styles.articlePreview} key={article.number}>
                  <div>
                    <EditorialHeading>{article.title}</EditorialHeading>
                    <p className={styles.articleSummary}>{article.summary}</p>
                  </div>
                  <p className={styles.articleNumber}>{article.number} <span aria-hidden="true">→</span></p>
                </article>
              ))}
            </div>
            <NextLink>{content.nextLabel}</NextLink>
          </div>
        </PageContainer>
      </Section>

      <Section tone="running" aria-labelledby="running-heading">
        <PageContainer>
          <div className={styles.runningStack}>
            <SectionLabel>{content.running.label}</SectionLabel>
            <DisplayHeading as="h2" id="running-heading" className={styles.runningHeading}>{content.running.heading}</DisplayHeading>
            <BodyCopy>{content.running.body}</BodyCopy>
            <div className={styles.runningSurface}>
              <div className={styles.visualHeader}>
                <strong>{content.running.surfaceHeading}</strong>
                <span>{content.running.surfaceLabel}</span>
              </div>
              <div className={styles.chart} aria-hidden="true">
                {chartBars.map((height, index) => <span className={styles.chartBar} style={{ height }} key={index} />)}
                <i className={styles.chartPoint} />
              </div>
              <p>{content.running.placeholder}</p>
            </div>
            {content.running.supportingStatement && <p className={styles.runningStatement}>{content.running.supportingStatement}</p>}
            <NextLink>{content.nextLabel}</NextLink>
          </div>
        </PageContainer>
      </Section>

      <Section className={styles.bordered} aria-labelledby="arc-heading">
        <PageContainer>
          <div className={styles.arcStack}>
            <SectionLabel>{content.arc.label}</SectionLabel>
            <DisplayHeading as="h2" id="arc-heading" className={styles.sectionHeading}>{content.arc.heading}</DisplayHeading>
            <div className={styles.timeline}>
              {content.arc.timeline.map((entry) => <p key={entry}>{entry}</p>)}
            </div>
            <NextLink>{content.nextLabel}</NextLink>
          </div>
        </PageContainer>
      </Section>

      <Section className={styles.bordered} aria-labelledby="human-heading">
        <PageContainer>
          <div className={styles.humanStack}>
            <SectionLabel>{content.human.label}</SectionLabel>
            <DisplayHeading as="h2" id="human-heading" className={styles.sectionHeading}>{content.human.heading}</DisplayHeading>
            <BodyCopy>{content.human.body}</BodyCopy>
            <NextLink>{content.nextLabel}</NextLink>
          </div>
        </PageContainer>
      </Section>

      <Section className={styles.bordered} aria-labelledby="about-heading">
        <PageContainer>
          <div className={styles.aboutOpening}>
            <SectionLabel>{about.label}</SectionLabel>
            <DisplayHeading as="h2" id="about-heading" className={styles.sectionHeading}>{about.stillHere}</DisplayHeading>
            <DisplayHeading as="h3" className={styles.aboutThanks}>{about.thanks}</DisplayHeading>
            {about.opening.map((line, index) => <p className={styles[`openingLine${index}`]} key={line}>{line}</p>)}
          </div>

          <div className={styles.decadeBlock}>
            <DisplayHeading as="h3" className={styles.sectionHeading}>{about.decadeHeading}</DisplayHeading>
            <div className={styles.decadeList}>
              {about.decadeEntries.map((entry, index) => <p className={index === 3 ? styles.decadeAccent : undefined} key={entry}>{entry}</p>)}
            </div>
          </div>

          <div className={styles.missingMan}>
            <DisplayHeading as="h3" className={styles.sectionHeading}>{about.missingMan.heading}</DisplayHeading>
            <BodyCopy>{about.missingMan.body}</BodyCopy>
            <Artifact artifact={about.missingMan.artifact} label={about.artifactLabel} />
            <DisplayHeading as="h3" className={styles.closingThought}>{about.missingMan.reflection}</DisplayHeading>
            <p className={styles.mutedSignoff}>{about.missingMan.signoff}</p>
          </div>

          <div className={styles.pizzaBlock}>
            <DisplayHeading as="h3" className={styles.pizzaHeading}>{about.pizza.heading}</DisplayHeading>
            {about.pizza.lines.map((line, index) => <p className={index === 4 ? styles.pizzaPause : undefined} key={line}>{line}</p>)}
          </div>

          <div className={styles.waitBlock}>
            <DisplayHeading as="h3" className={styles.waitHeading}>{about.wait.heading}</DisplayHeading>
            <BodyCopy>{about.wait.body}</BodyCopy>
            <Artifact artifact={about.wait.artifact} label={about.artifactLabel} dark />
          </div>

          <div className={styles.nonninoBlock}>
            <SectionLabel>{about.nonnino.label}</SectionLabel>
            <DisplayHeading as="h3" className={styles.nonninoHeading}>{about.nonnino.heading}</DisplayHeading>
          </div>

          <div className={styles.bookBlock}>
            <DisplayHeading as="h3" className={styles.sectionHeading}>{about.book.heading}</DisplayHeading>
            {about.book.lines.map((line) => <BodyCopy key={line}>{line}</BodyCopy>)}
            <p className={styles.bookSignoff}>{about.book.signoff}</p>
          </div>
          <NextLink>{content.nextLabel}</NextLink>
        </PageContainer>
      </Section>

      <Section tone="dark" aria-labelledby="contact-heading">
        <PageContainer>
          <div className={styles.contactStack}>
            <SectionLabel>{contact.label}</SectionLabel>
            <DisplayHeading as="h2" id="contact-heading" className={styles.contactHeading}>{contact.heading}</DisplayHeading>
            <div className={styles.contactDetails}>{contact.details.map((detail) => <p key={detail}>{detail}</p>)}</div>
            {contact.supportingText && <p className={styles.contactSupporting}>{contact.supportingText}</p>}
          </div>
        </PageContainer>
      </Section>
      </HomePageAnimations>
    </main>
  );
}
