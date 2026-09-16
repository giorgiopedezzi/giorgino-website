# GWR-34 editorial override notes

## Shared presentation foundation

`src/content/presentation.ts` is the single semantic vocabulary for editorial block presentation. Persist only optional `scale`, `measure`, and `tone` choices; omit a choice to reset it. `resolvePresentation()` is the canonical resolution point and always applies:

`design-system default -> section default -> content override`

It deliberately accepts no pixels, widths, font names, CSS properties, or section-specific flags. Current content contains no presentation overrides, so all existing output keeps inherited values.

## Relevant rigidity map

- Content persistence and per-locale validation live in `src/content/*.ts`; JSON lives in `src/content/site/{en,it}` and `src/content/thinking/{en,it}`. Keystatic registration and schemas are in `src/content/thinking-keystatic.config.ts`.
- Rendering primitives and the existing typography roles are `src/components/primitives/Editorial.tsx` and `RichText.tsx`; their CSS and responsive typography are in the adjacent CSS modules and `src/app/globals.css`.
- Route registration is file-system based under `src/app/[locale]`; navigation labels are persisted in `site-settings.json`, while route destinations remain code-controlled in `SiteNavigation.tsx`.
- Homepage narrative is intentionally limited to 1–4 items and belief statements to 1–6 in `home.ts` / Keystatic. Running principles are limited to 1–8 in `running.ts` / Keystatic. The personal narrative relies on exact 7/7/2 item sequences and slices in `ReallyAboutMe.tsx`; these are visual compositions, not safe generic collection patterns.
- Rich-text roles and inline size marks are already constrained by `rich-text.ts`, `rich-text-field.ts`, and `RichText.module.css`. Future override controls should use the shared presentation model rather than introduce new component booleans.
- Media is repository-owned (`/site-media/` or `/thinking-media/`) and validation allows JPEG, PNG, WebP, and GIF. `stretch` remains an existing media-specific boolean, not a general presentation choice.

## Constraint for later stories

Do not mass-populate JSON with resolved defaults. Add only explicit semantic overrides where an editorial decision is made, validate them with `validatePresentationOverrides()`, and resolve them at the block renderer with the relevant section default.
