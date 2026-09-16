import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { Locale } from "./locales";
import type { PersonalArtifact, PersonalNarrative, SiteMedia } from "./types";
import { validateRichText, type RichText } from "./rich-text";

export type AboutContent = {
  arc: { label: string; heading: RichText; timeline: RichText[] };
  personalNarrative: PersonalNarrative;
};

const mediaExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function fail(path: string, message: string): never {
  throw new Error(`Really About Me content validation failed at ${path}: ${message}`);
}

function record(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) fail(path, "expected an object");
  return value as Record<string, unknown>;
}

function text(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim() === "") fail(path, "expected a non-empty string");
  return value;
}

function rich(value: unknown, path: string): RichText { return validateRichText(value, path); }
function richArray(value: unknown, path: string, minimum: number, maximum?: number): RichText[] {
  if (!Array.isArray(value) || value.length < minimum || (maximum !== undefined && value.length > maximum)) fail(path, "unexpected number of items");
  return value.map((entry, index) => rich(entry, `${path}[${index}]`));
}

function artifact(value: unknown, path: string): PersonalArtifact {
  const source = record(value, path);
  const result: PersonalArtifact = { placeholder: text(source.placeholder, `${path}.placeholder`) };
  if (source.media === undefined || source.media === null) return result;
  const media = record(source.media, `${path}.media`);
  if (media.src === undefined || media.src === null || media.src === "") return result;
  const src = text(media.src, `${path}.media.src`);
  if (!src.startsWith("/site-media/") || !mediaExtensions.has(src.slice(src.lastIndexOf(".")).toLowerCase())) fail(`${path}.media.src`, "must reference a repository-owned image asset");
  const image: SiteMedia = { src, alt: text(media.alt, `${path}.media.alt`) };
  if (media.caption !== undefined && media.caption !== null && media.caption !== "") image.caption = text(media.caption, `${path}.media.caption`);
  if (media.stretch === true) image.stretch = true;
  result.media = image;
  return result;
}

export function validateAboutContent(value: unknown, path = "about.json"): AboutContent {
  const source = record(value, path);
  const arc = record(source.arc, `${path}.arc`);
  const narrative = record(source.personalNarrative, `${path}.personalNarrative`);
  const missingMan = record(narrative.missingMan, `${path}.personalNarrative.missingMan`);
  const pizza = record(narrative.pizza, `${path}.personalNarrative.pizza`);
  const wait = record(narrative.wait, `${path}.personalNarrative.wait`);
  const nonnino = record(narrative.nonnino, `${path}.personalNarrative.nonnino`);
  const book = record(narrative.book, `${path}.personalNarrative.book`);
  return {
    arc: { label: text(arc.label, `${path}.arc.label`), heading: rich(arc.heading, `${path}.arc.heading`), timeline: richArray(arc.timeline, `${path}.arc.timeline`, 1, 6) },
    personalNarrative: {
      label: text(narrative.label, `${path}.personalNarrative.label`),
      stillHere: rich(narrative.stillHere, `${path}.personalNarrative.stillHere`),
      thanks: rich(narrative.thanks, `${path}.personalNarrative.thanks`),
      opening: richArray(narrative.opening, `${path}.personalNarrative.opening`, 7, 7),
      decadeHeading: rich(narrative.decadeHeading, `${path}.personalNarrative.decadeHeading`),
      decadeEntries: richArray(narrative.decadeEntries, `${path}.personalNarrative.decadeEntries`, 1),
      artifactLabel: text(narrative.artifactLabel, `${path}.personalNarrative.artifactLabel`),
      missingMan: { heading: rich(missingMan.heading, `${path}.personalNarrative.missingMan.heading`), body: rich(missingMan.body, `${path}.personalNarrative.missingMan.body`), artifact: artifact(missingMan.artifact, `${path}.personalNarrative.missingMan.artifact`), reflection: rich(missingMan.reflection, `${path}.personalNarrative.missingMan.reflection`), signoff: rich(missingMan.signoff, `${path}.personalNarrative.missingMan.signoff`) },
      pizza: { heading: rich(pizza.heading, `${path}.personalNarrative.pizza.heading`), lines: richArray(pizza.lines, `${path}.personalNarrative.pizza.lines`, 7, 7) },
      wait: { heading: rich(wait.heading, `${path}.personalNarrative.wait.heading`), body: rich(wait.body, `${path}.personalNarrative.wait.body`), artifact: artifact(wait.artifact, `${path}.personalNarrative.wait.artifact`) },
      nonnino: { label: text(nonnino.label, `${path}.personalNarrative.nonnino.label`), heading: rich(nonnino.heading, `${path}.personalNarrative.nonnino.heading`) },
      book: { label: text(book.label, `${path}.personalNarrative.book.label`), heading: rich(book.heading, `${path}.personalNarrative.book.heading`), lines: richArray(book.lines, `${path}.personalNarrative.book.lines`, 2, 2), signoff: rich(book.signoff, `${path}.personalNarrative.book.signoff`) },
      continueLabel: text(narrative.continueLabel, `${path}.personalNarrative.continueLabel`),
    },
  };
}

export function getAboutContent(locale: Locale): AboutContent {
  const path = join(process.cwd(), "src", "content", "site", locale, "about.json");
  try {
    return validateAboutContent(JSON.parse(readFileSync(path, "utf8")), `${locale}/about.json`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not load Really About Me content for ${locale}: ${message}`);
  }
}
