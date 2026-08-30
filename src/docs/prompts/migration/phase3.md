We are continuing the migration of an existing personal website from Framer to a clean Next.js codebase.

PHASE 1 is complete:
- Next.js + TypeScript foundation exists
- locale-ready routing exists
- design tokens / typography foundation exists
- homepage section skeleton exists
- placeholders exist for the current homepage sections

This task is PHASE 2 only.

Do not start animation work.
Do not redesign anything.
Do not add new site architecture.

---

# Source of truth

## Visual source of truth
Figma:
https://www.figma.com/design/x7ws9KFxBn36LV10tRRmta/Untitled?node-id=1-2

## Legacy behavioral reference
Framer:
https://global-expectations-562504.framer.app/

Use Framer only to inspect:
- hover states
- scroll behavior
- transitions
- animation intent
- responsive behavior when Figma is ambiguous

For this phase, DO NOT implement those behaviors.

If Figma and Framer differ:
- Figma = visual/layout truth
- Framer = behavior truth

Do not copy Framer-generated code.
Do not depend on Framer runtime.
Do not mechanically paste Figma-generated React/Tailwind.

---

# Objective

Replace the Phase 1 placeholders with the real current homepage and reproduce the static desktop design faithfully.

The current homepage sequence is:

1. Hero
2. I Believe
3. Dark Matter
4. Thinking
5. The Running Project
6. A Short Personal Arc
7. Human
8. Really About Me
9. Continue the Conversation / Contact

The result should visually resemble the current Figma design as closely as practical while keeping the code clean, semantic, and maintainable.

---

# Important implementation principle

Do not reproduce Figma export artifacts literally.

The Figma export contains:
- fixed heights
- large hardcoded canvas dimensions
- absolute positioning
- corrupted punctuation in a few places
- at least one accidental Inter fallback
- placeholder artifacts
- generated-layout noise

Interpret the design.

Do not imitate the export mechanism.

---

# Step 1 — inspect current code first

Before editing:

1. Inspect the Phase 1 implementation.
2. Identify:
   - existing tokens
   - existing section primitives
   - content structure
   - locale structure
   - current CSS/layout conventions
3. Reuse them.
4. Do not replace working architecture unless there is a clear problem.

Give a short diagnosis before implementation.

---

# Step 2 — reproduce the actual homepage content

Populate the English homepage with the current copy shown in Figma.

Preserve the current editorial hierarchy and sequence.

Do not invent copy.

Do not shorten copy.

Do not “improve” wording.

Where Figma export text is corrupted by `?` replacing apostrophes or dashes, use the intended correct punctuation based on the current site/reference.

Do not preserve encoding/export corruption.

---

# Step 3 — desktop layout fidelity

Target the Figma desktop composition.

Important design characteristics:

- warm off-white page background
- centered approximately 1080px content system
- generous horizontal padding
- strong vertical spacing
- restrained section separators
- mostly left-aligned editorial composition
- occasional right-aligned personal fragments in Really About Me
- full-width section color changes inside the main editorial column
- no conventional card-grid visual language
- no SaaS styling

Use natural document flow.

Avoid fixed section heights unless a specific visual block genuinely requires one.

Avoid absolute positioning unless necessary for a small local visual detail.

---

# Step 4 — typography fidelity

Use the existing Phase 1 font setup.

## Newsreader
Use for:
- hero headline
- large section headings
- declarative statements

## Alegreya Sans
Use for:
- body copy
- labels
- navigation
- supporting text

## Mazius Display
Use only where the current Figma design uses it as an editorial accent:
- Thinking article preview titles

Do not use Mazius broadly.

Do not preserve the accidental Inter fallback visible in the exported Human section.

---

# Step 5 — reproduce each section

## 1. Hero

Reproduce:
- small uppercase label
- large Newsreader headline
- supporting body copy
- understated `Next?`

No animation.

No navigation behavior beyond a static or ordinary anchor placeholder if already present.

---

## 2. I Believe

Reproduce the four declarative statements and section label.

Preserve the hierarchy and breathing room.

Use thin top border/separator as in Figma.

---

## 3. Dark Matter

Reproduce the static FINAL state only.

Include:
- label
- title
- narrative
- closing thought
- final supporting sentence
- `Next?`

Do NOT implement the Cambridge/scrambling effect in this phase.

Do not create transitional text states.

Use the final authored text only.

---

## 4. Thinking

Reproduce:
- section label
- heading
- supporting description
- five editorial preview rows

Article previews:

01 — The tears were ours
02 — Signal, noise and plausible answers
03 — Some things should be earned
04 — The humanities belong inside the AI revolution
05 — Dialogues with AI

Use Mazius Display for titles if the current design does.

Keep rows editorial and understated.

Do not create working article pages yet.

If a link destination is needed structurally, use a safe placeholder route or disabled/static behavior consistent with the existing Phase 1 architecture.

Do not invent content pages.

---

## 5. The Running Project

Reproduce the current dark-blue section.

Include:
- label
- heading
- intro copy
- static visualization card
- supporting statement
- `Next?`

Important:

The visualization is still a placeholder/static representation in Phase 2.

Do not build the real animated runner.

Do not add chart libraries.

Reproduce the simple visual language from Figma only.

---

## 6. A Short Personal Arc

Reproduce:
- label
- heading
- four timeline/history rows
- thin separators
- `Next?`

No animation.

---

## 7. Human

Reproduce:
- label
- heading
- paragraph
- `Next?`

Ensure body copy uses Alegreya Sans, not Inter.

---

## 8. Really About Me

Reproduce the current long personal section faithfully.

This includes the current internal sequence:

### Opening
- `07 — REALLY ABOUT ME`
- `Still here?`
- `Thank you. From the heart.`
- real-heart / real-human sequence
- `Real.`

### Every ten years...
- snowboard
- motorcycle
- sub-3 marathon
- content creator

### Missing Man
- heading
- story
- personal artifact placeholder
- reflection
- `I did it my way.`

### Mortadella pizza
- current staggered/right-aligned editorial composition
- preserve line rhythm
- no explanatory metaphor added

### WAIT WAIT WAIT
- dark-blue section
- large heading
- short explanation
- T-shirt placeholder

### The nonnino
- right-aligned composition

### The book
- heading
- supporting copy
- `The dreams hunter runs free.`

Then:
- `Next?`

Do not collapse these into generic cards.

Do not simplify them into a conventional About page.

The section should feel like a sequence of fragments.

---

## 9. Contact / Continue the Conversation

Reproduce:
- dark final section
- small label
- large closing line
- email placeholder/details
- LinkedIn placeholder/details
- final supporting sentence

Do not invent final contact information if it is not already in the project.

Keep placeholders where the current design uses placeholders.

---

# Step 6 — responsive preparation

This phase is desktop-first.

However:
- do not write code that inherently breaks on smaller screens
- use fluid widths where reasonable
- use max-width containers
- avoid giant fixed widths
- avoid forced `white-space: nowrap` unless visually necessary

Do not spend this phase perfecting mobile.

Mobile refinement is a later task.

---

# Step 7 — visual consistency

Reuse shared primitives where appropriate.

Examples:
- SectionLabel
- DisplayHeading
- BodyCopy
- Divider
- NextLink
- editorial row component

But do not over-componentize.

Repeated editorial rules should be centralized.
Unique narrative fragments should remain readable in their section component.

---

# Step 8 — accessibility basics

Use semantic HTML:
- headings in sensible hierarchy
- sections
- nav/link semantics where appropriate
- proper text contrast
- decorative elements hidden from assistive tech when needed

Do not add excessive ARIA.

---

# Do NOT implement in Phase 2

Do not implement:

- Dark Matter scrambling
- scroll-triggered animations
- page transitions
- hover animation polish
- animated running visualization
- article pages
- CMS
- final site navigation
- sticky menu
- return-visitor shortcuts
- multilingual Italian copy
- SEO deep work
- analytics
- deployment

---

# Acceptance criteria

Phase 2 is done when:

1. The homepage no longer looks like a placeholder skeleton.
2. All current homepage content is present.
3. Section order matches the Figma source.
4. Desktop layout closely resembles the Figma reference.
5. Typography hierarchy is correct.
6. Colors match the token system.
7. Export artifacts are not reproduced literally.
8. No accidental Inter remains.
9. No Framer-specific code exists.
10. No animation work has been introduced.
11. The code remains clean and maintainable.
12. Nothing outside the homepage migration scope has been added.

---

# Final response

Report only:

1. What was implemented
2. Files changed
3. Any fidelity compromises
4. Anything that should be handled in Phase 3

Do not start Phase 3.