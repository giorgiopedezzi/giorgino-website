import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import styles from "./Editorial.module.css";

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className={styles.pageContainer}>{children}</div>;
}

type SectionProps = ComponentPropsWithoutRef<"section"> & {
  tone?: "default" | "darkMatter" | "running" | "dark";
};

export function Section({ className, tone = "default", ...props }: SectionProps) {
  const toneClass = styles[`tone${tone[0].toUpperCase()}${tone.slice(1)}`];
  return <section className={[styles.section, toneClass, className].filter(Boolean).join(" ")} {...props} />;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className={styles.sectionLabel}>{children}</p>;
}

type HeadingProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

export function DisplayHeading<T extends ElementType = "h1">({
  as,
  children,
  className,
  ...props
}: HeadingProps<T>) {
  const Tag = as ?? "h1";
  return <Tag className={[styles.displayHeading, className].filter(Boolean).join(" ")} {...props}>{children}</Tag>;
}

export function BodyCopy({ className, ...props }: ComponentPropsWithoutRef<"p">) {
  return <p className={[styles.bodyCopy, className].filter(Boolean).join(" ")} {...props} />;
}

export function EditorialHeading<T extends ElementType = "h3">({
  as,
  children,
  className,
  ...props
}: HeadingProps<T>) {
  const Tag = as ?? "h3";
  return <Tag className={[styles.editorialHeading, className].filter(Boolean).join(" ")} {...props}>{children}</Tag>;
}

export function NextLink({ children = "Next?" }: { children?: ReactNode }) {
  return <span className={styles.nextLink}>{children}</span>;
}
