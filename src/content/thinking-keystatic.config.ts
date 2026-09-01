import { collection, config, fields, singleton } from "@keystatic/core";

export const isThinkingAuthoringEnabled = process.env.NODE_ENV === "development";

const localeOptions = [
  { label: "English", value: "en" },
  { label: "Italiano", value: "it" },
] as const;

const media = (label: string) =>
  fields.image({
    label,
    directory: "public/thinking-media",
    publicPath: "/thinking-media/",
    validation: { isRequired: true },
  });

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

const indexSchema = {
  label: fields.text({ label: "Section label", validation: { isRequired: true } }),
  heading: fields.text({ label: "Heading", validation: { isRequired: true } }),
  introduction: fields.text({ label: "Introduction", multiline: true, validation: { isRequired: true } }),
  dialogueArtifacts,
};

export default config({
  storage: { kind: "local" },
  ui: {
    brand: { name: "Thinking authoring" },
    navigation: ["englishIndex", "italianIndex", "articles"],
  },
  singletons: {
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
        status: fields.select({ label: "Status", defaultValue: "draft", options: [{ label: "Draft", value: "draft" }, { label: "Published", value: "published" }] }),
        publishedAt: fields.date({ label: "Published date" }),
        order: fields.integer({ label: "Order", defaultValue: 1, validation: { isRequired: true, min: 1 } }),
        body: editorialBlocks,
      },
    }),
  },
});
