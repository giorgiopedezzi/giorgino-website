import { collection, config, fields, singleton } from "@keystatic/core";

import { richText } from "./rich-text-field";

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
      schema: fields.object({
        src: media("Image file"),
        alt: fields.text({ label: "Alternative text", validation: { isRequired: true } }),
        caption: fields.text({ label: "Caption" }),
        stretch: fields.checkbox({ label: "Stretch to fill", description: "Fill the frame exactly, ignoring the image's own proportions.", defaultValue: false }),
      }),
    },
    artifact: {
      label: "Artifact",
      schema: fields.object({
        src: media("Artifact file"),
        alt: fields.text({ label: "Alternative text", validation: { isRequired: true } }),
        caption: fields.text({ label: "Caption" }),
        note: fields.text({ label: "Note" }),
        stretch: fields.checkbox({ label: "Stretch to fill", description: "Fill the frame exactly, ignoring the image's own proportions.", defaultValue: false }),
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
const metadataSchema = (label = "Metadata") => fields.object({
  title: requiredText("Page title"),
  description: requiredText("Page description", true),
  socialTitle: fields.text({ label: "Social title" }),
  socialDescription: fields.text({ label: "Social description", multiline: true }),
  socialImage: fields.image({ label: "Social image", directory: "public/site-media", publicPath: "/site-media/" }),
}, { label, description: "Canonical URL and locale alternates remain application-generated." });

const indexSchema = {
  metadata: metadataSchema("Thinking index metadata"),
  label: fields.text({ label: "Section label", validation: { isRequired: true } }),
  heading: fields.text({ label: "Heading", validation: { isRequired: true } }),
  introduction: fields.text({ label: "Introduction", multiline: true, validation: { isRequired: true } }),
  dialogueArtifacts,
  dialogues: fields.object({
    metadata: metadataSchema("Dialogues metadata"),
    label: fields.text({ label: "Dialogue section label", validation: { isRequired: true } }),
    heading: fields.text({ label: "Dialogue heading", validation: { isRequired: true } }),
    introduction: fields.text({ label: "Dialogue introduction", multiline: true, validation: { isRequired: true } }),
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
    fields.object({
      src: siteMedia("Media file"),
      alt: fields.text({ label: "Alternative text", validation: { isRequired: true } }),
      caption: fields.text({ label: "Caption" }),
      stretch: fields.checkbox({ label: "Stretch to fill", description: "Fill the frame exactly, ignoring the image's own proportions.", defaultValue: false }),
    }),
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
};

const runningBlock = (label: string) => fields.object({
  label: requiredText("Section label"),
  heading: requiredText("Heading"),
  body: requiredText("Body", true),
  isVisible: fields.checkbox({ label: "Show this section", defaultValue: true }),
}, { label });
const runningSchema = {
  metadata: metadataSchema(),
  hero: fields.object({ label: requiredText("Section label"), heading: requiredText("Heading"), intro: requiredText("Introduction", true) }, { label: "Hero" }),
  problem: runningBlock("Problem"),
  restraint: runningBlock("Deliberate restraint"),
  principles: fields.object({ label: requiredText("Section label"), heading: requiredText("Heading"), items: fields.array(fields.object({ order: fields.integer({ label: "Order", defaultValue: 1, validation: { isRequired: true, min: 1 } }), text: requiredText("Principle", true) }), { label: "Ordered principles", validation: { length: { min: 1, max: 8 } }, itemLabel: (props) => props.fields.text.value || "Principle" }) }, { label: "Principles" }),
  object: fields.object({ label: requiredText("Section label"), heading: requiredText("Heading"), body: requiredText("Body", true), isVisible: fields.checkbox({ label: "Show this section", defaultValue: true }), study: fields.object({ title: requiredText("Study title"), label: requiredText("Study label"), body: requiredText("Study explanation", true) }, { label: "Code-controlled visual study copy" }), media: fields.array(fields.object({ src: siteMedia("Media file"), alt: requiredText("Alternative text"), caption: fields.text({ label: "Caption" }) }), { label: "Supporting media", itemLabel: (props) => props.fields.alt.value || "Media item" }) }, { label: "Object and visual study" }),
  build: runningBlock("How it is being built"),
  state: runningBlock("Current state"),
  liveApp: fields.object({ label: requiredText("Link label"), href: fields.url({ label: "Live application URL", validation: { isRequired: true } }), isVisible: fields.checkbox({ label: "Show live application link", defaultValue: true }) }, { label: "Live application" }),
};
const textList = (label: string, min: number, max?: number) => fields.array(
  requiredText("Text", true),
  { label, validation: { length: max === undefined ? { min } : { min, max } } },
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
      { label: "Narrative paragraphs", validation: { length: { min: 1, max: 4 } }, description: "Order drives the scramble and restoration animation." },
    ),
    closingThought: richText({ label: "Closing thought", editorLabel: "Closing thought", description: "Optional. Paragraphs, bold, italic, and the approved text-size variants only.", required: false }),
    supportingText: richText({ label: "Supporting text", editorLabel: "Supporting text", description: "Optional. Paragraphs, bold, italic, and the approved text-size variants only.", required: false }),
  }, { label: "Dark Matter", description: "Narrative order drives the scramble and restoration animation." }),
  belief: fields.object({
    label: requiredText("Section label"),
    statements: textList("Belief statements", 1, 6),
  }, { label: "Belief statements", description: "One to six statements; their order drives the typewriter animation." }),
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
    body: richText({ label: "Introduction", description: "Paragraphs, bold, italic, the approved text-size variants, and the Human Aside / Editorial Lead / Interruption roles only." }),
    linkLabel: requiredText("Thinking link label"),
    linkHref: fields.url({ label: "Thinking link target", validation: { isRequired: true } }),
  }, { label: "Thinking" }),
  human: fields.object({
    label: requiredText("Section label"),
    heading: requiredText("Heading"),
    body: richText({ label: "Body", description: "Paragraphs, bold, italic, the approved text-size variants, and the Human Aside / Editorial Lead / Interruption roles only." }),
    linkLabel: requiredText("Really About Me link label"),
    linkHref: fields.url({ label: "Really About Me link target", validation: { isRequired: true } }),
  }, { label: "Human" }),
};

const aboutSchema = {
  arc: fields.object({ label: requiredText("Section label"), heading: requiredText("Heading"), timeline: textList("Timeline entries", 1, 6) }, { label: "Personal arc" }),
  personalNarrative: fields.object({
    label: requiredText("Section label"),
    stillHere: requiredText("Opening heading"),
    thanks: requiredText("Thank-you line"),
    opening: textList("Opening lines", 7, 7),
    decadeHeading: requiredText("Decade heading"),
    decadeEntries: textList("Decade entries", 1),
    artifactLabel: requiredText("Artifact label"),
    missingMan: fields.object({
      heading: requiredText("Heading"),
      body: requiredText("Body", true),
      artifact: personalArtifact("Missing Man artifact"),
      reflection: requiredText("Reflection", true),
      signoff: requiredText("Signoff"),
    }, { label: "Missing Man" }),
    pizza: fields.object({
      heading: requiredText("Heading"),
      lines: textList("Lines", 7, 7),
    }, { label: "Pizza" }),
    wait: fields.object({
      heading: requiredText("Heading"),
      body: requiredText("Body", true),
      artifact: personalArtifact("T-shirt artifact"),
    }, { label: "Wait" }),
    nonnino: fields.object({
      label: requiredText("Section label"),
      heading: requiredText("Heading", true),
    }, { label: "Nonnino" }),
    book: fields.object({
      label: requiredText("Section label"),
      heading: requiredText("Heading"),
      lines: textList("Lines", 2, 2),
      signoff: requiredText("Signoff"),
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
  heading: requiredText("Heading"),
  body: requiredText("Page introduction", true),
  details: textList("Contact details", 1, 6),
  supportingText: fields.text({ label: "Optional supporting text", multiline: true }),
};

export default config({
  storage: { kind: "local" },
  ui: {
    brand: { name: "Site authoring" },
    navigation: ["englishHome", "englishContact", "englishSettings", "italianHome", "italianContact", "italianSettings", "englishAbout", "italianAbout", "englishRunning", "italianRunning", "englishFoundation", "italianFoundation", "englishIndex", "italianIndex", "articles"],
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
