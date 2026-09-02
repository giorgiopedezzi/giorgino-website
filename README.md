# Giorgino Website

The source code for the Giorgino website, built with [Next.js](https://nextjs.org/) and TypeScript.

## Prerequisites

- Node.js 20 or later
- npm (or the package manager indicated by the lockfile)

## Getting started

Install dependencies and start the local development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app reloads automatically as you make changes.

## Useful commands

```bash
# Create an optimized production build
npm run build

# Run the production server after building
npm run start

# Run linting, when configured
npm run lint
```

## Environment variables

Store local configuration in `.env.local`. Do not commit environment files or credentials; `.env*` files are ignored by Git.

When adding a required variable, document its name and purpose here, and provide safe placeholder values in an example file if appropriate.

## Project conventions

- Keep feature work focused and covered by appropriate checks.
- Run the relevant validation commands before opening a review.
- Do not commit generated build output, dependencies, IDE settings, or secrets.

## Deployment

Create a production build with `npm run build`, then serve it with `npm run start`, or deploy through the hosting platform configured for the project.

## Local editorial workflow

1. Start the local server with `npm run dev`, then open `/keystatic`. The editor is intentionally available only during local development; production requests to the editor and preview-enablement routes return 404.
2. Edit English and Italian separately. Shared navigation/footer/language labels, social/contact links, site defaults, and About metadata live in the localized **Site settings** singletons. Contact page and homepage-contact copy share the localized **Contact** singleton. Home, Running, Thinking indexes/dialogues, and Thinking articles expose their own relevant search and social metadata. Canonical URLs, hreflang values, route destinations, environment configuration, and secrets are never editor fields.
3. The non-Thinking foundation lives in `src/content/site/{en,it}/authoring-foundation.json`. It demonstrates the approved semantic fields: required text, an optional safe link, section visibility, ordered repeatable links, and repository-owned JPEG, PNG, WebP, or GIF media with required alternative text and optional captions. It is a foundation fixture, not a migration of any public page.
4. To preview the foundation through the real component route, open `/api/site-preview/enable?locale=en` (or `locale=it`). The route renders `/en/authoring-foundation` in local development only. The included animated GIF proof and any newly added GIFs are rendered unoptimized so their frames are preserved.
5. To preview a Thinking draft through the site’s real Thinking route, open `/api/thinking-preview/enable?locale=en&slug=your-article-slug` (use `locale=it` for the Italian counterpart). The preview banner confirms that Draft Mode is active, refreshes saved content every few seconds, and provides an exit link. `/en/thinking` and `/it/thinking` also show their draft lists while preview is active.
6. Review every generated content/media diff before committing. Git remains the only authoritative source for public content. Never enter credentials, tokens, email-service secrets, analytics IDs, or other infrastructure values in content fields because saved content can be rendered to visitors.
7. Keep English and Italian article entries paired with the same `translationKey`, locale-specific slugs, and matching editorial intent. Missing article translations deliberately send the language switcher to the target locale’s Thinking index. Add media through the editor; Thinking media is stored under `public/thinking-media/`, site/social media under `public/site-media/`, and every rendered image needs useful alternative text.
8. Before review, run `npm run verify:thinking`, `npm run verify:site-authoring`, `npm run verify:site-renderer`, `npm run lint`, `npm run typecheck`, and `npm run build`. Correct validation errors rather than bypassing them: invalid paths, malformed JSON, missing translations, duplicate orders, unsafe links, unsupported media, and incomplete required fields are rejected.
9. Inspect the exact content and media diff, then make a local commit. A Thinking draft is not public until its status is `published` and its publication date is set. Deployment happens only after review and merge through the normal Vercel workflow; the authoring flow never pushes, merges, or publishes automatically.

Drafts stay out of normal public Thinking routes, metadata, and the sitemap. The editor and preview-enablement routes return 404 outside local development.
