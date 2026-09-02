import { readFileSync } from "node:fs";
import { extname, join } from "node:path";

import type { Locale } from "./locales";
import { validateContentMetadata } from "./content-metadata";
import type { ContentBlock, HomeContent, PersonalArtifact, PersonalNarrative, SiteMedia } from "./types";

const mediaExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function fail(path: string, message: string): never {
  throw new Error(`Homepage content validation failed at ${path}: ${message}`);
}

function record(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) fail(path, "expected an object");
  return value as Record<string, unknown>;
}

function text(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim() === "") fail(path, "expected a non-empty string");
  return value;
}

function optionalText(value: unknown, path: string): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return text(value, path);
}

function textArray(value: unknown, path: string, minimum: number, maximum: number): string[] {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) {
    fail(path, `expected between ${minimum} and ${maximum} items`);
  }
  return value.map((entry, index) => text(entry, `${path}[${index}]`));
}

function block(value: unknown, path: string): ContentBlock {
  const source = record(value, path);
  return { label: text(source.label, `${path}.label`), heading: text(source.heading, `${path}.heading`), body: text(source.body, `${path}.body`) };
}

function media(value: unknown, path: string): SiteMedia | undefined {
  if (value === undefined || value === null) return undefined;
  const source = record(value, path);
  if (source.src === undefined || source.src === null || source.src === "") return undefined;
  const src = text(source.src, `${path}.src`);
  if (!src.startsWith("/site-media/") || !mediaExtensions.has(extname(src).toLowerCase())) {
    fail(`${path}.src`, "must reference a repository-owned JPEG, PNG, WebP, or GIF asset");
  }
  const result: SiteMedia = { src, alt: text(source.alt, `${path}.alt`) };
  if (source.caption !== undefined && source.caption !== null && source.caption !== "") result.caption = text(source.caption, `${path}.caption`);
  return result;
}

function artifact(value: unknown, path: string): PersonalArtifact {
  const source = record(value, path);
  const result: PersonalArtifact = { placeholder: text(source.placeholder, `${path}.placeholder`) };
  const asset = media(source.media, `${path}.media`);
  if (asset) result.media = asset;
  return result;
}

function personalNarrative(value: unknown, path: string): PersonalNarrative {
  const source = record(value, path);
  const missingMan = record(source.missingMan, `${path}.missingMan`);
  const pizza = record(source.pizza, `${path}.pizza`);
  const wait = record(source.wait, `${path}.wait`);
  const nonnino = record(source.nonnino, `${path}.nonnino`);
  const book = record(source.book, `${path}.book`);
  return {
    label: text(source.label, `${path}.label`),
    stillHere: text(source.stillHere, `${path}.stillHere`),
    thanks: text(source.thanks, `${path}.thanks`),
    opening: textArray(source.opening, `${path}.opening`, 7, 7),
    decadeHeading: text(source.decadeHeading, `${path}.decadeHeading`),
    decadeEntries: textArray(source.decadeEntries, `${path}.decadeEntries`, 4, 4),
    artifactLabel: text(source.artifactLabel, `${path}.artifactLabel`),
    missingMan: {
      heading: text(missingMan.heading, `${path}.missingMan.heading`),
      body: text(missingMan.body, `${path}.missingMan.body`),
      artifact: artifact(missingMan.artifact, `${path}.missingMan.artifact`),
      reflection: text(missingMan.reflection, `${path}.missingMan.reflection`),
      signoff: text(missingMan.signoff, `${path}.missingMan.signoff`),
    },
    pizza: { heading: text(pizza.heading, `${path}.pizza.heading`), lines: textArray(pizza.lines, `${path}.pizza.lines`, 7, 7) },
    wait: { heading: text(wait.heading, `${path}.wait.heading`), body: text(wait.body, `${path}.wait.body`), artifact: artifact(wait.artifact, `${path}.wait.artifact`) },
    nonnino: { label: text(nonnino.label, `${path}.nonnino.label`), heading: text(nonnino.heading, `${path}.nonnino.heading`) },
    book: { label: text(book.label, `${path}.book.label`), heading: text(book.heading, `${path}.book.heading`), lines: textArray(book.lines, `${path}.book.lines`, 2, 2), signoff: text(book.signoff, `${path}.book.signoff`) },
    continueLabel: text(source.continueLabel, `${path}.continueLabel`),
  };
}

export function validateHomeContent(value: unknown, path = "home.json"): HomeContent {
  const source = record(value, path);
  const metadata = record(source.metadata, `${path}.metadata`);
  const belief = record(source.belief, `${path}.belief`);
  const darkMatter = record(source.darkMatter, `${path}.darkMatter`);
  const thinking = record(source.thinking, `${path}.thinking`);
  const running = record(source.running, `${path}.running`);
  const arc = record(source.arc, `${path}.arc`);
  const result: HomeContent = {
    metadata: validateContentMetadata(metadata, `${path}.metadata`),
    nextLabel: text(source.nextLabel, `${path}.nextLabel`),
    hero: block(source.hero, `${path}.hero`),
    belief: { label: text(belief.label, `${path}.belief.label`), statements: textArray(belief.statements, `${path}.belief.statements`, 1, 6) },
    darkMatter: {
      label: text(darkMatter.label, `${path}.darkMatter.label`),
      heading: text(darkMatter.heading, `${path}.darkMatter.heading`),
      narrative: textArray(darkMatter.narrative, `${path}.darkMatter.narrative`, 1, 4),
    },
    thinking: { ...block(thinking, `${path}.thinking`), linkLabel: text(thinking.linkLabel, `${path}.thinking.linkLabel`) },
    running: {
      ...block(running, `${path}.running`),
      surfaceHeading: text(running.surfaceHeading, `${path}.running.surfaceHeading`),
      surfaceLabel: text(running.surfaceLabel, `${path}.running.surfaceLabel`),
      placeholder: text(running.placeholder, `${path}.running.placeholder`),
      linkLabel: text(running.linkLabel, `${path}.running.linkLabel`),
    },
    arc: { label: text(arc.label, `${path}.arc.label`), heading: text(arc.heading, `${path}.arc.heading`), timeline: textArray(arc.timeline, `${path}.arc.timeline`, 1, 6) },
    human: { ...block(source.human, `${path}.human`), linkLabel: text(record(source.human, `${path}.human`).linkLabel, `${path}.human.linkLabel`) },
    personalNarrative: personalNarrative(source.personalNarrative, `${path}.personalNarrative`),
  };
  const closingThought = optionalText(darkMatter.closingThought, `${path}.darkMatter.closingThought`);
  const darkSupportingText = optionalText(darkMatter.supportingText, `${path}.darkMatter.supportingText`);
  const runningSupportingStatement = optionalText(running.supportingStatement, `${path}.running.supportingStatement`);
  if (closingThought) result.darkMatter.closingThought = closingThought;
  if (darkSupportingText) result.darkMatter.supportingText = darkSupportingText;
  if (runningSupportingStatement) result.running.supportingStatement = runningSupportingStatement;
  return result;
}

export function getHomeContent(locale: Locale): HomeContent {
  const path = join(process.cwd(), "src", "content", "site", locale, "home.json");
  try {
    return validateHomeContent(JSON.parse(readFileSync(path, "utf8")), `${locale}/home.json`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not load homepage content for ${locale}: ${message}`);
  }
}
