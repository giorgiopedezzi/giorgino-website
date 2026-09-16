import type { ContentMetadata } from "./content-metadata";
import type { RichText } from "./rich-text";

export type ContentBlock = {
  label: string;
  heading: string;
  body: RichText;
};

export type LinkedContentBlock = Omit<ContentBlock, "body"> & {
  body?: RichText;
  linkLabel: string;
  linkHref: string;
};

export type SiteMedia = {
  src: string;
  alt: string;
  caption?: string;
  stretch?: boolean;
};

export type EditorialBlock =
  | { type: "paragraph"; text: RichText }
  | { type: "heading"; text: RichText }
  | { type: "quote"; text: RichText; attribution?: string }
  | { type: "image"; src: string; alt: string; caption?: string; stretch?: boolean }
  | { type: "artifact"; src: string; alt: string; caption?: string; note?: string; stretch?: boolean }
  | { type: "divider" }
  | { type: "note"; text: RichText };

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
  stretch?: boolean;
};

export type EditorialContent = {
  metadata: ContentMetadata;
  label: string;
  heading: RichText;
  introduction: RichText;
  articles: EditorialArticle[];
  dialogueArtifacts: DialogueArtifact[];
  dialogues: {
    metadata: ContentMetadata;
    label: string;
    heading: RichText;
    introduction: RichText;
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
  stillHere: RichText;
  thanks: RichText;
  opening: RichText[];
  decadeHeading: RichText;
  decadeEntries: RichText[];
  artifactLabel: string;
  missingMan: {
    heading: RichText;
    body: RichText;
    artifact: PersonalArtifact;
    reflection?: RichText;
    signoff?: RichText;
  };
  pizza: { heading: RichText; lines: RichText[] };
  wait: { heading: RichText; body: RichText; artifact: PersonalArtifact };
  nonnino: { label: string; heading: RichText };
  book: { label: string; heading: RichText; lines: RichText[]; signoff: RichText };
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
    narrative: RichText[];
    closingThought?: RichText;
    supportingText?: RichText;
  };
  thinking: LinkedContentBlock;
  running: { label: string; heading: string; media?: SiteMedia; linkLabel: string; linkHref: string };
  human: LinkedContentBlock;
};
