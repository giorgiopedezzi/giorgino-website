# Personal Website Migration — Codex US Prompts

Current state:
- Phase 1 foundation is complete.
- Next.js + TypeScript project exists.
- Locale-ready routing and design tokens exist.
- Homepage skeleton exists.
- Figma is the visual source of truth.
- Framer is behavioral reference only.
- Legacy animation scripts:
  - `src/legacy/framer/scripts/typewriter.tsx`
  - `src/legacy/framer/scripts/darkmatter.tsx`

Sources:
- Figma: https://www.figma.com/design/x7ws9KFxBn36LV10tRRmta/Untitled?node-id=1-2
- Framer: https://global-expectations-562504.framer.app/

Execution order:
1. US01 Static homepage fidelity
2. US02 Responsive/mobile fidelity
3. US03 Complete site structure and navigation shell
4. US04 Thinking/editorial content system
5. US05 Running project deep page
6. US06 Really About Me deep page
7. US07 Locale implementation and language UX
8. US08 Accessibility/SEO/performance hardening
9. US09 Legacy animation redesign and reimplementation
10. US10 Production cutover and Framer retirement

Global rule for every US:
- inspect first
- implement only requested scope
- verify
- report files changed and limitations
- do not start the next US automatically
- do not publish/deploy unless explicitly requested

Design philosophy:
- editorial, spacious, warm, understated
- signal over noise
- progressive disclosure
- person/thinking before skills
- rhythm and pauses matter
- almost no links/CTAs during the first-pass homepage experience
- easy return navigation without inviting first-time shortcuts
