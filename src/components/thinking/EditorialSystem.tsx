import Image from "next/image";
import Link from "next/link";

import { BodyCopy, DisplayHeading, EditorialHeading, PageContainer, Section, SectionLabel } from "@/components/primitives/Editorial";
import { RichTextCopy, RichTextInline } from "@/components/primitives/RichText";
import type { RichText } from "@/content/rich-text";
import type { Locale } from "@/content/locales";
import type { DialogueArtifact, EditorialArticle, EditorialBlock } from "@/content/types";

import styles from "./EditorialSystem.module.css";

export function EditorialIndex({ locale, label, heading, introduction, articles }: { locale: Locale; label: string; heading: RichText; introduction: RichText; articles: EditorialArticle[] }) {
  return <Section className={styles.page} aria-labelledby="thinking-heading"><PageContainer><div className={styles.intro}><SectionLabel>{label}</SectionLabel><DisplayHeading id="thinking-heading"><RichTextInline value={heading} /></DisplayHeading><RichTextCopy value={introduction} /></div><ol className={styles.articleList}>{articles.map((article, index) => <li key={article.slug}><Link href={`/${locale}/thinking/${article.slug}`} className={styles.articleLink}><span><EditorialHeading>{article.title}</EditorialHeading><span className={styles.excerpt}>{article.excerpt}</span></span><span className={styles.articleNumber}>{String(index + 1).padStart(2, "0")} <span aria-hidden="true">→</span></span></Link></li>)}</ol></PageContainer></Section>;
}

export function EditorialArticleView({ article, referenceLabel, relatedLinksLabel }: { article: EditorialArticle; referenceLabel: string; relatedLinksLabel: string }) {
  return <Section className={styles.page} aria-labelledby="article-heading"><PageContainer><article className={styles.article}><header className={styles.articleHeader}><SectionLabel>{article.publishedAt ?? (article.status === "draft" ? "Draft" : "Article")}</SectionLabel><DisplayHeading id="article-heading">{article.title}</DisplayHeading><BodyCopy>{article.excerpt}</BodyCopy></header><EditorialBody blocks={article.body} /><EditorialLinks heading={referenceLabel} links={article.references} /><EditorialLinks heading={relatedLinksLabel} links={article.relatedLinks} /></article></PageContainer></Section>;
}

export function DialogueArtifacts({ artifacts, emptyLabel }: { artifacts: DialogueArtifact[]; emptyLabel: string }) {
  return <div className={styles.artifacts}>{artifacts.length === 0 ? <p className={styles.empty}>{emptyLabel}</p> : artifacts.map((artifact) => <figure className={styles.artifact} key={artifact.screenshot}><Image src={artifact.screenshot} alt={artifact.alt} width={960} height={640} style={artifact.stretch ? { objectFit: "fill" } : undefined} /><figcaption><p>{artifact.line}</p>{artifact.reflection && <p>{artifact.href ? <Link href={artifact.href}>{artifact.reflection}</Link> : artifact.reflection}</p>}</figcaption></figure>)}</div>;
}

function EditorialBody({ blocks }: { blocks: EditorialBlock[] }) {
  return <div className={styles.body}>{blocks.map((block, index) => {
    switch (block.type) {
      case "paragraph": return <RichTextCopy key={index} value={block.text} />;
      case "heading": return <EditorialHeading as="h2" key={index}><RichTextInline value={block.text} /></EditorialHeading>;
      case "quote": return <blockquote key={index}><RichTextInline value={block.text} />{block.attribution && <footer>— {block.attribution}</footer>}</blockquote>;
      case "image": case "artifact": return <figure key={index} className={styles[`media${(block.presentation ?? "default")[0].toUpperCase()}${(block.presentation ?? "default").slice(1)}`]}><Image src={block.src} alt={block.decorative ? "" : block.alt} width={960} height={640} style={block.stretch ? { objectFit: "fill" } : undefined} />{(block.caption || (block.type === "artifact" && block.note)) && <figcaption>{block.caption}{block.type === "artifact" && block.note && <span>{block.note}</span>}</figcaption>}</figure>;
      case "divider": return <hr key={index} />;
      case "note": return <aside key={index}><RichTextInline value={block.text} /></aside>;
    }
  })}</div>;
}

function EditorialLinks({ heading, links }: { heading: string; links: EditorialArticle["references"] }) {
  if (links.length === 0) return null;
  return <section className={styles.links} aria-label={heading}><EditorialHeading as="h2">{heading}</EditorialHeading><ul>{links.map((link) => <li key={link.href}><Link href={link.href}>{link.label}</Link>{link.note && <span>{link.note}</span>}</li>)}</ul></section>;
}
