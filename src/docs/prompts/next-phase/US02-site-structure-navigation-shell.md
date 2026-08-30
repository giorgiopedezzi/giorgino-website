# Story — Complete Site Structure and Restrained Navigation Shell

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


Intent: implement the complete route shell and smallest useful navigation model while preserving Home as a guided reading experience.

Principles:
- first visit: sequence first, navigation second
- almost no shortcuts/CTAs that fracture the homepage flow
- returning visitors should find deeper destinations easily
- do not make usability artificially difficult
- rhythm and pauses matter

Prepare routes for:
- Home
- Thinking
- Thinking article
- Dialogues with AI
- Running / Building
- Really About Me
- Contact only if still useful as a separate route

Do not add generic Services, Skills, Experience, Portfolio or conventional About pages.

Navigation should stay visually quiet, become naturally discoverable late in the homepage, work on keyboard/mobile, and avoid conversion-style CTA buttons.

Do not rewrite or reorder homepage content except for minimal approved navigation affordances.
