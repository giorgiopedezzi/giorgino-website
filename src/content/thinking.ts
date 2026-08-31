import type { Locale } from "./locales";
import type { EditorialContent } from "./types";

const englishArticles: EditorialContent["articles"] = [
  { title: "The tears were ours", slug: "the-tears-were-ours", locale: "en", excerpt: "On anthropomorphising AI without forgetting what it is.", status: "draft", body: [] },
  { title: "Signal, noise and plausible answers", slug: "signal-noise-and-plausible-answers", locale: "en", excerpt: "Why AI increases the value of judgment rather than eliminating it.", status: "draft", body: [] },
  { title: "Some things should be earned", slug: "some-things-should-be-earned", locale: "en", excerpt: "Boston, friction, meaning and a world of instant outcomes.", status: "draft", body: [] },
  { title: "The humanities belong inside the AI revolution", slug: "the-humanities-belong-inside-the-ai-revolution", locale: "en", excerpt: "Not as resistance to technology, but as part of learning how to use it.", status: "draft", body: [] },
  { title: "Dialogues with AI", slug: "dialogues-with-ai", locale: "en", excerpt: "Short reflections born from real conversations with AI.", status: "draft", body: [] },
];

const italianArticles: EditorialContent["articles"] = [
  { title: "Le lacrime erano nostre", slug: "le-lacrime-erano-nostre", locale: "it", excerpt: "Sull'antropomorfizzare l'AI senza dimenticare che cosa sia.", status: "draft", body: [] },
  { title: "Segnale, rumore e risposte plausibili", slug: "segnale-rumore-e-risposte-plausibili", locale: "it", excerpt: "Perché l'AI aumenta il valore del giudizio invece di eliminarlo.", status: "draft", body: [] },
  { title: "Alcune cose dovrebbero essere conquistate", slug: "alcune-cose-dovrebbero-essere-conquistate", locale: "it", excerpt: "Boston, attrito, significato e un mondo di risultati immediati.", status: "draft", body: [] },
  { title: "Le discipline umanistiche appartengono alla rivoluzione dell'AI", slug: "le-discipline-umanistiche-appartengono-alla-rivoluzione-dell-ai", locale: "it", excerpt: "Non come resistenza alla tecnologia, ma per imparare a usarla.", status: "draft", body: [] },
  { title: "Dialoghi con l'AI", slug: "dialoghi-con-l-ai", locale: "it", excerpt: "Brevi riflessioni nate da conversazioni reali con l'AI.", status: "draft", body: [] },
];

export const thinkingContent: Record<Locale, EditorialContent> = {
  en: { label: "Thinking", heading: "Some notes worth leaving unfinished.", introduction: "Not content. A place to follow a line of thought long enough to see where it goes.", articles: englishArticles, dialogueArtifacts: [] },
  it: { label: "Pensieri", heading: "Appunti che vale la pena lasciare incompiuti.", introduction: "Non contenuti. Un luogo per seguire un pensiero abbastanza a lungo da vedere dove porta.", articles: italianArticles, dialogueArtifacts: [] },
};

export function getEditorialArticle(locale: Locale, slug: string) {
  return thinkingContent[locale].articles.find((article) => article.slug === slug);
}
