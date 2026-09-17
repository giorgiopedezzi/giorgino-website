import { collection, config, fields, singleton } from "@keystatic/core";

import { richText, richTextCapabilities, type RichTextCapabilities } from "./rich-text-field";

const { bodyCopyWithPresentation, inlineHeading, protectedInline } = richTextCapabilities;

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

const mediaPresentation = fields.select({
  label: "Presentation",
  defaultValue: "default",
  options: [
    { label: "Default", value: "default" },
    { label: "Wide", value: "wide" },
    { label: "Full", value: "full" },
  ],
});

const editorialImageFields = (fileLabel: string, source = media) => ({
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
      schema: richText({ label: "Text", description: "Paragraphs, bold, italic, and the approved text-size variants only." }),
    },
    heading: {
      label: "Heading",
      schema: fields.text({ label: "Text", validation: { isRequired: true } }),
    },
    quote: {
      label: "Quote",
      schema: fields.object({
        text: fields.text({ label: "Text", multiline: true, validation: { isRequired: true } }),
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
      schema: fields.text({ label: "Text", multiline: true, validation: { isRequired: true } }),
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
        heading: richText({ label: "Heading", capabilities: inlineHeading }),
        body: richText({ label: "Body", description: "Use the approved text, paragraph, and whole-field presentation controls.", capabilities: bodyCopyWithPresentation }),
        media: fields.object(editorialImageFields("Optional media", siteMedia), { label: "Optional media" }),
      }),
    },
    links: {
      label: "Curated links",
      schema: fields.object({
        label: requiredText("Section label"),
        heading: richText({ label: "Heading", capabilities: inlineHeading }),
        links: editorialLinks("Links", "A deliberately curated list, not a free-form layout control."),
      }),
    },
  },
  { label: "Normal sections", description: "Add, remove, and reorder supported normal sections. Homepage and other protected compositions are not managed here." },
);

export const metadataSchema = (label = "Metadata") => fields.object({
  title: requiredText("Page title"),
  description: requiredText("Page description", true),
  socialTitle: fields.text({ label: "Social title" }),
  socialDescription: fields.text({ label: "Social description", multiline: true }),
  socialImage: fields.image({ label: "Social image", directory: "public/site-media", publicPath: "/site-media/" }),
}, { label, description: "Canonical URL and locale alternates remain application-generated." });

const indexSchema = {
  metadata: metadataSchema("Thinking index metadata"),
  label: fields.text({ label: "Section label", validation: { isRequired: true } }),
  heading: richText({ label: "Heading", capabilities: inlineHeading }),
  introduction: richText({ label: "Introduction" }),
  dialogueArtifacts,
  dialogues: fields.object({
    metadata: metadataSchema("Dialogues metadata"),
    label: fields.text({ label: "Dialogue section label", validation: { isRequired: true } }),
    heading: richText({ label: "Dialogue heading", capabilities: inlineHeading }),
    introduction: richText({ label: "Dialogue introduction" }),
    emptyLabel: fields.text({ label: "Empty dialogue message", validation: { isRequired: true } }),
  }, { label: "Dialogues page copy" }),
  articleLabels: fields.object({
    references: fields.text({ label: "References heading", validation: { isRequired: true } }),
    relatedLinks: fields.text({ label: "Related links heading", validation: { isRequired: true } }),
  }, { label: "Article link labels" }),
};

const authoringFoundationSchema = {
  title: fields.text({ label: "Title", validation: { isRequired: true } }),
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
  heading: richText({ label: "Heading", capabilities: inlineHeading }),
  body: richText({ label: "Body", description: "Optional editorial body copy. The section heading remains visible when omitted.", required: false }),
  isVisible: fields.checkbox({ label: "Show this section", defaultValue: true }),
}, { label });
const runningSchema = {
  metadata: metadataSchema(),
  hero: fields.object({ label: requiredText("Section label"), heading: richText({ label: "Heading", capabilities: inlineHeading }), intro: richText({ label: "Introduction" }) }, { label: "Hero" }),
  problem: runningBlock("Problem"),
  restraint: runningBlock("Deliberate restraint"),
  principles: fields.object({ label: requiredText("Section label"), heading: richText({ label: "Heading", capabilities: inlineHeading }), items: fields.array(fields.object({ order: fields.integer({ label: "Order", defaultValue: 1, validation: { isRequired: true, min: 1 } }), text: richText({ label: "Principle", capabilities: inlineHeading }) }), { label: "Ordered principles", description: "Recommended: 3–8 principles. Order is preserved in the numbered reading sequence.", validation: { length: { min: 1 } }, itemLabel: () => "Principle" }) }, { label: "Principles" }),
  object: fields.object({ label: requiredText("Section label"), heading: richText({ label: "Heading", capabilities: inlineHeading }), body: richText({ label: "Body" }), isVisible: fields.checkbox({ label: "Show this section", defaultValue: true }), study: fields.object({ title: richText({ label: "Study title", capabilities: inlineHeading }), label: requiredText("Study label"), body: richText({ label: "Study explanation" }) }, { label: "Code-controlled visual study copy" }), media: fields.array(fields.object(editorialImageFields("Media file", siteMedia)), { label: "Supporting media", itemLabel: (props) => props.fields.alt.value || "Decorative media" }) }, { label: "Object and visual study" }),
  build: runningBlock("How it is being built"),
  state: runningBlock("Current state"),
  liveApp: fields.object({ label: requiredText("Link label"), href: fields.url({ label: "Live application URL", validation: { isRequired: true } }), isVisible: fields.checkbox({ label: "Show live application link", defaultValue: true }) }, { label: "Live application" }),
};
const textList = (label: string, min: number, max?: number, description?: string) => fields.array(
  requiredText("Text", true),
  { label, description, validation: { length: max === undefined ? { min } : { min, max } } },
);
const richTextList = (label: string, min: number, max?: number, description?: string, capabilities: RichTextCapabilities = richTextCapabilities.bodyCopy) => fields.array(
  richText({ label: "Text", capabilities }),
  { label, description, validation: { length: max === undefined ? { min } : { min, max } } },
);
const homeBlock = (label: string) => fields.object({
  label: requiredText("Section label"),
  heading: requiredText("Heading"),
  body: richText({ label: "Body", description: "Paragraphs, bold, italic, the approved text-size variants, and the Human Aside / Editorial Lead / Interruption roles only." }),
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
      richText({ label: "Paragraph", description: "Paragraphs, bold, italic, and the approved text-size variants only." }),
      { label: "Narrative paragraphs", validation: { length: { min: 1 } }, description: "Recommended: 1–4 paragraphs. Order drives the scramble and restoration animation, which supports any non-empty ordered sequence." },
    ),
    closingThought: richText({ label: "Closing thought", editorLabel: "Closing thought", description: "Optional. Phrase-level text styling is available; its animated composition does not support paragraph or whole-field controls.", capabilities: protectedInline, required: false }),
    supportingText: richText({ label: "Supporting text", editorLabel: "Supporting text", description: "Optional. Paragraphs, bold, italic, and the approved text-size variants only.", required: false }),
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
  }, { label: "Running teaser", description: "Label, heading, a GIF placeholder, and a link — no body copy." }),
  thinking: fields.object({
    label: requiredText("Section label"),
    heading: requiredText("Heading"),
    body: richText({ label: "Introduction", description: "Optional. Paragraphs, bold, italic, the approved text-size variants, and the Human Aside / Editorial Lead / Interruption roles only.", required: false }),
    linkLabel: requiredText("Thinking link label"),
    linkHref: fields.url({ label: "Thinking link target", validation: { isRequired: true } }),
  }, { label: "Thinking" }),
  human: fields.object({
    label: requiredText("Section label"),
    heading: requiredText("Heading"),
    body: richText({ label: "Body", description: "Optional. Paragraphs, bold, italic, the approved text-size variants, and the Human Aside / Editorial Lead / Interruption roles only.", required: false }),
    linkLabel: requiredText("Really About Me link label"),
    linkHref: fields.url({ label: "Really About Me link target", validation: { isRequired: true } }),
  }, { label: "Human" }),
};

const aboutSchema = {
  arc: fields.object({ label: requiredText("Section label"), heading: richText({ label: "Heading", capabilities: inlineHeading }), timeline: richTextList("Timeline entries", 1, undefined, "Recommended: 3–6 entries. Entries render as an ordered editorial timeline.") }, { label: "Personal arc" }),
  personalNarrative: fields.object({
    label: requiredText("Section label"),
    stillHere: richText({ label: "Opening heading", capabilities: inlineHeading }),
    thanks: richText({ label: "Thank-you line", capabilities: inlineHeading }),
    // This is a deliberate 4 + 2 + 1 visual composition, not a historical content limit.
    opening: richTextList("Opening lines", 7, 7, "Exactly seven lines: this bespoke opening is intentionally choreographed as 4 + 2 + 1 visual groups.", protectedInline),
    decadeHeading: richText({ label: "Decade heading", capabilities: inlineHeading }),
    decadeEntries: richTextList("Decade entries", 1),
    artifactLabel: requiredText("Artifact label"),
    missingMan: fields.object({
      heading: richText({ label: "Heading", capabilities: inlineHeading }),
      body: richText({ label: "Body", capabilities: bodyCopyWithPresentation }),
      artifact: personalArtifact("Missing Man artifact"),
      reflection: richText({ label: "Reflection", description: "Optional editorial reflection beneath the artifact. Scale affects the whole reflection; phrase typography remains independent.", capabilities: inlineHeading, required: false }),
      signoff: richText({ label: "Signoff", description: "Optional muted closing line.", required: false }),
    }, { label: "Missing Man" }),
    pizza: fields.object({
      heading: richText({ label: "Heading", capabilities: inlineHeading }),
      lines: richTextList("Lines", 1, undefined, "Recommended: 5–8 lines. The composition rebalances its visual split for any non-empty ordered list."),
    }, { label: "Pizza" }),
    wait: fields.object({
      heading: richText({ label: "Heading", capabilities: inlineHeading }),
      body: richText({ label: "Body" }),
      artifact: personalArtifact("T-shirt artifact"),
    }, { label: "Wait" }),
    nonnino: fields.object({
      label: requiredText("Section label"),
      heading: richText({ label: "Heading", capabilities: inlineHeading }),
    }, { label: "Nonnino" }),
    book: fields.object({
      label: requiredText("Section label"),
      heading: richText({ label: "Heading", capabilities: inlineHeading }),
      lines: richTextList("Lines", 1, undefined, "Recommended: 2–4 lines. Each line is rendered in reading order."),
      signoff: richText({ label: "Signoff" }),
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
    dialogues: requiredText("Dialogues link"),
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
  heading: richText({ label: "Heading", capabilities: inlineHeading }),
  body: richText({ label: "Page introduction" }),
  details: richTextList("Contact details", 1, 6),
  supportingText: richText({ label: "Optional supporting text", required: false }),
};

export default config({
  storage: { kind: "local" },
  ui: {
    brand: { name: "Site authoring" },
    navigation: ["englishHome", "englishContact", "englishSettings", "italianHome", "italianContact", "italianSettings", "englishAbout", "italianAbout", "englishRunning", "italianRunning", "englishFoundation", "italianFoundation", "englishIndex", "italianIndex", "articles", "standardPages"],
  },
  singletons: {
    englishSettings: singleton({ label: "English site settings", path: "src/content/site/en/site-settings", format: "json", schema: siteSettingsSchema }),
    italianSettings: singleton({ label: "Italian site settings", path: "src/content/site/it/site-settings", format: "json", schema: siteSettingsSchema }),
    englishContact: singleton({ label: "English Contact", path: "src/content/site/en/contact", format: "json", schema: contactSchema }),
    italianContact: singleton({ label: "Italian Contact", path: "src/content/site/it/contact", format: "json", schema: contactSchema }),
    englishHome: singleton({ label: "English homepage", path: "src/content/site/en/home", format: "json", schema: homeSchema }),
    italianHome: singleton({ label: "Italian homepage", path: "src/content/site/it/home", format: "json", schema: homeSchema }),
    englishAbout: singleton({ label: "English Really About Me", path: "src/content/site/en/about", format: "json", schema: aboutSchema }),
    italianAbout: singleton({ label: "Italian Really About Me", path: "src/content/site/it/about", format: "json", schema: aboutSchema }),
    englishRunning: singleton({ label: "English Running / Building", path: "src/content/site/en/running", format: "json", schema: runningSchema }),
    italianRunning: singleton({ label: "Italian Running / Building", path: "src/content/site/it/running", format: "json", schema: runningSchema }),
    englishFoundation: singleton({ label: "English authoring foundation", path: "src/content/site/en/authoring-foundation", format: "json", schema: authoringFoundationSchema }),
    italianFoundation: singleton({ label: "Italian authoring foundation", path: "src/content/site/it/authoring-foundation", format: "json", schema: authoringFoundationSchema }),
    englishIndex: singleton({ label: "English Thinking index", path: "src/content/thinking/en/index", format: "json", schema: indexSchema }),
    italianIndex: singleton({ label: "Italian Thinking index", path: "src/content/thinking/it/index", format: "json", schema: indexSchema }),
  },
  collections: {
    standardPages: collection({
      label: "Standard pages",
      path: "src/content/site/*/pages/*",
      slugField: "slug",
      format: { data: "json" },
      columns: ["locale", "translationKey", "status", "showInNavigation", "navigationOrder"],
      schema: {
        slug: fields.slug({
          name: { label: "URL slug", validation: { isRequired: true, pattern: { regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: "Use lowercase URL words separated by hyphens." } } },
          slug: { label: "Filename", validation: { pattern: { regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: "Use lowercase URL words separated by hyphens." } } },
        }),
        title: fields.text({ label: "Title", validation: { isRequired: true } }),
        locale: fields.select({ label: "Locale", defaultValue: "en", options: [...localeOptions] }),
        translationKey: fields.text({ label: "Stable translation identity", validation: { isRequired: true, pattern: { regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: "Use the same lowercase identity in each locale." } } }),
        metadata: metadataSchema("Page metadata"),
        status: fields.select({ label: "Status", defaultValue: "draft", options: [{ label: "Draft", value: "draft" }, { label: "Published", value: "published" }] }),
        navigationLabel: fields.text({ label: "Navigation label", validation: { isRequired: true } }),
        showInNavigation: fields.checkbox({ label: "Show in navigation", defaultValue: false }),
        navigationOrder: fields.integer({ label: "Navigation order", defaultValue: 100, validation: { isRequired: true, min: 1 } }),
        sections: normalPageSections,
      },
    }),
    articles: collection({
      label: "Thinking articles",
      path: "src/content/thinking/*/articles/*",
      slugField: "slug",
      format: { data: "json" },
      columns: ["locale", "translationKey", "status", "order"],
      schema: {
        slug: fields.slug({
          name: { label: "URL slug", validation: { isRequired: true, pattern: { regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: "Use lowercase URL words separated by hyphens." } } },
          slug: {
            label: "Filename",
            validation: { pattern: { regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: "Use lowercase URL words separated by hyphens." } },
          },
        }),
        title: fields.text({ label: "Title", validation: { isRequired: true } }),
        locale: fields.select({ label: "Locale", defaultValue: "en", options: [...localeOptions] }),
        translationKey: fields.text({ label: "Stable translation identity", validation: { isRequired: true, pattern: { regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: "Use the same lowercase identity in each locale." } } }),
        excerpt: fields.text({ label: "Excerpt", multiline: true, validation: { isRequired: true } }),
        metadata: fields.object({
          title: fields.text({ label: "Search title" }),
          description: fields.text({ label: "Search description", multiline: true }),
          socialTitle: fields.text({ label: "Social title" }),
          socialDescription: fields.text({ label: "Social description", multiline: true }),
          socialImage: fields.image({ label: "Social image", directory: "public/site-media", publicPath: "/site-media/" }),
        }, { label: "Localized metadata", description: "Canonical URL and locale alternates remain application-generated." }),
        status: fields.select({ label: "Status", defaultValue: "draft", options: [{ label: "Draft", value: "draft" }, { label: "Published", value: "published" }] }),
        publishedAt: fields.date({ label: "Published date" }),
        order: fields.integer({ label: "Order", defaultValue: 1, validation: { isRequired: true, min: 1 } }),
        body: editorialBlocks,
        references: editorialLinks("References", "Citations or source material. Add, remove, and reorder without changing the renderer."),
        relatedLinks: editorialLinks("Related links", "Related internal or external reading. Add, remove, and reorder without changing the renderer."),
      },
    }),
  },
});
