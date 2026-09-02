import { SiteNavigation } from "@/components/navigation/SiteNavigation";
import { BodyCopy, DisplayHeading, PageContainer, Section, SectionLabel } from "@/components/primitives/Editorial";
import type { Locale } from "@/content/locales";

import styles from "./RoutePlaceholder.module.css";

type RoutePlaceholderProps = {
  locale: Locale;
  label: string;
  heading: string;
  body: string;
  details?: string[];
  links?: Array<{ label: string; href: string }>;
};

export function RoutePlaceholder({ locale, label, heading, body, details = [], links = [] }: RoutePlaceholderProps) {
  return (
    <>
      <SiteNavigation locale={locale} placement="header" />
      <main>
        <Section className={styles.page} aria-labelledby="route-heading">
          <PageContainer>
            <div className={styles.stack}>
              <SectionLabel>{label}</SectionLabel>
              <DisplayHeading id="route-heading">{heading}</DisplayHeading>
              <BodyCopy>{body}</BodyCopy>
              {details.map((detail) => <BodyCopy key={detail}>{detail}</BodyCopy>)}
              {links.map((link) => <p key={link.href}><a href={link.href}>{link.label}</a></p>)}
            </div>
          </PageContainer>
        </Section>
      </main>
    </>
  );
}
