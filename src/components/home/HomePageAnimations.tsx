"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  BodyCopy,
  DisplayHeading,
  NextLink,
  PageContainer,
  Section,
  SectionLabel,
} from "@/components/primitives/Editorial";

import styles from "./HomePage.module.css";

type DarkMatterContent = {
  label: string;
  heading: string;
  narrative: string[];
  closingThought?: string;
  supportingText?: string;
};

type Props = {
  beliefLabel: string;
  beliefStatements: string[];
  darkMatter: DarkMatterContent;
};

const BELIEF_TICK_MS = 42;
const DARK_TYPE_TICK_MS = 34;
const RESTORE_TICK_MS = 260;
const FINAL_PAUSE_MS = 1_100;
const CHARACTERS_PER_TICK = 2;

function scrambleWord(word: string): string {
  const letters = Array.from(word);
  if (letters.length < 4) return word;

  // A fixed middle-letter swap gives the Cambridge effect without random output.
  const first = 1;
  const second = letters.length - 2;
  [letters[first], letters[second]] = [letters[second], letters[first]];
  return letters.join("");
}

function scrambleText(text: string): string {
  return text.split(/(\s+)/).map((part) => (/^\s+$/.test(part) ? part : scrambleWord(part))).join("");
}

function prepareNarrative(narrative: string[]) {
  const canonical = narrative.join("\n\n");
  const stripped = canonical
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .toLocaleLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  const words = stripped.split(" ").filter(Boolean);

  return { canonical, stripped, words };
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

function playKeyboardTick(context: AudioContext | null) {
  if (!context || context.state === "suspended") return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "square";
  oscillator.frequency.value = 1_450;
  gain.gain.setValueAtTime(0.018, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.025);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.028);
}

export function HomePageAnimations({ beliefLabel, beliefStatements, darkMatter }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const beliefRef = useRef<HTMLDivElement>(null);
  const darkMatterRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [beliefCharacters, setBeliefCharacters] = useState<number | null>(null);
  const [darkPhase, setDarkPhase] = useState<"idle" | "typing" | "restoring" | "final">("idle");
  const [darkCharacters, setDarkCharacters] = useState(0);
  const [restoredWords, setRestoredWords] = useState(0);

  const beliefText = beliefStatements.join("\n");
  const darkText = useMemo(() => prepareNarrative(darkMatter.narrative), [darkMatter.narrative]);

  useEffect(() => {
    if (reducedMotion === null) return;
    if (reducedMotion) return;

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      setBeliefCharacters(0);
    }, { threshold: 0.35 });
    if (beliefRef.current) observer.observe(beliefRef.current);
    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (beliefCharacters === null || beliefCharacters >= beliefText.length) return;
    const timer = window.setTimeout(() => {
      setBeliefCharacters((count) => Math.min((count ?? 0) + CHARACTERS_PER_TICK, beliefText.length));
    }, BELIEF_TICK_MS);
    return () => window.clearTimeout(timer);
  }, [beliefCharacters, beliefText.length]);

  useEffect(() => {
    if (reducedMotion === null || reducedMotion) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      setDarkPhase("typing");
      setDarkCharacters(0);
    }, { threshold: 0.3 });
    if (darkMatterRef.current) observer.observe(darkMatterRef.current);
    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (darkPhase !== "typing") return;
    if (darkCharacters >= darkText.stripped.length) {
      const timer = window.setTimeout(() => {
        setDarkPhase("restoring");
        setRestoredWords(0);
      }, 0);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => {
      setDarkCharacters((count) => Math.min(count + CHARACTERS_PER_TICK, darkText.stripped.length));
      playKeyboardTick(audioContextRef.current);
    }, DARK_TYPE_TICK_MS);
    return () => window.clearTimeout(timer);
  }, [darkCharacters, darkPhase, darkText.stripped.length]);

  useEffect(() => {
    const enableKeyboardAudio = () => {
      if (!audioContextRef.current) audioContextRef.current = new AudioContext();
      void audioContextRef.current.resume();
    };
    window.addEventListener("pointerdown", enableKeyboardAudio, { once: true });
    return () => window.removeEventListener("pointerdown", enableKeyboardAudio);
  }, []);

  useEffect(() => {
    if (darkPhase !== "restoring") return;
    if (restoredWords >= darkText.words.length) {
      const timer = window.setTimeout(() => setDarkPhase("final"), FINAL_PAUSE_MS);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setRestoredWords((count) => count + 1), RESTORE_TICK_MS);
    return () => window.clearTimeout(timer);
  }, [darkPhase, darkText.words.length, restoredWords]);

  useEffect(() => () => {
    void audioContextRef.current?.close();
  }, []);

  const animatedBelief = reducedMotion || beliefCharacters === null ? beliefText : beliefText.slice(0, beliefCharacters);
  const effectiveDarkPhase = reducedMotion ? "final" : darkPhase;
  const visibleNarrative = effectiveDarkPhase === "idle" || effectiveDarkPhase === "final"
    ? darkText.canonical
    : scrambleText(darkText.stripped).slice(0, darkCharacters);

  return (
    <>
      <div ref={beliefRef}>
      <Section className={styles.bordered} aria-labelledby="belief-heading">
        <PageContainer>
          <div className={styles.beliefStack}>
            <SectionLabel>{beliefLabel}</SectionLabel>
            {animatedBelief.split("\n").map((statement, index) => (
              <DisplayHeading as="h2" className={styles.statement} id={index === 0 ? "belief-heading" : undefined} key={`${index}-${statement}`}>
                {statement}
              </DisplayHeading>
            ))}
            <NextLink />
          </div>
        </PageContainer>
      </Section>
      </div>

      <div ref={darkMatterRef}>
      <Section tone="darkMatter" aria-labelledby="dark-matter-heading">
        <PageContainer>
          <div className={styles.darkMatterStack}>
            <SectionLabel>{darkMatter.label}</SectionLabel>
            <DisplayHeading as="h2" id="dark-matter-heading" className={styles.sectionHeading}>{darkMatter.heading}</DisplayHeading>
            <div className={styles.narrative} aria-label={darkText.canonical}>
              {effectiveDarkPhase === "restoring" ? darkText.words.map((word, index) => (
                <span className={index < restoredWords ? styles.restoredWord : undefined} key={`${word}-${index}`}>{word}{index < darkText.words.length - 1 ? " " : ""}</span>
              )) : visibleNarrative.split("\n\n").map((paragraph, index) => <BodyCopy key={index}>{paragraph}</BodyCopy>)}
            </div>
            {darkMatter.closingThought && effectiveDarkPhase === "final" && <DisplayHeading as="h3" className={styles.closingThought}>{darkMatter.closingThought}</DisplayHeading>}
            {darkMatter.supportingText && <BodyCopy className={styles.supportingText}>{darkMatter.supportingText}</BodyCopy>}
            <NextLink />
          </div>
        </PageContainer>
      </Section>
      </div>
    </>
  );
}
