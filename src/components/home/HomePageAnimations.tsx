"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

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
  children: ReactNode;
};

const BELIEF_TICK_MS = 42;
const BELIEF_CHARACTERS_PER_TICK = 2;
const DARK_MATTER_TYPEWRITER_TICK_MS = 34;
const DARK_MATTER_NARRATIVE_PAUSE_MS = 5_000;
const DARK_MATTER_TRANSITION_TICK_MS = 70;
const DARK_MATTER_FINAL_PAUSE_MS = 2_000;
const DARK_MATTER_CHARACTERS_PER_TICK = 2;
const DARK_MATTER_VIEWPORT_THRESHOLD = 0.35;

type DarkMatterPhase = "idle" | "narrative" | "restoring" | "final";

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

export function HomePageAnimations({ beliefLabel, beliefStatements, darkMatter, children }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const beliefRef = useRef<HTMLDivElement>(null);
  const darkMatterRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [beliefCharacters, setBeliefCharacters] = useState<number | null>(null);
  const [darkPhase, setDarkPhase] = useState<DarkMatterPhase>("idle");
  const [isDarkMatterInView, setIsDarkMatterInView] = useState(false);
  const [darkCharacters, setDarkCharacters] = useState(0);
  const [transitionCharacterCount, setTransitionCharacterCount] = useState(0);
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
      setBeliefCharacters((count) => Math.min((count ?? 0) + BELIEF_CHARACTERS_PER_TICK, beliefText.length));
    }, BELIEF_TICK_MS);
    return () => window.clearTimeout(timer);
  }, [beliefCharacters, beliefText.length]);

  useEffect(() => {
    if (reducedMotion === null || reducedMotion) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      setIsDarkMatterInView(true);
    }, { threshold: DARK_MATTER_VIEWPORT_THRESHOLD });
    if (darkMatterRef.current) observer.observe(darkMatterRef.current);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const isBeliefComplete = reducedMotion || beliefCharacters === beliefText.length;

  useEffect(() => {
    if (!isBeliefComplete || !isDarkMatterInView || darkPhase !== "idle") return;
    const timer = window.setTimeout(() => {
      setDarkPhase("narrative");
      setDarkCharacters(0);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [darkPhase, isBeliefComplete, isDarkMatterInView]);

  useEffect(() => {
    if (darkPhase !== "narrative") return;
    if (darkCharacters >= darkText.stripped.length) {
      const timer = window.setTimeout(() => {
        setTransitionCharacterCount(0);
        setRestoredWords(0);
        setDarkPhase("restoring");
      }, DARK_MATTER_NARRATIVE_PAUSE_MS);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => {
      setDarkCharacters((count) => Math.min(count + DARK_MATTER_CHARACTERS_PER_TICK, darkText.stripped.length));
      playKeyboardTick(audioContextRef.current);
    }, DARK_MATTER_TYPEWRITER_TICK_MS);
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

  const transitionTextCharacters = useMemo(
    () => Array.from(darkMatter.closingThought ?? ""),
    [darkMatter.closingThought],
  );

  useEffect(() => {
    if (darkPhase !== "restoring") return;
    if (transitionTextCharacters.length === 0) {
      const timer = window.setTimeout(() => setDarkPhase("final"), DARK_MATTER_FINAL_PAUSE_MS);
      return () => window.clearTimeout(timer);
    }
    if (transitionCharacterCount >= transitionTextCharacters.length) {
      const timer = window.setTimeout(() => setDarkPhase("final"), DARK_MATTER_FINAL_PAUSE_MS);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => {
      setTransitionCharacterCount((count) => {
        const nextCount = Math.min(count + 1, transitionTextCharacters.length);
        setRestoredWords(Math.round((nextCount / transitionTextCharacters.length) * darkText.words.length));
        return nextCount;
      });
    }, DARK_MATTER_TRANSITION_TICK_MS);
    return () => window.clearTimeout(timer);
  }, [darkPhase, darkText.words.length, transitionCharacterCount, transitionTextCharacters.length]);

  useEffect(() => () => {
    void audioContextRef.current?.close();
  }, []);

  const animatedBelief = reducedMotion || beliefCharacters === null ? beliefText : beliefText.slice(0, beliefCharacters);
  const effectiveDarkPhase: DarkMatterPhase = reducedMotion ? "final" : darkPhase;
  const visibleNarrative = effectiveDarkPhase === "idle" || effectiveDarkPhase === "final"
    ? darkText.canonical
    : scrambleText(darkText.stripped).slice(0, darkCharacters);
  const visibleTransition = transitionTextCharacters.slice(0, transitionCharacterCount).join("");
  const displayedRestoredWords = transitionTextCharacters.length === 0 ? darkText.words.length : restoredWords;
  const isDarkMatterVisible = reducedMotion || (isBeliefComplete && darkPhase !== "idle");

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

      <div ref={darkMatterRef} className={isDarkMatterVisible ? styles.darkMatterVisible : styles.darkMatterPending}>
      <Section tone="darkMatter" aria-labelledby="dark-matter-heading">
        <PageContainer>
          <div className={styles.darkMatterStack}>
            <SectionLabel>{darkMatter.label}</SectionLabel>
            <DisplayHeading as="h2" id="dark-matter-heading" className={styles.sectionHeading}>{darkMatter.heading}</DisplayHeading>
            <div className={styles.narrative} aria-label={darkText.canonical}>
              {effectiveDarkPhase === "restoring" ? (
                <BodyCopy>
                  {darkText.words.map((word, index) => (
                    <span className={index < displayedRestoredWords ? styles.restoredWord : undefined} key={`${word}-${index}`}>{index < displayedRestoredWords ? word : scrambleWord(word)}{index < darkText.words.length - 1 ? " " : ""}</span>
                  ))}
                </BodyCopy>
              ) : visibleNarrative.split("\n\n").map((paragraph, index) => <BodyCopy key={index}>{paragraph}</BodyCopy>)}
            </div>
            {darkMatter.closingThought && effectiveDarkPhase === "restoring" && <DisplayHeading as="h3" className={styles.closingThought}>{visibleTransition}</DisplayHeading>}
            {darkMatter.closingThought && effectiveDarkPhase === "final" && <DisplayHeading as="h3" className={styles.closingThought}>{darkMatter.closingThought}</DisplayHeading>}
            {darkMatter.supportingText && effectiveDarkPhase === "final" && <BodyCopy className={styles.supportingText}>{darkMatter.supportingText}</BodyCopy>}
            {effectiveDarkPhase === "final" && <NextLink />}
          </div>
        </PageContainer>
      </Section>
      </div>
      {effectiveDarkPhase === "final" && children}
    </>
  );
}
