import type { ReactNode } from "react";

import { BodyCopy } from "./Editorial";
import styles from "./RichText.module.css";
import { toRichTextDocument, type RichText, type RichTextMark, type TextSize } from "@/content/rich-text";

function markText(text: string, marks: RichTextMark[] | undefined, key: string): ReactNode {
  let result: ReactNode = text;
  for (const mark of marks ?? []) {
    if (mark.type === "bold") result = <strong key={`${key}-bold`}>{result}</strong>;
    if (mark.type === "italic") result = <em key={`${key}-italic`}>{result}</em>;
    if (mark.type === "textStyle" && mark.attrs?.textSize) result = <span className={styles[`size${mark.attrs.textSize[0].toUpperCase()}${mark.attrs.textSize.slice(1)}` as `size${Capitalize<TextSize>}`]} key={`${key}-size`}>{result}</span>;
  }
  return result;
}

export function RichTextCopy({ value, className }: { value: RichText; className?: string }) {
  const document = toRichTextDocument(value);
  return <>{document.content.map((node, index) => node.type === "paragraph" ? <BodyCopy className={className} key={index}>{node.content?.map((child, childIndex) => child.type === "text" ? markText(child.text, child.marks, `${index}-${childIndex}`) : null)}</BodyCopy> : null)}</>;
}
