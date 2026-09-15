import { richTextToPlainText, type RichText } from "../../content/rich-text";

export type DarkMatterPhase = "idle" | "narrative" | "restoring" | "pauseBeforeRestore" | "restored" | "final";

export function scrambleWord(word: string): string {
  const letters = Array.from(word);
  if (letters.length < 4) return word;

  const first = 1;
  const second = letters.length - 2;
  [letters[first], letters[second]] = [letters[second], letters[first]];
  return letters.join("");
}

export function scrambleText(text: string): string {
  return text.split(/(\s+)/).map((part) => (/^\s+$/.test(part) ? part : scrambleWord(part))).join("");
}

export function prepareNarrative(narrative: RichText[]) {
  const canonical = narrative.map(richTextToPlainText).join("\n\n");
  const stripped = canonical
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .toLocaleLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  return { canonical, stripped, words: stripped.split(" ").filter(Boolean) };
}

export function effectiveDarkMatterPhase(reducedMotion: boolean | null, phase: DarkMatterPhase): DarkMatterPhase {
  return reducedMotion ? "final" : phase;
}

export function isDarkMatterVisible(reducedMotion: boolean | null, phase: DarkMatterPhase): boolean {
  return Boolean(reducedMotion || phase !== "idle");
}
