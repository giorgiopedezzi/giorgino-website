# GWR-25 homepage narrative restructure

## Current homepage inventory

| Order | Section | Purpose | Overlap / problem | Decision | Destination when removed from Home |
| --- | --- | --- | --- | --- | --- |
| 1 | Hero | Establish the central tension between changing technology and durable human judgment. | None; it is the clearest first-visit recognition point. | Keep | — |
| 2 | I Believe | State Giorgio's operating principles in a memorable sequence. | Some thematic overlap with Thinking, but its declarative voice has a distinct role. | Keep | — |
| 3 | Dark Matter | Turn the principles into a lived delivery perspective and demonstrate the site's distinctive animation. | The supporting paragraphs can feel like a second introduction, but the example earns its place. | Compress through composition: retain the approved copy and animation as the single concrete thesis example. | — |
| 4 | Thinking | Introduce the editorial work and list five article teasers. | The list duplicates the real Thinking index and makes Home behave like a miniature blog. | Compress / remove duplication: retain the section premise, remove the duplicate list, and link to the Thinking index. | `/[locale]/thinking` already owns the article titles and excerpts. |
| 5 | Running Project | Show building as evidence and preview the runner visual language. | The explanatory copy and principles are covered in greater depth on the Running / Building page. | Compress: retain one short explanation, the visual study, and a deep-page invitation. | `/[locale]/running` owns the full problem, restraint, principles, build process, project state, media, and live application. |
| 6 | A Short Personal Arc | Establish longevity, reinvention, running, and present-day AI work. | It competes with the Human and Really About Me sections and extends the homepage biography. | Move deeper / merge: remove it as a Home section and place the unchanged timeline on Really About Me. | `/[locale]/really-about-me` |
| 7 | Human | Connect the professional perspective to broader human interests. | It overlaps with the much longer Really About Me material but works well as a concise invitation. | Merge: make it the only personal signal on Home and link to Really About Me. | The full personal narrative remains at `/[locale]/really-about-me`. |
| 8 | Really About Me | Render the complete personal narrative, artifacts, anecdotes, and book aspiration. | It reproduces the entire deep page on Home. | Move deeper / remove duplication: remove the full block from Home. | `/[locale]/really-about-me` already renders the canonical content and supported media. |
| 9 | Contact | End with a quiet, direct way to continue the conversation. | None; it works as the close rather than a conversion block. | Keep | `/[locale]/contact` remains valid as the dedicated route. |

## Proposed first-visit journey

1. **Recognition — Hero:** understand that this is a person thinking about technology through judgment, systems, and human responsibility, not a résumé or consultancy pitch.
2. **Position — I Believe:** recognize the principles that guide the work.
3. **Evidence of perspective — Dark Matter:** see how those principles appear in real delivery environments.
4. **Go deeper into thought — Thinking:** understand that editorial work exists and choose to follow it without reading a miniature index on Home.
5. **Go deeper into making — Running / Building:** see one tangible experiment where human direction and AI implementation meet, without turning it into a product pitch.
6. **Meet the person — Human:** understand that the perspective extends beyond technology and choose to enter the complete personal narrative.
7. **Continue — Contact:** reach a restrained close with no conversion-oriented framing.

## Content, schema, animation, and file implications

- The localized homepage schema keeps all existing canonical editorial copy but removes duplicated `thinking.articles`; those titles and excerpts already live in the localized Thinking repository.
- `thinking`, `running`, and `human` gain localized `linkLabel` fields. Destinations remain code-controlled and locale-aware, so English and Italian stay structurally consistent and independently editable.
- `arc` remains in the existing homepage content record for authoring compatibility, but its unchanged content is rendered only on Really About Me. The personal narrative and its optional JPEG, PNG, WebP, and GIF artifacts remain canonical and unchanged.
- The Belief typewriter still receives one-to-six statements. Dark Matter still receives one-to-four narrative paragraphs plus its optional closing/supporting copy. Their semantic props and reduced-motion behavior remain unchanged. Downstream sections are no longer withheld until the full animation completes, so the narrative remains server-rendered, reachable without JavaScript, and immediately explorable.
- `Next?` remains after Hero, Belief, and the completed Dark Matter sequence as a pacing cue. Downstream sections use explicit deep-page links instead of repeating the cue mechanically.
- Expected implementation files: `HomePage.tsx`, `HomePageAnimations.tsx`, `HomePage.module.css`, `ReallyAboutMe.tsx`, `ReallyAboutMe.module.css`, localized page wiring, homepage types/validation, Keystatic schema, localized `home.json` records, and focused verification scripts.
