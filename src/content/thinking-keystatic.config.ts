import { collection, config, fields, singleton } from "@keystatic/core";

import { richText, type RichTextRendererMode } from "./rich-text-field";

export const isThinkingAuthoringEnabled = process.env.NODE_ENV === "development";

const localeOptions = [
  { label: "English", value: "en" },
  { label: "Italiano", value: "it" },
] as const;

const media = (label: string, directory = "public/thinking-media", publicPath = "/thinking-media/") =>
  fields.image({
    label,
    directory,
    publicPath,
    validation: { isRequired: true },
  });

const siteMedia = (label: string) => media(label, "public/site-media", "/site-media/");
const optionalSiteMedia = (label: string) => fields.image({ label, directory: "public/site-media", publicPath: "/site-media/" });

const mediaPresentation = fields.select({
  label: "Presentation",
  defaultValue: "default",
  options: [
    { label: "Default", value: "default" },
    { label: "Wide", value: "wide" },
    { label: "Full", value: "full" },
  ],
});

type ImageFieldFactory = (label: string) => ReturnType<typeof media> | ReturnType<typeof optionalSiteMedia>;
const editorialImageFields = (fileLabel: string, source: ImageFieldFactory = media) => ({
  src: source(fileLabel),
  alt: fields.text({ label: "Alternative text", description: "Describe informative images. Leave blank only when this image is explicitly decorative." }),
  decorative: fields.checkbox({ label: "Decorative image", description: "Decorative images render with an empty alt attribute and must not have alternative text.", defaultValue: false }),
  caption: fields.text({ label: "Caption" }),
  presentation: mediaPresentation,
  stretch: fields.checkbox({ label: "Stretch to fill", description: "Legacy option for existing media. Prefer Presentation for new images.", defaultValue: false }),
});

const editorialBlocks = fields.blocks(
  {
    paragraph: {
      label: "Paragraph",
      schema: richText({ label: "Body text", mode: "copy", description: "Paragraph text with selected-text formatting, paragraph roles, and whole-field Scale." }),
    },
    heading: {
      label: "Section title",
      schema: fields.text({ label: "Section title", validation: { isRequired: true } }),
    },
    quote: {
      label: "Quote",
      schema: fields.object({
        text: fields.text({ label: "Quote text", multiline: true, validation: { isRequired: true } }),
        attribution: fields.text({ label: "Attribution" }),
      }),
    },
    image: {
      label: "Image",
      schema: fields.object(editorialImageFields("Image file")),
    },
    artifact: {
      label: "Artifact",
      schema: fields.object({ ...editorialImageFields("Artifact file"),
        note: fields.text({ label: "Note" }),
      }),
    },
    divider: { label: "Divider", schema: fields.empty() },
    note: {
      label: "Note",
      schema: fields.text({ label: "Note text", multiline: true, validation: { isRequired: true } }),
    },
  },
  {
    label: "Editorial body",
    description: "Approved semantic blocks only. Add, remove, and reorder them without changing TypeScript.",
  },
);

const dialogueArtifacts = fields.blocks(
  {
    dialogueArtifact: {
      label: "Dialogue artifact",
      schema: fields.object({
        screenshot: media("Screenshot"),
        alt: fields.text({ label: "Alternative text", validation: { isRequired: true } }),
        line: fields.text({ label: "Short line", validation: { isRequired: true } }),
        reflection: fields.text({ label: "Reflection" }),
        href: fields.url({ label: "Internal or external link" }),
        stretch: fields.checkbox({ label: "Stretch to fill", description: "Fill the frame exactly, ignoring the image's own proportions.", defaultValue: false }),
      }),
    },
  },
  {
    label: "Dialogue artifacts",
    description: "Real screenshots with accessible descriptions and optional context or links.",
  },
);

const editorialLinks = (label: string, description: string) => fields.array(
  fields.object({
    label: fields.text({ label: "Link label", validation: { isRequired: true } }),
    href: fields.url({ label: "Internal or external link", validation: { isRequired: true } }),
    note: fields.text({ label: "Optional note", multiline: true }),
  }),
  { label, description, itemLabel: (props) => props.fields.label.value || "Link" },
);

const requiredText = (label: string, multiline = false) => fields.text({ label, multiline, validation: { isRequired: true } });

export const normalPageSections = fields.blocks(
  {
    editorial: {
      label: "Editorial section",
      schema: fields.object({
        label: requiredText("Section label"),
        heading: richText({ label: "Section title", mode: "inline", description: "Visible title for this section. Paragraph roles do not apply to titles." }),
        body: richText({ label: "Body text", mode: "copy", description: "Main prose for this section. Paragraph roles and whole-field Scale are available." }),
        media: fields.object(editorialImageFields("Optional media", optionalSiteMedia), { label: "Optional media" }),
      }),
    },
    links: {
      label: "Curated links",
      schema: fields.object({
        label: requiredText("Section label"),
        heading: richText({ label: "Section title", mode: "inline", description: "Visible title for this link section. Paragraph roles do not apply to titles." }),
        links: editorialLinks("Links", "A deliberately curated list, not a free-form layout control."),
      }),
    },
  },
  { label: "Normal sections", description: "Add, remove, and reorder supported normal sections. Homepage and other protected compositions are not managed here." },
);

export const metadataSchema = (label = "Metadata") => fields.object({
  title: requiredText("Search title"),
  description: requiredText("Search description", true),
  socialTitle: fields.text({ label: "Social title" }),
  socialDescription: fields.text({ label: "Social description", multiline: true }),
  socialImage: fields.image({ label: "Social image", directory: "public/site-media", publicPath: "/site-media/" }),
}, { label, description: "Canonical URL and locale alternates remain application-generated." });

const hubEntryFields = () => ({
  displayTitle: requiredText("Display title"),
  summary: fields.text({ label: "Optional summary", multiline: true }),
});

const hubHeaderSchema = (metadataLabel: string, pageDescription: string) => ({
  metadata: metadataSchema(metadataLabel),
  label: requiredText("Section label"),
  heading: richText({ label: "Page title", mode: "inline", description: `${pageDescription} Paragraph roles do not apply to titles.` }),
  introduction: richText({ label: "Introduction", mode: "copy", description: "Optional introductory body text. Paragraph roles and whole-field Scale are available.", required: false }),
});

const thinkingIndexSchema = (articleCollection: string) => ({
  ...hubHeaderSchema("Thinking index metadata", "Main visible title of the Thinking index."),
  entries: fields.blocks({
    article: {
      label: "Thinking article",
      schema: fields.object({
        target: fields.relationship({ label: "Target article", collection: articleCollection, validation: { isRequired: true }, description: "Choose an article from this language's Thinking collection." }),
        ...hubEntryFields(),
      }),
    },
    dialogues: {
      label: "Dialogues with AI",
      schema: fields.object(hubEntryFields()),
    },
  }, { label: "Index entries", description: "Add, remove, and reorder the pages shown on the Thinking index. Collection order controls public order." }),
  articleLabels: fields.object({
    references: fields.text({ label: "References heading", validation: { isRequired: true } }),
    relatedLinks: fields.text({ label: "Related links heading", validation: { isRequired: true } }),
  }, { label: "Article link labels" }),
});

const dialoguesSchema = {
  metadata: metadataSchema("Dialogues metadata"),
  label: requiredText("Section label"),
  heading: richText({ label: "Page title", mode: "inline", description: "Main visible title of Dialogues with AI. Paragraph roles do not apply to titles." }),
  introduction: richText({ label: "Introduction", mode: "copy", description: "Introductory body text. Paragraph roles and whole-field Scale are available." }),
  emptyLabel: requiredText("Empty dialogue message"),
  artifacts: dialogueArtifacts,
};

const aboutIndexSchema = (standardPageCollection: string) => ({
  ...hubHeaderSchema("About index metadata", "Main visible title of the About index."),
  entries: fields.blocks({
    reallyAboutMe: {
      label: "Really About Me",
      schema: fields.object(hubEntryFields()),
    },
    standardPage: {
      label: "Standard About page",
      schema: fields.object({
        target: fields.relationship({ label: "Target page", collection: standardPageCollection, validation: { isRequired: true }, description: "Choose a standard page from this language's page collection." }),
        ...hubEntryFields(),
      }),
    },
  }, { label: "Index entries", description: "Add, remove, and reorder About pages. Collection order controls public order." }),
});

const authoringFoundationSchema = {
  title: fields.text({ label: "Page title", validation: { isRequired: true } }),
  summary: fields.text({ label: "Summary", multiline: true, validation: { isRequired: true } }),
  isVisible: fields.checkbox({ label: "Show this section", defaultValue: true }),
  link: fields.url({ label: "Optional internal or external link" }),
  media: fields.array(
    fields.object(editorialImageFields("Media file", siteMedia)),
    { label: "Media", itemLabel: (props) => props.fields.alt.value || "Media item" },
  ),
  items: fields.array(
    fields.object({
      order: fields.integer({ label: "Order", defaultValue: 1, validation: { isRequired: true, min: 1 } }),
      label: fields.text({ label: "Label", validation: { isRequired: true } }),
      href: fields.url({ label: "Internal or external link", validation: { isRequired: true } }),
    }),
    { label: "Ordered items", itemLabel: (props) => props.fields.label.value || "Item" },
  ),
  sections: normalPageSections,
};

const runningBlock = (label: string) => fields.object({
  label: requiredText("Section label"),
  heading: richText({ label: "Section title", mode: "inline", description: "Visible title for this section. Paragraph roles do not apply to titles." }),
  body: richText({ label: "Body text", mode: "copy", description: "Optional editorial text. The section title remains visible when omitted.", required: false }),
  isVisible: fields.checkbox({ label: "Show this section", defaultValue: true }),
}, { label });
const runningSchema = {
  metadata: metadataSchema(),
  hero: fields.object({ label: requiredText("Section label"), heading: richText({ label: "Page title", mode: "inline", description: "Main visible title of the Running page. Paragraph roles do not apply to titles." }), intro: richText({ label: "Introduction", mode: "copy", description: "Introductory body text. Paragraph roles and whole-field Scale are available." }) }, { label: "Hero" }),
  problem: runningBlock("Problem"),
  restraint: runningBlock("Deliberate restraint"),
  principles: fields.object({ label: requiredText("Section label"), heading: richText({ label: "Section title", mode: "inline", description: "Visible title for the principles section. Paragraph roles do not apply to titles." }), items: fields.array(fields.object({ order: fields.integer({ label: "Order", defaultValue: 1, validation: { isRequired: true, min: 1 } }), text: richText({ label: "Principle", mode: "inline", description: "One concise principle. Paragraph roles do not apply to this short line." }) }), { label: "Ordered principles", description: "Recommended: 3–8 principles. Order is preserved in the numbered reading sequence.", validation: { length: { min: 1 } }, itemLabel: () => "Principle" }) }, { label: "Principles" }),
  object: fields.object({ label: requiredText("Section label"), heading: richText({ label: "Section title", mode: "inline", description: "Visible title for this section. Paragraph roles do not apply to titles." }), body: richText({ label: "Body text", mode: "copy", description: "Main prose for this section. Paragraph roles and whole-field Scale are available." }), isVisible: fields.checkbox({ label: "Show this section", defaultValue: true }), study: fields.object({ title: richText({ label: "Study title", mode: "inline", description: "Visible title for the study. Paragraph roles do not apply to titles." }), label: requiredText("Study label"), body: richText({ label: "Study explanation", mode: "copy", description: "Supporting prose for the study. Paragraph roles and whole-field Scale are available." }) }, { label: "Code-controlled visual study text" }), media: fields.array(fields.object(editorialImageFields("Media file", siteMedia)), { label: "Supporting media", itemLabel: (props) => props.fields.alt.value || "Decorative media" }) }, { label: "Object and visual study" }),
  build: runningBlock("How it is being built"),
  state: runningBlock("Current state"),
  liveApp: fields.object({ label: requiredText("Link label"), href: fields.url({ label: "Live application URL", validation: { isRequired: true } }), isVisible: fields.checkbox({ label: "Show live application link", defaultValue: true }) }, { label: "Live application" }),
};
const textList = (label: string, min: number, max?: number, description?: string) => fields.array(
  requiredText("Text", true),
  { label, description, validation: { length: max === undefined ? { min } : { min, max } } },
);
const richTextList = (label: string, mode: RichTextRendererMode, min: number, max?: number, description?: string) => fields.array(
  richText({ label: "Entry text", mode }),
  { label, description, validation: { length: max === undefined ? { min } : { min, max } } },
);
const homeBlock = (label: string) => fields.object({
  label: requiredText("Section label"),
  heading: requiredText("Heading"),
  body: richText({ label: "Body text", mode: "copy", description: "Selected-text formatting, paragraph roles, and whole-field Scale are available." }),
}, { label });
const personalArtifact = (label: string) => fields.object({
  placeholder: requiredText("Placeholder text", true),
  media: fields.object({
    src: fields.image({ label: "Media file", directory: "public/site-media", publicPath: "/site-media/" }),
    alt: fields.text({ label: "Alternative text", description: "Required by validation when a media file is present." }),
    caption: fields.text({ label: "Caption" }),
    stretch: fields.checkbox({ label: "Stretch to fill", description: "Fill the frame exactly, ignoring the image's own proportions.", defaultValue: false }),
  }, { label: "Optional media" }),
}, { label });

const homeSchema = {
  metadata: metadataSchema(),
  nextLabel: requiredText("Section continuation label"),
  hero: homeBlock("Hero"),
  darkMatter: fields.object({
    label: requiredText("Section label"),
    heading: requiredText("Heading"),
    narrative: fields.array(
      richText({ label: "Paragraph", mode: "protected-copy", description: "Selected-text formatting is available; this animated composition owns paragraph and field presentation." }),
      { label: "Narrative paragraphs", validation: { length: { min: 1 } }, description: "Recommended: 1–4 paragraphs. Order drives the scramble and restoration animation, which supports any non-empty ordered sequence." },
    ),
    closingThought: richText({ label: "Closing thought", mode: "protected-inline", editorLabel: "Closing thought", description: "Optional. Selected-text formatting is available; this animated composition owns paragraph and field presentation.", required: false }),
    supportingText: richText({ label: "Supporting text", mode: "copy", editorLabel: "Supporting text", description: "Optional supporting prose.", required: false }),
  }, { label: "Dark Matter", description: "Narrative order drives the scramble and restoration animation." }),
  belief: fields.object({
    label: requiredText("Section label"),
    statements: textList("Belief statements", 1, undefined, "Recommended: 3–6 statements. Their order drives the typewriter animation."),
  }, { label: "Belief statements", description: "Order drives the typewriter animation; additional statements remain editable and render in sequence." }),
  running: fields.object({
    label: requiredText("Section label"),
    heading: requiredText("Heading"),
    media: fields.object({
      src: fields.image({ label: "GIF", directory: "public/site-media", publicPath: "/site-media/" }),
      alt: fields.text({ label: "Alternative text", description: "Required by validation when a GIF is present." }),
      stretch: fields.checkbox({ label: "Stretch to fill", description: "Fill the frame exactly, ignoring the image's own proportions.", defaultValue: false }),
    }, { label: "Optional GIF" }),
    linkLabel: requiredText("Running / Building link label"),
    linkHref: fields.url({ label: "Running / Building link target", validation: { isRequired: true } }),
  }, { label: "Running teaser", description: "Label, title, a GIF placeholder, and a link — no body text." }),
  thinking: fields.object({
    label: requiredText("Section label"),
    heading: requiredText("Heading"),
    body: richText({ label: "Introduction", mode: "copy", description: "Optional introductory prose.", required: false }),
    linkLabel: requiredText("Thinking link label"),
    linkHref: fields.url({ label: "Thinking link target", validation: { isRequired: true } }),
  }, { label: "Thinking" }),
  human: fields.object({
    label: requiredText("Section label"),
    heading: requiredText("Heading"),
    body: richText({ label: "Body text", mode: "copy", description: "Optional supporting prose.", required: false }),
    linkLabel: requiredText("Really About Me link label"),
    linkHref: fields.url({ label: "Really About Me link target", validation: { isRequired: true } }),
  }, { label: "Human" }),
};

const aboutSchema = {
  arc: fields.object({ label: requiredText("Section label"), heading: richText({ label: "Section title", mode: "inline", description: "Visible title for the personal arc. Paragraph roles do not apply to titles." }), timeline: richTextList("Timeline entries", "copy", 1, undefined, "Recommended: 3–6 entries. Entries render as an ordered editorial timeline.") }, { label: "Personal arc" }),
  personalNarrative: fields.object({
    label: requiredText("Section label"),
    stillHere: richText({ label: "Opening heading", mode: "inline" }),
    thanks: richText({ label: "Thank-you line", mode: "inline" }),
    // This is a deliberate 4 + 2 + 1 visual composition, not a historical content limit.
    opening: richTextList("Opening lines", "protected-inline", 7, 7, "Exactly seven lines: this bespoke opening is intentionally choreographed as 4 + 2 + 1 visual groups."),
    decadeHeading: richText({ label: "Decade heading", mode: "inline" }),
    decadeEntries: richTextList("Decade entries", "copy", 1),
    artifactLabel: requiredText("Artifact label"),
    missingMan: fields.object({
      heading: richText({ label: "Section title", mode: "inline", description: "Visible title for Missing Man. Paragraph roles do not apply to titles." }),
      body: richText({ label: "Body text", mode: "copy", description: "Main prose for Missing Man. Paragraph roles and whole-field Scale are available." }),
      artifact: personalArtifact("Missing Man artifact"),
      reflection: richText({ label: "Reflection", mode: "inline", description: "Optional editorial reflection beneath the artifact. Scale affects the whole reflection.", required: false }),
      signoff: richText({ label: "Signoff", mode: "copy", description: "Optional muted closing line.", required: false }),
    }, { label: "Missing Man" }),
    pizza: fields.object({
      heading: richText({ label: "Section title", mode: "inline", description: "Visible title for Pizza. Paragraph roles do not apply to titles." }),
      lines: richTextList("Lines", "copy", 1, undefined, "Recommended: 5–8 lines. The composition rebalances its visual split for any non-empty ordered list."),
    }, { label: "Pizza" }),
    wait: fields.object({
      heading: richText({ label: "Section title", mode: "inline", description: "Visible title for Wait. Paragraph roles do not apply to titles." }),
      body: richText({ label: "Body text", mode: "copy", description: "Main prose for Wait. Paragraph roles and whole-field Scale are available." }),
      artifact: personalArtifact("T-shirt artifact"),
    }, { label: "Wait" }),
    nonnino: fields.object({
      label: requiredText("Section label"),
      heading: richText({ label: "Section title", mode: "inline", description: "Visible title for Nonnino. Paragraph roles do not apply to titles." }),
    }, { label: "Nonnino" }),
    book: fields.object({
      label: requiredText("Section label"),
      heading: richText({ label: "Section title", mode: "inline", description: "Visible title for Book. Paragraph roles do not apply to titles." }),
      lines: richTextList("Lines", "copy", 1, undefined, "Recommended: 2–4 lines. Each line is rendered in reading order."),
      signoff: richText({ label: "Signoff", mode: "copy" }),
    }, { label: "Book" }),
    continueLabel: requiredText("Continue link label"),
  }, { label: "Personal narrative", description: "Canonical content for Really About Me." }),
};

const siteSettingsSchema = {
  siteName: requiredText("Site name"),
  metadata: metadataSchema("Site default metadata"),
  navigation: fields.object({
    home: requiredText("Home label"),
    menu: requiredText("Menu label"),
    footerLabel: requiredText("Footer section label"),
    footerHeading: requiredText("Footer heading"),
    thinking: requiredText("Thinking link"),
    running: requiredText("Running link"),
    about: requiredText("About link"),
    contact: requiredText("Contact link"),
  }, { label: "Navigation and footer", description: "Labels are editable; route destinations remain code-controlled." }),
  language: fields.object({
    label: requiredText("Accessible language label"),
    english: requiredText("English label"),
    italian: requiredText("Italian label"),
  }, { label: "Language switcher" }),
  socialLinks: fields.array(fields.object({
    label: requiredText("Link label"),
    href: fields.url({ label: "HTTP(S) or email URL", validation: { isRequired: true } }),
  }), { label: "Social and contact links", itemLabel: (props) => props.fields.label.value || "Link" }),
  aboutMetadata: metadataSchema("Really About Me metadata"),
};

const contactSchema = {
  metadata: metadataSchema(),
  label: requiredText("Section label"),
  heading: richText({ label: "Page title", mode: "inline", description: "Main visible title of the Contact page. Paragraph roles do not apply to titles." }),
  body: richText({ label: "Page introduction", mode: "copy" }),
  details: richTextList("Contact details", "copy", 1, 6),
  supportingText: richText({ label: "Optional supporting text", mode: "copy", required: false }),
};

const standardPagePaths = {
  en: "src/content/site/en/pages/*",
  it: "src/content/site/it/pages/*",
} as const;

const standardPageCollection = (locale: "en" | "it", label: string) => collection({
  label,
  path: standardPagePaths[locale],
  slugField: "slug",
  format: { data: "json" },
  columns: ["translationKey", "status", "showInNavigation", "navigationOrder"],
  schema: {
    slug: fields.slug({
      name: { label: "URL slug", validation: { isRequired: true, pattern: { regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: "Use lowercase URL words separated by hyphens." } } },
      slug: { label: "Filename", validation: { pattern: { regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: "Use lowercase URL words separated by hyphens." } } },
    }),
    title: fields.text({ label: "Page title", validation: { isRequired: true } }),
    locale: fields.select({ label: "Locale", defaultValue: locale, options: localeOptions.filter((option) => option.value === locale) }),
    translationKey: fields.text({ label: "Stable translation identity", validation: { isRequired: true, pattern: { regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: "Use the same lowercase identity in each locale." } } }),
    metadata: metadataSchema("Page metadata"),
    status: fields.select({ label: "Status", defaultValue: "draft", options: [{ label: "Draft", value: "draft" }, { label: "Published", value: "published" }] }),
    navigationLabel: fields.text({ label: "Navigation label", validation: { isRequired: true } }),
    showInNavigation: fields.checkbox({ label: "Show in navigation", defaultValue: false }),
    navigationOrder: fields.integer({ label: "Navigation order", defaultValue: 100, validation: { isRequired: true, min: 1 } }),
    sections: normalPageSections,
  },
});

const thinkingArticlePaths = {
  en: "src/content/thinking/en/articles/*",
  it: "src/content/thinking/it/articles/*",
} as const;

const thinkingArticleCollection = (locale: "en" | "it", label: string) => collection({
  label,
  path: thinkingArticlePaths[locale],
  slugField: "slug",
  format: { data: "json" },
  columns: ["translationKey", "status"],
  schema: {
    slug: fields.slug({
      name: { label: "URL slug", validation: { isRequired: true, pattern: { regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: "Use lowercase URL words separated by hyphens." } } },
      slug: { label: "Filename", validation: { pattern: { regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: "Use lowercase URL words separated by hyphens." } } },
    }),
    title: fields.text({ label: "Article title", validation: { isRequired: true } }),
    locale: fields.select({ label: "Locale", defaultValue: locale, options: localeOptions.filter((option) => option.value === locale) }),
    translationKey: fields.text({ label: "Stable translation identity", validation: { isRequired: true, pattern: { regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: "Use the same lowercase identity in each locale." } } }),
    excerpt: fields.text({ label: "Summary", multiline: true, validation: { isRequired: true } }),
    metadata: fields.object({
      title: fields.text({ label: "Search title" }),
      description: fields.text({ label: "Search description", multiline: true }),
      socialTitle: fields.text({ label: "Social title" }),
      socialDescription: fields.text({ label: "Social description", multiline: true }),
      socialImage: fields.image({ label: "Social image", directory: "public/site-media", publicPath: "/site-media/" }),
    }, { label: "Localized metadata", description: "Canonical URL and locale alternates remain application-generated." }),
    status: fields.select({ label: "Status", defaultValue: "draft", options: [{ label: "Draft", value: "draft" }, { label: "Published", value: "published" }] }),
    publishedAt: fields.date({ label: "Published date" }),
    body: editorialBlocks,
    references: editorialLinks("References", "Citations or source material. Add, remove, and reorder without changing the page structure."),
    relatedLinks: editorialLinks("Related links", "Related internal or external reading. Add, remove, and reorder without changing the page structure."),
  },
});

export default config({
  storage: { kind: "local" },
  ui: {
    brand: { name: "Site authoring" },
    navigation: {
      English: ["englishHome", "englishThinkingIndex", "englishThinkingArticles", "englishDialogues", "englishAboutIndex", "englishReallyAboutMe", "englishStandardPages", "englishRunning", "englishContact", "englishFoundation", "englishSettings"],
      Italiano: ["italianHome", "italianThinkingIndex", "italianThinkingArticles", "italianDialogues", "italianAboutIndex", "italianReallyAboutMe", "italianStandardPages", "italianRunning", "italianContact", "italianFoundation", "italianSettings"],
    },
  },
  singletons: {
    englishSettings: singleton({ label: "English site settings", path: "src/content/site/en/site-settings", format: "json", schema: siteSettingsSchema }),
    italianSettings: singleton({ label: "Italian site settings", path: "src/content/site/it/site-settings", format: "json", schema: siteSettingsSchema }),
    englishContact: singleton({ label: "English Contact", path: "src/content/site/en/contact", format: "json", schema: contactSchema }),
    italianContact: singleton({ label: "Italian Contact", path: "src/content/site/it/contact", format: "json", schema: contactSchema }),
    englishHome: singleton({ label: "English homepage", path: "src/content/site/en/home", format: "json", schema: homeSchema }),
    italianHome: singleton({ label: "Italian homepage", path: "src/content/site/it/home", format: "json", schema: homeSchema }),
    englishAboutIndex: singleton({ label: "About index", path: "src/content/site/en/about-index", format: "json", schema: aboutIndexSchema("englishStandardPages") }),
    italianAboutIndex: singleton({ label: "Indice About", path: "src/content/site/it/about-index", format: "json", schema: aboutIndexSchema("italianStandardPages") }),
    englishReallyAboutMe: singleton({ label: "Really About Me", path: "src/content/site/en/about", format: "json", schema: aboutSchema }),
    italianReallyAboutMe: singleton({ label: "Davvero di me", path: "src/content/site/it/about", format: "json", schema: aboutSchema }),
    englishRunning: singleton({ label: "English Running / Building", path: "src/content/site/en/running", format: "json", schema: runningSchema }),
    italianRunning: singleton({ label: "Italian Running / Building", path: "src/content/site/it/running", format: "json", schema: runningSchema }),
    englishFoundation: singleton({ label: "English authoring foundation", path: "src/content/site/en/authoring-foundation", format: "json", schema: authoringFoundationSchema }),
    italianFoundation: singleton({ label: "Italian authoring foundation", path: "src/content/site/it/authoring-foundation", format: "json", schema: authoringFoundationSchema }),
    englishThinkingIndex: singleton({ label: "Thinking index", path: "src/content/thinking/en/index", format: "json", schema: thinkingIndexSchema("englishThinkingArticles") }),
    italianThinkingIndex: singleton({ label: "Indice Pensieri", path: "src/content/thinking/it/index", format: "json", schema: thinkingIndexSchema("italianThinkingArticles") }),
    englishDialogues: singleton({ label: "Dialogues with AI", path: "src/content/thinking/en/dialogues", format: "json", schema: dialoguesSchema }),
    italianDialogues: singleton({ label: "Dialoghi con l'AI", path: "src/content/thinking/it/dialogues", format: "json", schema: dialoguesSchema }),
  },
  collections: {
    englishStandardPages: standardPageCollection("en", "English standard pages"),
    italianStandardPages: standardPageCollection("it", "Italian standard pages"),
    englishThinkingArticles: thinkingArticleCollection("en", "Thinking articles"),
    italianThinkingArticles: thinkingArticleCollection("it", "Articoli Pensieri"),
  },
});
