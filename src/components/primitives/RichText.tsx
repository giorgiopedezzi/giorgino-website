import type { ReactNode } from "react";

import { BodyCopy } from "./Editorial";
import styles from "./RichText.module.css";
import { richTextPresentation, toRichTextDocument, type BlockRole, type RichText, type RichTextMark, type TextSize } from "@/content/rich-text";
import type { PresentationOverrides } from "@/content/presentation";

function markText(text: string, marks: RichTextMark[] | undefined, key: string): ReactNode {
  let result: ReactNode = text;
  for (const mark of marks ?? []) {
    if (mark.type === "bold") result = <strong key={`${key}-bold`}>{result}</strong>;
    if (mark.type === "italic") result = <em key={`${key}-italic`}>{result}</em>;
    if (mark.type === "underline") result = <u key={`${key}-underline`}>{result}</u>;
    if (mark.type === "strike") result = <s key={`${key}-strike`}>{result}</s>;
    if (mark.type === "textStyle" && mark.attrs?.textSize) result = <span className={styles[`size${mark.attrs.textSize[0].toUpperCase()}${mark.attrs.textSize.slice(1)}` as `size${Capitalize<TextSize>}`]} key={`${key}-size`}>{result}</span>;
    if (mark.type === "interruption") result = <span className={styles.interruption} key={`${key}-interruption`}>{result}</span>;
    if (mark.type === "humanAside") result = <span className={styles.inlineHumanAside} key={`${key}-human-aside`}>{result}</span>;
  }
  return result;
}

function ParagraphBlock({ role, className, presentation, children }: { role: BlockRole | null | undefined; className?: string; presentation?: boolean; children: ReactNode }) {
  if (role === "humanAside") return <p className={[styles.humanAside, className].filter(Boolean).join(" ")}>{children}</p>;
  if (role === "editorialLead") return <p className={[styles.editorialLead, className].filter(Boolean).join(" ")}>{children}</p>;
  return <BodyCopy className={[presentation ? styles.presentationBody : undefined, className].filter(Boolean).join(" ")}>{children}</BodyCopy>;
}

function presentationClass(value: RichText, sectionDefaults?: PresentationOverrides) {
  const override = richTextPresentation(value);
  if (!override && !sectionDefaults) return undefined;
  const composed = { ...sectionDefaults, ...override };
  const classes = [styles.presentation];
  if (composed.scale) classes.push(styles[`presentationScale${composed.scale[0].toUpperCase()}${composed.scale.slice(1)}` as "presentationScaleSmall"]);
  if (composed.measure) classes.push(styles[`presentationMeasure${composed.measure[0].toUpperCase()}${composed.measure.slice(1)}` as "presentationMeasureNarrow"]);
  if (composed.tone) classes.push(styles[`presentationTone${composed.tone[0].toUpperCase()}${composed.tone.slice(1)}` as "presentationToneQuiet"]);
  return classes.join(" ");
}

export function RichTextCopy({ value, className, sectionDefaults }: { value: RichText; className?: string; sectionDefaults?: PresentationOverrides }) {
  const document = toRichTextDocument(value);
  const presentation = presentationClass(value, sectionDefaults);
  const content = document.content.map((node, index) => node.type === "paragraph" ? <ParagraphBlock role={node.attrs?.role} className={className} presentation={Boolean(presentation)} key={index}>{node.content?.map((child, childIndex) => child.type === "text" ? markText(child.text, child.marks, `${index}-${childIndex}`) : null)}</ParagraphBlock> : null);
  return presentation ? <div className={presentation}>{content}</div> : <>{content}</>;
}

export function RichTextInline({ value, sectionDefaults }: { value: RichText; sectionDefaults?: PresentationOverrides }) {
  const document = toRichTextDocument(value);
  const content = document.content.flatMap((node, index) => node.type === "paragraph" ? (node.content ?? []).map((child, childIndex) => child.type === "text" ? markText(child.text, child.marks, `${index}-${childIndex}`) : null) : []);
  const presentation = presentationClass(value, sectionDefaults);
  return presentation ? <span className={[styles.inline, presentation].join(" ")}>{content}</span> : <>{content}</>;
}
