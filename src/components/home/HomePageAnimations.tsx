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
import { RichTextCopy, RichTextInline } from "@/components/primitives/RichText";
import { richTextToPlainText, type RichText } from "@/content/rich-text";

import styles from "./HomePage.module.css";
import { effectiveDarkMatterPhase, isDarkMatterVisible, prepareNarrative, scrambleText, scrambleWord, type DarkMatterPhase } from "./home-animation";

type DarkMatterContent = {
  label: string;
  heading: string;
  narrative: RichText[];
  closingThought?: RichText;
  supportingText?: RichText;
};

type Props = {
  beliefLabel: string;
  beliefStatements: string[];
  darkMatter: DarkMatterContent;
  nextLabel: string;
  children: ReactNode;
};

const BELIEF_TICK_MS = 42;
const BELIEF_CHARACTERS_PER_TICK = 2;
const DARK_MATTER_TYPEWRITER_TICK_MS = 45;
const DARK_MATTER_NARRATIVE_PAUSE_MS = 4_000;
const DARK_MATTER_TRANSITION_TICK_MS = 70;
const DARK_MATTER_FINAL_PAUSE_MS = 3_000;
const DARK_MATTER_CHARACTERS_PER_TICK = 2;
const DARK_MATTER_VIEWPORT_THRESHOLD = 0.85;

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

export function HomePageAnimations({ beliefLabel, beliefStatements, darkMatter, nextLabel, children }: Props) {
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
  const beliefRanges = useMemo(() => {
    let offset = 0;
    return beliefStatements.map((statement) => {
      const start = offset;
      offset += statement.length + 1;
      return { start, length: statement.length };
    });
  }, [beliefStatements]);
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

  useEffect(() => {
    if (!isDarkMatterInView || darkPhase !== "idle") return;
    const timer = window.setTimeout(() => {
      setDarkPhase("narrative");
      setDarkCharacters(0);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [darkPhase, isDarkMatterInView]);

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
    // Create the context immediately so browsers that permit autoplay can play
    // the typewriter as soon as the Dark Matter section appears. Browsers that
    // suspend autoplay are still unlocked by the first trusted gesture below.
    const context = new AudioContext();
    audioContextRef.current = context;

    const enableKeyboardAudio = () => {
      void context.resume();
      window.removeEventListener("pointerdown", enableKeyboardAudio);
      window.removeEventListener("keydown", enableKeyboardAudio);
      window.removeEventListener("touchstart", enableKeyboardAudio);
    };
    // Audio contexts must be resumed from a trusted user gesture. A mouse-only
    // listener leaves the typewriter silent for keyboard and touch navigation.
    window.addEventListener("pointerdown", enableKeyboardAudio, { once: true });
    window.addEventListener("keydown", enableKeyboardAudio, { once: true });
    window.addEventListener("touchstart", enableKeyboardAudio, { once: true });
    return () => {
      window.removeEventListener("pointerdown", enableKeyboardAudio);
      window.removeEventListener("keydown", enableKeyboardAudio);
      window.removeEventListener("touchstart", enableKeyboardAudio);
    };
  }, []);

  const transitionTextCharacters = useMemo(
    () => Array.from(darkMatter.closingThought ? richTextToPlainText(darkMatter.closingThought) : ""),
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
  const effectiveDarkPhase = effectiveDarkMatterPhase(reducedMotion, darkPhase);
  const visibleNarrative = scrambleText(darkText.stripped).slice(0, darkCharacters);
  const visibleTransition = transitionTextCharacters.slice(0, transitionCharacterCount).join("");
  const displayedRestoredWords = transitionTextCharacters.length === 0 ? darkText.words.length : restoredWords;
  const showDarkMatter = isDarkMatterVisible(reducedMotion, darkPhase);

  return (
    <>
      <div ref={darkMatterRef} className={showDarkMatter ? styles.darkMatterVisible : styles.darkMatterPending}>
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
              ) : effectiveDarkPhase === "idle" || effectiveDarkPhase === "final" ? (
                darkMatter.narrative.map((paragraph, index) => <RichTextCopy key={index} value={paragraph} />)
              ) : visibleNarrative.split("\n\n").map((paragraph, index) => <BodyCopy key={index}>{paragraph}</BodyCopy>)}
            </div>
            {darkMatter.closingThought && effectiveDarkPhase === "restoring" && <DisplayHeading as="h3" className={styles.closingThought}>{visibleTransition}</DisplayHeading>}
            {darkMatter.closingThought && effectiveDarkPhase === "final" && <DisplayHeading as="h3" className={styles.closingThought}><RichTextInline value={darkMatter.closingThought} /></DisplayHeading>}
            {darkMatter.supportingText && effectiveDarkPhase === "final" && <RichTextCopy value={darkMatter.supportingText} className={styles.supportingText} />}
            {effectiveDarkPhase === "final" && <NextLink>{nextLabel}</NextLink>}
          </div>
        </PageContainer>
      </Section>
      </div>

      <div ref={beliefRef}>
      <Section className={styles.bordered} aria-labelledby="belief-heading">
        <PageContainer>
          <div className={styles.beliefStack}>
            <SectionLabel>{beliefLabel}</SectionLabel>
            {beliefRanges.map((range, statementIndex) => {
              const visible = animatedBelief.length > range.start
                ? beliefText.slice(range.start, Math.min(range.start + range.length, animatedBelief.length))
                : "";
              return (
                <div className={styles.statementGroup} key={statementIndex}>
                  {visible.split("\n").map((line, lineIndex) => (
                    <DisplayHeading
                      as="h2"
                      className={styles.statement}
                      id={statementIndex === 0 && lineIndex === 0 ? "belief-heading" : undefined}
                      key={lineIndex}
                    >
                      {line}
                    </DisplayHeading>
                  ))}
                </div>
              );
            })}
            <NextLink>{nextLabel}</NextLink>
          </div>
        </PageContainer>
      </Section>
      </div>
      {children}
    </>
  );
}
