import { collection, config, fields } from "@keystatic/core";

export const isGwr14AuthoringEnabled = process.env.NODE_ENV === "development";

export default config({
  storage: {
    kind: "local",
  },
  collections: {
    proofArticles: collection({
      label: "GWR-14 proof articles",
      path: "spikes/gwr-14-keystatic/content/articles/*",
      slugField: "title",
      format: { data: "json" },
      previewUrl: "/spikes/gwr-14/preview/{slug}",
      columns: ["locale", "status"],
      schema: {
        title: fields.slug({
          name: {
            label: "Title",
            validation: { isRequired: true },
          },
          slug: {
            label: "File slug",
            description: "The JSON filename and preview URL segment.",
          },
        }),
        locale: fields.select({
          label: "Locale",
          defaultValue: "en",
          options: [
            { label: "English", value: "en" },
            { label: "Italiano", value: "it" },
          ],
        }),
        excerpt: fields.text({
          label: "Excerpt",
          multiline: true,
          validation: { isRequired: true },
        }),
        status: fields.select({
          label: "Status",
          defaultValue: "draft",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
          ],
        }),
        publishedAt: fields.date({ label: "Published date" }),
        body: fields.blocks(
          {
            paragraph: {
              label: "Paragraph",
              schema: fields.text({
                label: "Text",
                multiline: true,
                validation: { isRequired: true },
              }),
            },
            heading: {
              label: "Heading",
              schema: fields.text({
                label: "Text",
                validation: { isRequired: true },
              }),
            },
            quote: {
              label: "Quote",
              schema: fields.object(
                {
                  text: fields.text({
                    label: "Text",
                    multiline: true,
                    validation: { isRequired: true },
                  }),
                  attribution: fields.text({ label: "Attribution" }),
                },
                { label: "Quote" },
              ),
            },
            note: {
              label: "Note",
              schema: fields.text({
                label: "Text",
                multiline: true,
                validation: { isRequired: true },
              }),
            },
          },
          {
            label: "Editorial body",
            description: "Constrained blocks that can be added and reordered without editing TypeScript.",
            validation: { length: { min: 1 } },
          },
        ),
      },
    }),
  },
});
