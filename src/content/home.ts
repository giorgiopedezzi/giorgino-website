import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { Locale } from "./locales";
import { validateContentMetadata } from "./content-metadata";
import type { ContentBlock, HomeContent } from "./types";


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

export function validateHomeContent(value: unknown, path = "home.json"): HomeContent {
  const source = record(value, path);
  const metadata = record(source.metadata, `${path}.metadata`);
  const belief = record(source.belief, `${path}.belief`);
  const darkMatter = record(source.darkMatter, `${path}.darkMatter`);
  const thinking = record(source.thinking, `${path}.thinking`);
  const running = record(source.running, `${path}.running`);
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
    human: { ...block(source.human, `${path}.human`), linkLabel: text(record(source.human, `${path}.human`).linkLabel, `${path}.human.linkLabel`) },
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
