import Link from "next/link";

import { BodyCopy, DisplayHeading, PageContainer, Section, SectionLabel } from "@/components/primitives/Editorial";
import type { Locale } from "@/content/locales";

import styles from "./ReallyAboutMe.module.css";

const copy = {
  en: {
    label: "07 — Really About Me", stillHere: "Still here?", thanks: "Thank you. From the heart.",
    heart: ["Not the little heart icon.", "You can't leave a like here.", "But perhaps you can leave a little bit of your heart.", "The real one.", "Because you are a real human.", "Not a plausible one.", "Real."],
    ideas: ["Every ten years, apparently, I need a new bad idea.", "Around 30 — snowboard.", "Around 40 — motorcycle.", "Around 50 — sub-3 marathon.", "Around 60 — apparently, content creator."],
    missing: ["Missing Man.", "When I left a long project, I posted the missing-man formation from Goose's funeral. At night. Then I left the chat. I wanted the image to be the first thing they saw the next morning.", "Original Missing Man GIF — to be added.", "I learned what the missing-man formation meant afterwards. I just knew it was the image I wanted.", "I did it my way."],
    pizza: ["Mortadella pizza needs lemon zest.", "The acidity cuts through the fat.", "Zest only.", "Scratch into the pith and it turns bitter.", "Change a small detail, and the meaning of the whole changes.", "And yes, I tried it.", "I loved it.", "And no, the internet didn't tell me to."],
    wait: ["WAIT WAIT WAIT", "I said it often enough that two teammates put it on a T-shirt.", "The actual T-shirt belongs here."],
    nonnino: ["The nonnino", "The grandpa runs so fast that when he looks behind him, he sees the avant-garde approaching."],
    book: ["The book", "One day I'd like to write a book.", "Something that can speak when I'm not there to over-explain it.", "Preferably while I'm still around to complain about the reviews.", "The dreams hunter runs free."],
    next: "Continue the conversation",
  },
  it: {
    label: "07 — Davvero di me", stillHere: "Sei ancora qui?", thanks: "Grazie. Dal cuore.",
    heart: ["Non l'iconcina del cuore.", "Qui non puoi lasciare un like.", "Ma forse puoi lasciare un pezzetto del tuo cuore.", "Quello vero.", "Perché sei un essere umano vero.", "Non uno plausibile.", "Vero."],
    ideas: ["A quanto pare, ogni dieci anni ho bisogno di una nuova cattiva idea.", "Verso i 30 — snowboard.", "Verso i 40 — moto.", "Verso i 50 — maratona sotto le 3 ore.", "Verso i 60 — a quanto pare, content creator."],
    missing: ["Missing Man.", "Quando ho lasciato un progetto lungo, ho pubblicato la formazione Missing Man del funerale di Goose. Di notte. Poi sono uscito dalla chat. Volevo che fosse la prima immagine vista la mattina dopo.", "GIF originale Missing Man — da aggiungere.", "Ho scoperto dopo cosa significasse la formazione Missing Man. Sapevo solo che era l'immagine che volevo.", "L'ho fatto a modo mio."],
    pizza: ["La pizza con mortadella ha bisogno di scorza di limone.", "L'acidità taglia il grasso.", "Solo scorza.", "Arrivi all'albedo e diventa amara.", "Cambi un piccolo dettaglio e cambia il senso dell'insieme.", "E sì, l'ho provata.", "Mi è piaciuta.", "E no, non me l'ha detto internet."],
    wait: ["ASPETTA ASPETTA ASPETTA", "L'ho detto così spesso che due colleghi l'hanno messo su una maglietta.", "Qui ci va la maglietta vera."],
    nonnino: ["Il nonnino", "Il nonno corre così forte che, guardandosi indietro, vede arrivare l'avanguardia."],
    book: ["Il libro", "Un giorno vorrei scrivere un libro.", "Qualcosa che possa parlare quando non ci sono per spiegarlo troppo.", "Preferibilmente mentre sono ancora qui a lamentarmi delle recensioni.", "Il cacciatore di sogni corre libero."],
    next: "Continuiamo la conversazione",
  },
} as const;

function Artifact({ text, dark = false }: { text: string; dark?: boolean }) {
  return <div className={[styles.artifact, dark ? styles.artifactDark : ""].filter(Boolean).join(" ")}><span>Personal artifact</span><p>{text}</p></div>;
}

export function ReallyAboutMe({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const basePath = `/${locale}`;

  return <>
    <Section className={styles.hero} aria-labelledby="about-heading"><PageContainer><div className={styles.heroStack}>
      <SectionLabel>{text.label}</SectionLabel><DisplayHeading id="about-heading">{text.stillHere}</DisplayHeading><DisplayHeading as="p" className={styles.thanks}>{text.thanks}</DisplayHeading>
      <div className={styles.heart}>{text.heart.slice(0, 4).map((line) => <BodyCopy key={line}>{line}</BodyCopy>)}</div>
      <div className={styles.human}>{text.heart.slice(4, 6).map((line) => <BodyCopy key={line}>{line}</BodyCopy>)}<DisplayHeading as="p">{text.heart[6]}</DisplayHeading></div>
    </div></PageContainer></Section>

    <Section className={styles.bordered} aria-labelledby="ideas-heading"><PageContainer><div className={styles.stack}>
      <DisplayHeading as="h2" id="ideas-heading" className={styles.sectionHeading}>{text.ideas[0]}</DisplayHeading>
      <div className={styles.timeline}>{text.ideas.slice(1).map((idea, index) => <BodyCopy className={index === 3 ? styles.timelineFinal : ""} key={idea}>{idea}</BodyCopy>)}</div>
    </div></PageContainer></Section>

    <Section tone="darkMatter" aria-labelledby="missing-heading"><PageContainer><div className={styles.stack}>
      <DisplayHeading as="h2" id="missing-heading" className={styles.sectionHeading}>{text.missing[0]}</DisplayHeading><BodyCopy>{text.missing[1]}</BodyCopy><Artifact text={text.missing[2]} /><DisplayHeading as="p" className={styles.reflect}>{text.missing[3]}</DisplayHeading><p className={styles.muted}>{text.missing[4]}</p>
    </div></PageContainer></Section>

    <Section className={styles.pizza} aria-labelledby="pizza-heading"><PageContainer><div className={styles.pizzaStack}>
      <DisplayHeading as="h2" id="pizza-heading" className={styles.sectionHeading}>{text.pizza[0]}</DisplayHeading>{text.pizza.slice(1).map((line, index) => <BodyCopy className={index > 3 ? styles.pizzaEnd : ""} key={line}>{line}</BodyCopy>)}
    </div></PageContainer></Section>

    <Section tone="running" aria-labelledby="wait-heading"><PageContainer><div className={styles.stack}>
      <DisplayHeading as="h2" id="wait-heading" className={styles.waitHeading}>{text.wait[0]}</DisplayHeading><BodyCopy>{text.wait[1]}</BodyCopy><Artifact text={text.wait[2]} dark />
    </div></PageContainer></Section>

    <Section className={styles.nonnino} aria-labelledby="nonnino-heading"><PageContainer><div className={styles.nonninoStack}><SectionLabel>{text.nonnino[0]}</SectionLabel><DisplayHeading as="h2" id="nonnino-heading" className={styles.sectionHeading}>{text.nonnino[1]}</DisplayHeading></div></PageContainer></Section>

    <Section className={styles.bordered} aria-labelledby="book-heading"><PageContainer><div className={styles.stack}>
      <SectionLabel>{text.book[0]}</SectionLabel><DisplayHeading as="h2" id="book-heading" className={styles.sectionHeading}>{text.book[1]}</DisplayHeading><BodyCopy>{text.book[2]}</BodyCopy><BodyCopy>{text.book[3]}</BodyCopy><p className={styles.muted}>{text.book[4]}</p><Link className={styles.next} href={`${basePath}/contact`}>{text.next} →</Link>
    </div></PageContainer></Section>
  </>;
}
