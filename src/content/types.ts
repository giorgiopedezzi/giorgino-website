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

export type ArticlePreview = {
  number: string;
  title: string;
  summary: string;
};

export type EditorialBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "artifact"; src: string; alt: string; caption?: string; note?: string }
  | { type: "divider" }
  | { type: "note"; text: string };

export type EditorialArticle = {
  title: string;
  slug: string;
  locale: "en" | "it";
  excerpt: string;
  publishedAt?: string;
  status: "draft" | "published";
  body: EditorialBlock[];
};

export type DialogueArtifact = {
  screenshot: string;
  alt: string;
  line: string;
  reflection?: string;
  href?: string;
};

export type EditorialContent = {
  label: string;
  heading: string;
  introduction: string;
  articles: EditorialArticle[];
  dialogueArtifacts: DialogueArtifact[];
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
  metadata: { title: string; description: string };
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
  thinking: ContentBlock & { articles: ArticlePreview[] };
  running: ContentBlock & {
    surfaceHeading: string;
    surfaceLabel: string;
    placeholder: string;
    supportingStatement?: string;
  };
  arc: { label: string; heading: string; timeline: string[] };
  human: ContentBlock;
  personalNarrative: PersonalNarrative;
  contact: { label: string; heading: string; details: string[]; supportingText?: string };
};
