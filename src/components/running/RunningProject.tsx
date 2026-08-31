import { BodyCopy, DisplayHeading, EditorialHeading, PageContainer, Section, SectionLabel } from "@/components/primitives/Editorial";
import type { Locale } from "@/content/locales";

import styles from "./RunningProject.module.css";

const copy = {
  en: {
    label: "Running / Building", heading: "The runner enlightens the data.", intro: "Without the runner, there is telemetry. With the runner, the data acquires meaning.",
    problem: ["The problem", "More metrics do not automatically create more understanding.", "A running plan can look precise while still missing the person who has to live it. Information is useful only when it helps a runner make sense of what is happening."],
    restraint: ["A deliberate restraint", "Not another dashboard asking to be obeyed.", "This is not an attempt to reproduce every metric, build a universal coach, or turn running into a compliance exercise. It makes room for interpretation while keeping the objective in view."],
    principles: ["Signal over noise.", "Flexible plans over false perfection.", "Adaptation without losing the objective.", "Assistance without surrender.", "The runner remains at the centre."],
    object: ["The object", "A small visual language for a moving human being.", "The visual study below is not a product dashboard. It explains the idea: heart-rate intensity moves from pink towards red; a long pause lets the runner collapse, while a short one keeps them jogging in place."],
    study: ["A body, not a spreadsheet", "A visual study", "The figure gives the telemetry a subject. The data is still there, but it no longer pretends to be the whole story."],
    build: ["How it is being built", "AI coding agents, under human direction.", "The implementation is often delegated to AI coding agents. The concept, constraints, priorities and decisions remain human work. That division is part of the experiment."],
    state: ["Current state", "A living experiment.", "The project is still being shaped in public-facing fragments. This page records the thinking behind it without claiming a finished product where one does not yet exist."],
  },
  it: {
    label: "Running / Costruire", heading: "Il runner da significato ai dati.", intro: "Senza il runner ci sono dati telemetrici. Con il runner, i dati acquistano significato.",
    problem: ["Il problema", "Piu metriche non significano automaticamente piu comprensione.", "Un piano di corsa puo sembrare preciso e comunque perdere di vista la persona che deve viverlo. L'informazione e utile solo se aiuta il runner a capire cosa sta succedendo."],
    restraint: ["Una scelta di misura", "Non l'ennesima dashboard da obbedire.", "Non e un tentativo di riprodurre ogni metrica, costruire un coach universale o trasformare la corsa in un esercizio di conformita. Lascia spazio all'interpretazione, senza perdere di vista la direzione."],
    principles: ["Segnale prima del rumore.", "Piani flessibili prima della falsa perfezione.", "Adattamento senza perdere l'obiettivo.", "Assistenza senza resa.", "Il runner resta al centro."],
    object: ["L'oggetto", "Un piccolo linguaggio visivo per un essere umano in movimento.", "Lo studio visivo qui sotto non e una dashboard di prodotto. Spiega l'idea: l'intensita della frequenza cardiaca passa dal rosa al rosso; una pausa lunga fa collassare il runner, una breve lo mantiene in movimento."],
    study: ["Un corpo, non un foglio di calcolo", "Uno studio visivo", "La figura restituisce un soggetto alla telemetria. I dati restano, ma non fingono piu di essere tutta la storia."],
    build: ["Come si sta costruendo", "Agenti di coding AI, sotto direzione umana.", "L'implementazione e spesso delegata ad agenti di coding AI. Concetto, vincoli, priorita e decisioni restano lavoro umano. Questa divisione fa parte dell'esperimento."],
    state: ["Stato attuale", "Un esperimento vivo.", "Il progetto sta ancora prendendo forma in frammenti pubblici. Questa pagina ne raccoglie il pensiero senza rivendicare un prodotto finito dove ancora non c'e."],
  },
} as const;

function NarrativeSection({ content, id, tone }: { content: readonly [string, string, string]; id: string; tone?: "darkMatter" | "running" }) {
  return <Section tone={tone} className={styles.bordered} aria-labelledby={id}><PageContainer><div className={styles.stack}><SectionLabel>{content[0]}</SectionLabel><DisplayHeading as="h2" id={id} className={styles.sectionHeading}>{content[1]}</DisplayHeading><BodyCopy>{content[2]}</BodyCopy></div></PageContainer></Section>;
}

function RunnerStudy({ text }: { text: readonly [string, string, string] }) {
  return <figure className={styles.study}><figcaption><strong>{text[0]}</strong><span>{text[1]}</span></figcaption><div className={styles.telemetry} aria-hidden="true"><div className={styles.graph}>{Array.from({ length: 10 }, (_, index) => <i key={index} />)}<b /></div><div className={styles.runner}><span className={styles.head} /><span className={styles.torso} /><span className={styles.armOne} /><span className={styles.armTwo} /><span className={styles.legOne} /><span className={styles.legTwo} /></div><div className={styles.scale}><span>easy</span><span>hard</span></div></div><p>{text[2]}</p></figure>;
}

export function RunningProject({ locale }: { locale: Locale }) {
  const text = copy[locale];
  return <><Section className={styles.hero} aria-labelledby="running-heading"><PageContainer><div className={styles.heroStack}><SectionLabel>{text.label}</SectionLabel><DisplayHeading id="running-heading">{text.heading}</DisplayHeading><BodyCopy>{text.intro}</BodyCopy></div></PageContainer></Section><NarrativeSection content={text.problem} id="problem-heading" /><NarrativeSection content={text.restraint} id="restraint-heading" tone="darkMatter" /><Section className={styles.bordered} aria-labelledby="principles-heading"><PageContainer><div className={styles.stack}><SectionLabel>{locale === "it" ? "Principi" : "Principles"}</SectionLabel><DisplayHeading as="h2" id="principles-heading" className={styles.sectionHeading}>{locale === "it" ? "Un sistema dovrebbe assistere senza togliere il runner dal centro." : "A system should assist without taking the runner out of the picture."}</DisplayHeading><ol className={styles.principles}>{text.principles.map((principle, index) => <li key={principle}><span>{String(index + 1).padStart(2, "0")}</span><EditorialHeading>{principle}</EditorialHeading></li>)}</ol></div></PageContainer></Section><Section tone="running" aria-labelledby="object-heading"><PageContainer><div className={styles.stack}><SectionLabel>{text.object[0]}</SectionLabel><DisplayHeading as="h2" id="object-heading" className={styles.sectionHeading}>{text.object[1]}</DisplayHeading><BodyCopy>{text.object[2]}</BodyCopy><RunnerStudy text={text.study} /></div></PageContainer></Section><NarrativeSection content={text.build} id="build-heading" /><NarrativeSection content={text.state} id="state-heading" /></>;
}
