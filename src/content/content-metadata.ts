import { extname } from "node:path";

export type ContentMetadata = {
  title: string;
  description: string;
  socialTitle?: string;
  socialDescription?: string;
  socialImage?: string;
};

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function fail(path: string, message: string): never {
  throw new Error(`Metadata validation failed at ${path}: ${message}`);
}

function text(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim() === "") fail(path, "expected a non-empty string");
  return value;
}

function optionalText(value: unknown, path: string) {
  if (value === undefined || value === null || value === "") return undefined;
  return text(value, path);
}

export function validateContentMetadata(value: unknown, path: string): ContentMetadata {
  if (typeof value !== "object" || value === null || Array.isArray(value)) fail(path, "expected an object");
  const source = value as Record<string, unknown>;
  const result: ContentMetadata = {
    title: text(source.title, `${path}.title`),
    description: text(source.description, `${path}.description`),
  };
  const socialTitle = optionalText(source.socialTitle, `${path}.socialTitle`);
  const socialDescription = optionalText(source.socialDescription, `${path}.socialDescription`);
  const socialImage = optionalText(source.socialImage, `${path}.socialImage`);
  if (socialImage && (!socialImage.startsWith("/site-media/") || !imageExtensions.has(extname(socialImage).toLowerCase()))) {
    fail(`${path}.socialImage`, "must reference a repository-owned JPEG, PNG, WebP, or GIF asset");
  }
  if (socialTitle) result.socialTitle = socialTitle;
  if (socialDescription) result.socialDescription = socialDescription;
  if (socialImage) result.socialImage = socialImage;
  return result;
}
