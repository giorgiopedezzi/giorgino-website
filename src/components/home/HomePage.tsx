import Image from "next/image";
import Link from "next/link";

import {
  DisplayHeading,
  NextLink,
  PageContainer,
  Section,
  SectionLabel,
} from "@/components/primitives/Editorial";
import { RichTextCopy } from "@/components/primitives/RichText";
import type { HomeContent } from "@/content/types";
import type { ContactContent } from "@/content/contact";

import { HomePageAnimations } from "./HomePageAnimations";
import styles from "./HomePage.module.css";

type HomePageProps = { content: HomeContent; contact: ContactContent };

function DeepLink({ href, children }: { href: string; children: string }) {
  return <Link className={styles.deepLink} href={href}>{children} <span aria-hidden="true">→</span></Link>;
}

export function HomePage({ content, contact }: HomePageProps) {
  return (
    <main>
      <Section className={styles.hero} aria-labelledby="hero-heading">
        <PageContainer>
          <div className={styles.stack}>
            <SectionLabel>{content.hero.label}</SectionLabel>
            <DisplayHeading id="hero-heading" className={styles.heroHeading}>{content.hero.heading}</DisplayHeading>
            <RichTextCopy value={content.hero.body} />
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
            <RichTextCopy value={content.thinking.body} />
            <DeepLink href={content.thinking.linkHref}>{content.thinking.linkLabel}</DeepLink>
          </div>
        </PageContainer>
      </Section>

      <Section tone="running" aria-labelledby="running-heading">
        <PageContainer>
          <div className={styles.runningStack}>
            <SectionLabel>{content.running.label}</SectionLabel>
            <DisplayHeading as="h2" id="running-heading" className={styles.runningHeading}>{content.running.heading}</DisplayHeading>
            {content.running.media
              ? <Image className={styles.gifPlaceholder} style={content.running.media.stretch ? { objectFit: "fill" } : undefined} src={content.running.media.src} alt={content.running.media.alt} width={860} height={484} unoptimized />
              : <div className={styles.gifPlaceholder} aria-hidden="true" />}
            <DeepLink href={content.running.linkHref}>{content.running.linkLabel}</DeepLink>
          </div>
        </PageContainer>
      </Section>

      <Section className={styles.bordered} aria-labelledby="human-heading">
        <PageContainer>
          <div className={styles.humanStack}>
            <SectionLabel>{content.human.label}</SectionLabel>
            <DisplayHeading as="h2" id="human-heading" className={styles.sectionHeading}>{content.human.heading}</DisplayHeading>
            <RichTextCopy value={content.human.body} />
            <DeepLink href={content.human.linkHref}>{content.human.linkLabel}</DeepLink>
          </div>
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
