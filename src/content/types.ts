export type ContentBlock = {
  label: string;
  heading: string;
  body: string;
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

export type TimelineEntry = {
  title: string;
};

export type HomeContent = {
  hero: ContentBlock;
  belief: ContentBlock & { statements?: string[] };
  darkMatter: ContentBlock & {
    narrative?: string[];
    closingThought?: string;
    supportingText?: string;
  };
  thinking: ContentBlock & {
    articleTitle: string;
    articleSummary: string;
    articles?: ArticlePreview[];
  };
  running: ContentBlock & {
    placeholder: string;
    supportingStatement?: string;
  };
  arc: ContentBlock & { timeline?: TimelineEntry[] };
  human: ContentBlock;
  about: ContentBlock & {
    opening?: string[];
    decadeHeading?: string;
    decadeEntries?: string[];
    missingMan?: { heading: string; body: string; artifact: string; reflection: string; signoff: string };
    pizza?: { heading: string; lines: string[] };
    wait?: { heading: string; body: string; artifact: string };
    nonnino?: { label: string; heading: string };
    book?: { heading: string; lines: string[]; signoff: string };
  };
  contact: ContentBlock & { details?: string[]; supportingText?: string };
};
