import { SiteNavigation } from "@/components/navigation/SiteNavigation";
import { DisplayHeading, PageContainer, Section, SectionLabel } from "@/components/primitives/Editorial";
import type { Locale } from "@/content/locales";
import { RichTextCopy, RichTextInline } from "@/components/primitives/RichText";
import type { RichText } from "@/content/rich-text";

import styles from "./RoutePlaceholder.module.css";

type RoutePlaceholderProps = {
  locale: Locale;
  label: string;
  heading: RichText;
  body: RichText;
  details?: RichText[];
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
              <DisplayHeading id="route-heading"><RichTextInline value={heading} /></DisplayHeading>
              <RichTextCopy value={body} />
              {details.map((detail, index) => <RichTextCopy key={index} value={detail} />)}
              {links.map((link) => <p key={link.href}><a href={link.href}>{link.label}</a></p>)}
            </div>
          </PageContainer>
        </Section>
      </main>
    </>
  );
}
