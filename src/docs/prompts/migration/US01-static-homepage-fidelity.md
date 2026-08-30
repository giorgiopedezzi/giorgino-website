# US01 — Static Homepage Fidelity

Phase 1 is complete. This US replaces homepage placeholders with the real current homepage.

## Sources
Visual source of truth:
https://www.figma.com/design/x7ws9KFxBn36LV10tRRmta/Untitled?node-id=1-2

Behavioral reference only:
https://global-expectations-562504.framer.app/

If they differ:
- Figma = visual/layout truth
- Framer = behavior truth

Do not copy Framer-generated code.
Do not paste Figma-generated React/Tailwind mechanically.

## Legacy scripts
Preserve unchanged and do not import/execute/refactor:
- `src/legacy/framer/scripts/typewriter.tsx`
- `src/legacy/framer/scripts/darkmatter.tsx`

They are reference material only and will be revisited in the final animation US.

## Objective
Replace placeholders with the real static English homepage in this exact order:
1. Hero
2. I Believe
3. Dark Matter
4. Thinking
5. The Running Project
6. A Short Personal Arc
7. Human
8. Really About Me
9. Continue the Conversation / Contact

## Inspect first
Inspect current Phase 1 architecture, tokens, primitives, locale structure, content structure and CSS conventions. Reuse them. Briefly report what exists before editing.

## Fidelity rules
Interpret the Figma design; do not reproduce export artifacts:
- no fixed exported canvas dimensions
- no arbitrary fixed section heights
- no unnecessary absolute positioning
- correct corrupted `?` punctuation
- no accidental Inter fallback
- no Framer runtime code

Use natural document flow.

## Typography
- Newsreader: hero, large headings, declarative statements
- Alegreya Sans: body, labels, navigation
- Mazius Display: rare editorial accent, currently Thinking preview titles

## Sections
Hero: label, headline, supporting copy, understated `Next?`.

I Believe: four declarative statements, label, separator.

Dark Matter: FINAL STATIC state only. Include label, title, narrative, closing thought, supporting sentence, `Next?`. No scrambling/typewriter.

Thinking: label, heading, intro and five editorial rows:
1. The tears were ours
2. Signal, noise and plausible answers
3. Some things should be earned
4. The humanities belong inside the AI revolution
5. Dialogues with AI
Do not create full article pages yet.

Running Project: reproduce dark-blue section and static visualization only. No chart library or animated runner.

Short Personal Arc: heading and four timeline/history rows with separators.

Human: label, heading, body, `Next?`. Use Alegreya Sans, not Inter.

Really About Me: preserve the fragment sequence:
- Still here?
- real-heart / real-human opening
- Every ten years...
- Missing Man
- Mortadella pizza
- WAIT WAIT WAIT
- The nonnino
- The book
- The dreams hunter runs free.
- `Next?`
Do not collapse into generic cards.

Contact: dark closing section, label, closing line, contact placeholders, final sentence.

## Responsive preparation
Desktop-first, but use fluid/max widths and avoid choices that inherently break mobile. Do not perfect mobile here.

## Do not implement
- animations
- scroll triggers
- animated runner
- article pages
- CMS
- final navigation
- Italian copy
- SEO deep work
- deployment

## Acceptance
Homepage is no longer placeholders; content and desktop composition closely match Figma; code is clean; no Framer production code; no animations.

## Final response
Report only:
1. what was implemented
2. files changed
3. fidelity compromises
4. anything for later USs

Do not start another US.
