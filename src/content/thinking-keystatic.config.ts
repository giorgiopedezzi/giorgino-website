import { collection, config, fields, singleton } from "@keystatic/core";

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
      schema: fields.text({ label: "Text", multiline: true, validation: { isRequired: true } }),
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
      }),
    },
    artifact: {
      label: "Artifact",
      schema: fields.object({
        src: media("Artifact file"),
        alt: fields.text({ label: "Alternative text", validation: { isRequired: true } }),
        caption: fields.text({ label: "Caption" }),
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

const indexSchema = {
  label: fields.text({ label: "Section label", validation: { isRequired: true } }),
  heading: fields.text({ label: "Heading", validation: { isRequired: true } }),
  introduction: fields.text({ label: "Introduction", multiline: true, validation: { isRequired: true } }),
  dialogueArtifacts,
  dialogues: fields.object({
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

const requiredText = (label: string, multiline = false) => fields.text({ label, multiline, validation: { isRequired: true } });
const runningBlock = (label: string) => fields.object({
  label: requiredText("Section label"),
  heading: requiredText("Heading"),
  body: requiredText("Body", true),
  isVisible: fields.checkbox({ label: "Show this section", defaultValue: true }),
}, { label });
const runningSchema = {
  metadata: fields.object({ title: requiredText("Page title"), description: requiredText("Page description", true) }, { label: "Metadata" }),
  hero: fields.object({ label: requiredText("Section label"), heading: requiredText("Heading"), intro: requiredText("Introduction", true) }, { label: "Hero" }),
  problem: runningBlock("Problem"),
  restraint: runningBlock("Deliberate restraint"),
  principles: fields.object({ label: requiredText("Section label"), heading: requiredText("Heading"), items: fields.array(fields.object({ order: fields.integer({ label: "Order", defaultValue: 1, validation: { isRequired: true, min: 1 } }), text: requiredText("Principle", true) }), { label: "Ordered principles", validation: { length: { min: 1, max: 8 } }, itemLabel: (props) => props.fields.text.value || "Principle" }) }, { label: "Principles" }),
  object: fields.object({ label: requiredText("Section label"), heading: requiredText("Heading"), body: requiredText("Body", true), isVisible: fields.checkbox({ label: "Show this section", defaultValue: true }), study: fields.object({ title: requiredText("Study title"), label: requiredText("Study label"), body: requiredText("Study explanation", true) }, { label: "Code-controlled visual study copy" }), media: fields.array(fields.object({ src: siteMedia("Media file"), alt: requiredText("Alternative text"), caption: fields.text({ label: "Caption" }) }), { label: "Supporting media", itemLabel: (props) => props.fields.alt.value || "Media item" }) }, { label: "Object and visual study" }),
  build: runningBlock("How it is being built"),
  state: runningBlock("Current state"),
  liveApp: fields.object({ label: requiredText("Link label"), href: fields.url({ label: "Live application URL", validation: { isRequired: true } }), isVisible: fields.checkbox({ label: "Show live application link", defaultValue: true }) }, { label: "Live application" }),
};
const textList = (label: string, min: number, max: number) => fields.array(
  requiredText("Text", true),
  { label, validation: { length: { min, max } } },
);
const homeBlock = (label: string) => fields.object({
  label: requiredText("Section label"),
  heading: requiredText("Heading"),
  body: requiredText("Body", true),
}, { label });
const personalArtifact = (label: string) => fields.object({
  placeholder: requiredText("Placeholder text", true),
  media: fields.object({
    src: fields.image({ label: "Media file", directory: "public/site-media", publicPath: "/site-media/" }),
    alt: fields.text({ label: "Alternative text", description: "Required by validation when a media file is present." }),
    caption: fields.text({ label: "Caption" }),
  }, { label: "Optional media" }),
}, { label });

const homeSchema = {
  metadata: fields.object({
    title: requiredText("Page title"),
    description: requiredText("Page description", true),
  }, { label: "Metadata" }),
  nextLabel: requiredText("Section continuation label"),
  hero: homeBlock("Hero"),
  belief: fields.object({
    label: requiredText("Section label"),
    statements: textList("Belief statements", 1, 6),
  }, { label: "Belief statements", description: "One to six statements; their order drives the typewriter animation." }),
  darkMatter: fields.object({
    label: requiredText("Section label"),
    heading: requiredText("Heading"),
    narrative: textList("Narrative paragraphs", 1, 4),
    closingThought: fields.text({ label: "Optional closing thought", multiline: true }),
    supportingText: fields.text({ label: "Optional supporting text", multiline: true }),
  }, { label: "Dark Matter", description: "Narrative order drives the scramble and restoration animation." }),
  thinking: fields.object({
    label: requiredText("Section label"),
    heading: requiredText("Heading"),
    body: requiredText("Introduction", true),
    articles: fields.array(fields.object({
      number: requiredText("Number"),
      title: requiredText("Title"),
      summary: requiredText("Summary", true),
    }), { label: "Curated teasers", validation: { length: { min: 1, max: 6 } } }),
  }, { label: "Thinking" }),
  running: fields.object({
    label: requiredText("Section label"),
    heading: requiredText("Heading"),
    body: requiredText("Body", true),
    surfaceHeading: requiredText("Study heading"),
    surfaceLabel: requiredText("Study label"),
    placeholder: requiredText("Study description", true),
    supportingStatement: fields.text({ label: "Optional supporting statement", multiline: true }),
  }, { label: "Running teaser" }),
  arc: fields.object({
    label: requiredText("Section label"),
    heading: requiredText("Heading"),
    timeline: textList("Timeline entries", 1, 6),
  }, { label: "Personal arc" }),
  human: homeBlock("Human"),
  personalNarrative: fields.object({
    label: requiredText("Section label"),
    stillHere: requiredText("Opening heading"),
    thanks: requiredText("Thank-you line"),
    opening: textList("Opening lines", 7, 7),
    decadeHeading: requiredText("Decade heading"),
    decadeEntries: textList("Decade entries", 4, 4),
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
  }, { label: "Personal narrative", description: "Canonical content shared by the homepage and Really About Me." }),
  contact: fields.object({
    label: requiredText("Section label"),
    heading: requiredText("Heading"),
    details: textList("Contact details", 1, 4),
    supportingText: fields.text({ label: "Optional supporting text", multiline: true }),
  }, { label: "Contact teaser" }),
};

export default config({
  storage: { kind: "local" },
  ui: {
    brand: { name: "Site authoring" },
    navigation: ["englishHome", "italianHome", "englishRunning", "italianRunning", "englishFoundation", "italianFoundation", "englishIndex", "italianIndex", "articles"],
  },
  singletons: {
    englishHome: singleton({ label: "English homepage", path: "src/content/site/en/home", format: "json", schema: homeSchema }),
    italianHome: singleton({ label: "Italian homepage", path: "src/content/site/it/home", format: "json", schema: homeSchema }),
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
          title: fields.text({ label: "Search/social title" }),
          description: fields.text({ label: "Search/social description", multiline: true }),
        }, { label: "Localized metadata", description: "Provide both fields to override the title and excerpt used in page metadata." }),
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
