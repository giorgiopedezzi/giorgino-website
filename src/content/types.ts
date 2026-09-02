import type { ContentMetadata } from "./content-metadata";

export type ContentBlock = {
  label: string;
  heading: string;
  body: string;
};

export type SiteMedia = {
  src: string;
  alt: string;
  caption?: string;
};

export type EditorialBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "artifact"; src: string; alt: string; caption?: string; note?: string }
  | { type: "divider" }
  | { type: "note"; text: string };

export type EditorialLink = {
  label: string;
  href: string;
  note?: string;
};

export type EditorialMetadata = ContentMetadata;

export type EditorialArticle = {
  title: string;
  slug: string;
  locale: "en" | "it";
  excerpt: string;
  metadata?: EditorialMetadata;
  publishedAt?: string;
  status: "draft" | "published";
  body: EditorialBlock[];
  references: EditorialLink[];
  relatedLinks: EditorialLink[];
};

export type DialogueArtifact = {
  screenshot: string;
  alt: string;
  line: string;
  reflection?: string;
  href?: string;
};

export type EditorialContent = {
  metadata: ContentMetadata;
  label: string;
  heading: string;
  introduction: string;
  articles: EditorialArticle[];
  dialogueArtifacts: DialogueArtifact[];
  dialogues: {
    metadata: ContentMetadata;
    label: string;
    heading: string;
    introduction: string;
    emptyLabel: string;
  };
  articleLabels: {
    references: string;
    relatedLinks: string;
  };
};

export type PersonalArtifact = {
  placeholder: string;
  media?: SiteMedia;
};

export type PersonalNarrative = {
  label: string;
  stillHere: string;
  thanks: string;
  opening: string[];
  decadeHeading: string;
  decadeEntries: string[];
  artifactLabel: string;
  missingMan: {
    heading: string;
    body: string;
    artifact: PersonalArtifact;
    reflection: string;
    signoff: string;
  };
  pizza: { heading: string; lines: string[] };
  wait: { heading: string; body: string; artifact: PersonalArtifact };
  nonnino: { label: string; heading: string };
  book: { label: string; heading: string; lines: string[]; signoff: string };
  continueLabel: string;
};

export type HomeContent = {
  metadata: ContentMetadata;
  nextLabel: string;
  hero: ContentBlock;
  belief: { label: string; statements: string[] };
  darkMatter: {
    label: string;
    heading: string;
    narrative: string[];
    closingThought?: string;
    supportingText?: string;
  };
  thinking: ContentBlock & { linkLabel: string; linkHref: string };
  running: ContentBlock & {
    surfaceHeading: string;
    surfaceLabel: string;
    placeholder: string;
    supportingStatement?: string;
    linkLabel: string;
    linkHref: string;
  };
  human: ContentBlock & { linkLabel: string; linkHref: string };
};
