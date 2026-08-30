# Story — Thinking / Editorial Content System

Current baseline:
- the static homepage migration described in the supplied `phase3.md` is already implemented
- Next.js + TypeScript foundation exists
- locale-ready routing foundation exists
- design tokens / typography foundation exists
- real homepage content and static desktop fidelity exist
- Figma is visual/layout truth
- Framer is behavioral reference only
- animations are not yet integrated
- legacy references remain untouched:
  - `src/legacy/framer/scripts/typewriter.tsx`
  - `src/legacy/framer/scripts/darkmatter.tsx`

References:
- Figma: https://www.figma.com/design/x7ws9KFxBn36LV10tRRmta/Untitled?node-id=1-2
- Framer: https://global-expectations-562504.framer.app/

Use the attached `implement-story` skill for exactly one Jira Story key: `<STORY_KEY>`.

Mandatory workflow:
- read `AGENTS.md`
- follow `.agents/workflows/story-jira-gate.md`
- follow `.agents/workflows/jira-acceptance-criteria.md`
- follow `.agents/workflows/story-git-lifecycle.md`
- start only from `Ready to Develop`
- establish the Story branch before editing
- implement only Jira-approved scope
- verify each AC individually
- preserve ADF
- stage only explicit Story files
- inspect staged diff
- commit locally
- record commit hash
- write Actual effort
- transition to `In Review`
- comment branch + commit + verification
- STOP
- never push
- never move to Done unless separately requested
- never start another Story automatically

If this prompt conflicts with Jira, Jira wins. Stop and report the mismatch instead of expanding scope.


Intent: build a simple, code-owned editorial system that can later support a lightweight internal WYSIWYG.

Prefer MDX or structured Markdown/content files unless the current codebase already has a better lightweight approach.

Recommended content model:
- title
- slug
- locale
- excerpt/deck
- publish date
- draft/published
- body

Body support:
- paragraph
- heading
- quote
- image
- screenshot/artifact
- divider
- caption/note

Seed metadata only for:
1. The tears were ours
2. Signal, noise and plausible answers
3. Some things should be earned
4. The humanities belong inside the AI revolution
5. Dialogues with AI

Do not invent full article text.
Do not build a generic page builder.

Dialogues with AI should support:
real screenshot -> one short line -> optional deeper reflection/link.
Do not fake chat screenshots when real artifacts exist.

Structure rendering so a future small WYSIWYG can write the same schema, but do not implement that editor unless Jira explicitly includes it.
