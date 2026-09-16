/**
 * Semantic editorial presentation choices. These values are intentionally
 * independent of CSS so persisted content can survive design-token changes.
 */
export type PresentationScale = "small" | "medium" | "large";
export type PresentationMeasure = "narrow" | "wide";
export type PresentationTone = "quiet" | "strong";

export type PresentationOverrides = {
  scale?: PresentationScale;
  measure?: PresentationMeasure;
  tone?: PresentationTone;
};

export type ResolvedPresentation = Required<PresentationOverrides>;

const designSystemDefaults: ResolvedPresentation = {
  scale: "medium",
  measure: "wide",
  tone: "strong",
};

const values = {
  scale: new Set<PresentationScale>(["small", "medium", "large"]),
  measure: new Set<PresentationMeasure>(["narrow", "wide"]),
  tone: new Set<PresentationTone>(["quiet", "strong"]),
};

/**
 * Resolves presentation in the only allowed direction:
 * design-system default -> section default -> persisted content override.
 * Omitting a property intentionally preserves inheritance.
 */
export function resolvePresentation(
  sectionDefaults: PresentationOverrides = {},
  contentOverrides: PresentationOverrides = {},
): ResolvedPresentation {
  return {
    scale: contentOverrides.scale ?? sectionDefaults.scale ?? designSystemDefaults.scale,
    measure: contentOverrides.measure ?? sectionDefaults.measure ?? designSystemDefaults.measure,
    tone: contentOverrides.tone ?? sectionDefaults.tone ?? designSystemDefaults.tone,
  };
}

/** Validates persisted semantic choices without accepting CSS implementation values. */
export function validatePresentationOverrides(value: unknown, path = "presentation"): PresentationOverrides | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "object" || Array.isArray(value)) throw new Error(`Presentation validation failed at ${path}: expected an object`);
  const source = value as Record<string, unknown>;
  const result: PresentationOverrides = {};
  for (const key of ["scale", "measure", "tone"] as const) {
    const candidate = source[key];
    if (candidate === undefined || candidate === null) continue;
    if (typeof candidate !== "string" || !values[key].has(candidate as never)) {
      throw new Error(`Presentation validation failed at ${path}.${key}: expected a supported semantic value`);
    }
    result[key] = candidate as never;
  }
  for (const key of Object.keys(source)) {
    if (!(key in values)) throw new Error(`Presentation validation failed at ${path}.${key}: unsupported presentation property`);
  }
  return result;
}
