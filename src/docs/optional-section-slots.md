# Optional section slots

GWR-38 keeps page sections named and intentionally constrained. Keystatic now treats the following editorial slots as optional RichText: the Home Thinking and Human body copy, Running narrative-block body copy, and Really About Me's Missing Man reflection and signoff. Renderers omit their elements entirely when the corresponding property is absent, so no empty wrapper or spacing reservation remains.

Existing optional media remains the established media mechanism: Home's Running teaser, Running supporting-media arrays, and personal artifacts use the current `fields.image`/`siteMedia`/`SiteMedia` path. This Story does not add media controls or replace GWR-39's media work.

The following fields deliberately remain mandatory because the page identity or layout depends on them: section labels and headings; Home's hero body, navigation labels and link targets; the Dark Matter narrative and Belief sequence; Running's hero, ordered principles, visual-study copy and live-app link; and Really About Me's 4 + 2 + 1 opening, ordered entries, core section headings, and continuation link. These constraints preserve the existing narrative choreography rather than turn the pages into a generic builder.
