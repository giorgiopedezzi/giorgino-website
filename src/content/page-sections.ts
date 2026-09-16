import type { RichText } from "./rich-text";
import type { EditorialLink, SiteMedia } from "./types";

/**
 * The small, deliberate catalogue of page-level sections available to normal
 * author-managed pages.  This is intentionally separate from EditorialBlock:
 * blocks describe the flow within a body, while these entries describe the
 * structural sections of a page.
 */
export const normalPageSectionTypes = ["editorial", "links"] as const;
export type NormalPageSectionType = (typeof normalPageSectionTypes)[number];

export const normalPageSectionCatalogue: Record<NormalPageSectionType, { label: string; protected: false }> = {
  editorial: { label: "Editorial section", protected: false },
  links: { label: "Curated links", protected: false },
};

export type NormalPageSection =
  | { type: "editorial"; label: string; heading: RichText; body: RichText; media?: SiteMedia }
  | { type: "links"; label: string; heading: RichText; links: EditorialLink[] };

export function isNormalPageSectionType(value: unknown): value is NormalPageSectionType {
  return typeof value === "string" && (normalPageSectionTypes as readonly string[]).includes(value);
}
