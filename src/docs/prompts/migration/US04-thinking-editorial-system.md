# US04 — Thinking / Editorial Content System

Build the Thinking section as a simple, code-owned editorial system.

## Goal
Use MDX or structured Markdown/content files unless the codebase already has a better lightweight pattern.
Future-ready for a small internal WYSIWYG, but DO NOT build a generic page builder.

## Content model
Support at least:
- title
- slug
- locale
- excerpt/deck
- publish date
- status: draft/published
- body

Body should support:
- paragraph
- heading
- quote
- image
- screenshot/artifact
- divider
- caption/note

Prepare conceptually for a special `ConversationArtifact` block, but do not over-engineer it.

## Thinking index
Use the site's editorial language, not a content-marketing card grid.
Seed metadata for:
1. The tears were ours
2. Signal, noise and plausible answers
3. Some things should be earned
4. The humanities belong inside the AI revolution
5. Dialogues with AI

Do not invent full article text.

## Article template
Create a reusable article page with title, deck, restrained metadata, body, artifacts and quiet navigation back.

## Dialogues with AI
Prepare a dedicated format:
real screenshot → one short line → optional deeper reflection/link.
Do not fake chat screenshots when real artifacts exist.

## Future editor
Structure rendering so a future internal WYSIWYG can write the same schema.
Do not implement the editor in this US.

## Final response
Report:
1. content architecture
2. routes created
3. files changed
4. how future WYSIWYG maps to the schema
5. remaining editorial decisions

Do not start another US.
