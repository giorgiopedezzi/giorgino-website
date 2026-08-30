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
