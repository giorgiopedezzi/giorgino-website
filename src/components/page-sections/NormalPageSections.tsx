import Image from "next/image";
import Link from "next/link";

import { EditorialHeading, Section, SectionLabel } from "@/components/primitives/Editorial";
import { RichTextCopy, RichTextInline } from "@/components/primitives/RichText";
import type { NormalPageSection } from "@/content/page-sections";

import styles from "./NormalPageSections.module.css";

/** Renders only the bounded, author-managed catalogue defined in page-sections. */
export function NormalPageSections({ sections }: { sections: NormalPageSection[] }) {
  return <>{sections.map((section, index) => {
    const headingId = `normal-section-${index}`;
    if (section.type === "editorial") {
      return <Section className={styles.section} aria-labelledby={headingId} key={index}><SectionLabel>{section.label}</SectionLabel><EditorialHeading as="h2" id={headingId}><RichTextInline value={section.heading} /></EditorialHeading><RichTextCopy value={section.body} />{section.media && <figure className={styles[`media${(section.media.presentation ?? "default")[0].toUpperCase()}${(section.media.presentation ?? "default").slice(1)}`]}><Image src={section.media.src} alt={section.media.decorative ? "" : section.media.alt} width={960} height={640} style={section.media.stretch ? { objectFit: "fill" } : undefined} />{section.media.caption && <figcaption>{section.media.caption}</figcaption>}</figure>}</Section>;
    }
    return <Section className={styles.section} aria-labelledby={headingId} key={index}><SectionLabel>{section.label}</SectionLabel><EditorialHeading as="h2" id={headingId}><RichTextInline value={section.heading} /></EditorialHeading><ul className={styles.links}>{section.links.map((link) => <li key={link.href}><Link href={link.href}>{link.label}</Link>{link.note && <span>{link.note}</span>}</li>)}</ul></Section>;
  })}</>;
}
