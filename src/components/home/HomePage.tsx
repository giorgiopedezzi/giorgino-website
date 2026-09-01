import {
  BodyCopy,
  DisplayHeading,
  EditorialHeading,
  NextLink,
  PageContainer,
  Section,
  SectionLabel,
} from "@/components/primitives/Editorial";
import type { HomeContent } from "@/content/types";

import { HomePageAnimations } from "./HomePageAnimations";
import styles from "./HomePage.module.css";

type HomePageProps = { content: HomeContent };

const chartBars = [26, 42, 65, 88, 72, 52, 72, 102, 82, 45];

function ArtifactPlaceholder({ children, dark = false }: { children: string; dark?: boolean }) {
  return (
    <div className={[styles.artifact, dark && styles.artifactDark].filter(Boolean).join(" ")}>
      <SectionLabel>Personal artifact</SectionLabel>
      <p>{children}</p>
    </div>
  );
}

export function HomePage({ content }: HomePageProps) {
  const articles = content.thinking.articles ?? [{ number: "01", title: content.thinking.articleTitle, summary: content.thinking.articleSummary }];

  return (
    <main>
      <Section className={styles.hero} aria-labelledby="hero-heading">
        <PageContainer>
          <div className={styles.stack}>
            <SectionLabel>{content.hero.label}</SectionLabel>
            <DisplayHeading id="hero-heading" className={styles.heroHeading}>{content.hero.heading}</DisplayHeading>
            <BodyCopy>{content.hero.body}</BodyCopy>
            <NextLink />
          </div>
        </PageContainer>
      </Section>

      <HomePageAnimations
        beliefLabel={content.belief.label}
        beliefStatements={content.belief.statements ?? [content.belief.heading]}
        darkMatter={{
          label: content.darkMatter.label,
          heading: content.darkMatter.heading,
          narrative: content.darkMatter.narrative ?? [content.darkMatter.body],
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
            <NextLink />
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
                <strong>The runner remains at the centre.</strong>
                <span>A future interactive study</span>
              </div>
              <div className={styles.chart} aria-hidden="true">
                {chartBars.map((height, index) => <span className={styles.chartBar} style={{ height }} key={index} />)}
                <i className={styles.chartPoint} />
              </div>
              <p>{content.running.placeholder}</p>
            </div>
            {content.running.supportingStatement && <p className={styles.runningStatement}>{content.running.supportingStatement}</p>}
            <NextLink />
          </div>
        </PageContainer>
      </Section>

      <Section className={styles.bordered} aria-labelledby="arc-heading">
        <PageContainer>
          <div className={styles.arcStack}>
            <SectionLabel>{content.arc.label}</SectionLabel>
            <DisplayHeading as="h2" id="arc-heading" className={styles.sectionHeading}>{content.arc.heading}</DisplayHeading>
            <div className={styles.timeline}>
              {(content.arc.timeline ?? [{ title: content.arc.body }]).map((entry) => <p key={entry.title}>{entry.title}</p>)}
            </div>
            <NextLink />
          </div>
        </PageContainer>
      </Section>

      <Section className={styles.bordered} aria-labelledby="human-heading">
        <PageContainer>
          <div className={styles.humanStack}>
            <SectionLabel>{content.human.label}</SectionLabel>
            <DisplayHeading as="h2" id="human-heading" className={styles.sectionHeading}>{content.human.heading}</DisplayHeading>
            <BodyCopy>{content.human.body}</BodyCopy>
            <NextLink />
          </div>
        </PageContainer>
      </Section>

      <Section className={styles.bordered} aria-labelledby="about-heading">
        <PageContainer>
          <div className={styles.aboutOpening}>
            <SectionLabel>{content.about.label}</SectionLabel>
            <DisplayHeading as="h2" id="about-heading" className={styles.sectionHeading}>{content.about.heading}</DisplayHeading>
            <DisplayHeading as="h3" className={styles.aboutThanks}>{content.about.body}</DisplayHeading>
            {content.about.opening?.map((line, index) => <p className={styles[`openingLine${index}`]} key={line}>{line}</p>)}
          </div>

          {content.about.decadeHeading && (
            <div className={styles.decadeBlock}>
              <DisplayHeading as="h3" className={styles.sectionHeading}>{content.about.decadeHeading}</DisplayHeading>
              <div className={styles.decadeList}>
                {content.about.decadeEntries?.map((entry, index) => <p className={index === 3 ? styles.decadeAccent : undefined} key={entry}>{entry}</p>)}
              </div>
            </div>
          )}

          {content.about.missingMan && (
            <div className={styles.missingMan}>
              <DisplayHeading as="h3" className={styles.sectionHeading}>{content.about.missingMan.heading}</DisplayHeading>
              <BodyCopy>{content.about.missingMan.body}</BodyCopy>
              <ArtifactPlaceholder>{content.about.missingMan.artifact}</ArtifactPlaceholder>
              <DisplayHeading as="h3" className={styles.closingThought}>{content.about.missingMan.reflection}</DisplayHeading>
              <p className={styles.mutedSignoff}>{content.about.missingMan.signoff}</p>
            </div>
          )}

          {content.about.pizza && (
            <div className={styles.pizzaBlock}>
              <DisplayHeading as="h3" className={styles.pizzaHeading}>{content.about.pizza.heading}</DisplayHeading>
              {content.about.pizza.lines.map((line, index) => <p className={index === 4 ? styles.pizzaPause : undefined} key={line}>{line}</p>)}
            </div>
          )}

          {content.about.wait && (
            <div className={styles.waitBlock}>
              <DisplayHeading as="h3" className={styles.waitHeading}>{content.about.wait.heading}</DisplayHeading>
              <BodyCopy>{content.about.wait.body}</BodyCopy>
              <ArtifactPlaceholder dark>{content.about.wait.artifact}</ArtifactPlaceholder>
            </div>
          )}

          {content.about.nonnino && (
            <div className={styles.nonninoBlock}>
              <SectionLabel>{content.about.nonnino.label}</SectionLabel>
              <DisplayHeading as="h3" className={styles.nonninoHeading}>{content.about.nonnino.heading}</DisplayHeading>
            </div>
          )}

          {content.about.book && (
            <div className={styles.bookBlock}>
              <DisplayHeading as="h3" className={styles.sectionHeading}>{content.about.book.heading}</DisplayHeading>
              {content.about.book.lines.map((line) => <BodyCopy key={line}>{line}</BodyCopy>)}
              <p className={styles.bookSignoff}>{content.about.book.signoff}</p>
            </div>
          )}
          <NextLink />
        </PageContainer>
      </Section>

      <Section tone="dark" aria-labelledby="contact-heading">
        <PageContainer>
          <div className={styles.contactStack}>
            <SectionLabel>{content.contact.label}</SectionLabel>
            <DisplayHeading as="h2" id="contact-heading" className={styles.contactHeading}>{content.contact.heading}</DisplayHeading>
            <div className={styles.contactDetails}>{(content.contact.details ?? [content.contact.body]).map((detail) => <p key={detail}>{detail}</p>)}</div>
            {content.contact.supportingText && <p className={styles.contactSupporting}>{content.contact.supportingText}</p>}
          </div>
        </PageContainer>
      </Section>
      </HomePageAnimations>
    </main>
  );
}
