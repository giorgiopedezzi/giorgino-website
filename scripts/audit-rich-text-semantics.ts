import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

type Finding = { file: string; path: string; semantic: string };

const root = join(process.cwd(), "src", "content");
const findings: Finding[] = [];

function jsonFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? jsonFiles(path) : path.endsWith(".json") ? [path] : [];
  });
}

function inspect(value: unknown, file: string, path = "$") {
  if (Array.isArray(value)) return value.forEach((entry, index) => inspect(entry, file, `${path}[${index}]`));
  if (typeof value !== "object" || value === null) return;
  const record = value as Record<string, unknown>;
  if (record.type === "textStyle" && typeof record.attrs === "object" && record.attrs !== null && "textSize" in record.attrs) findings.push({ file, path, semantic: `legacy textSize ${(record.attrs as Record<string, unknown>).textSize}` });
  if (record.type === "humanAside") findings.push({ file, path, semantic: "legacy inline Human Aside" });
  if (typeof record.presentation === "object" && record.presentation !== null) {
    const presentation = record.presentation as Record<string, unknown>;
    if (presentation.measure !== undefined) findings.push({ file, path: `${path}.presentation.measure`, semantic: `legacy Measure ${presentation.measure}` });
    if (presentation.tone !== undefined) findings.push({ file, path: `${path}.presentation.tone`, semantic: `legacy Tone ${presentation.tone}` });
  }
  for (const [key, entry] of Object.entries(record)) inspect(entry, file, `${path}.${key}`);
}

for (const absolutePath of jsonFiles(root)) {
  const file = relative(process.cwd(), absolutePath).replaceAll("\\", "/");
  inspect(JSON.parse(readFileSync(absolutePath, "utf8")), file);
}

for (const finding of findings) console.log(`${finding.file}:${finding.path}: ${finding.semantic}`);

const schemaFile = "src/content/thinking-keystatic.config.ts";
const schema = readFileSync(schemaFile, "utf8");
const schemaErrors: string[] = [];
schema.split(/\r?\n/).forEach((line, index) => {
  if (line.includes("richText({") && !/\bmode(?:\s*:|\s*[,}])/.test(line)) schemaErrors.push(`${schemaFile}:${index + 1}: rich-text declaration without explicit mode`);
});
if (/capabilities|richTextCapabilities|RichTextCapabilities/.test(schema)) schemaErrors.push(`${schemaFile}: capability/profile layer remains`);

const probes = [
  ["standard-page heading", /heading: richText\(\{ label: "Heading", mode: "inline" \}\)/],
  ["standard-page body", /body: richText\(\{ label: "Body", mode: "copy"/],
  ["Dark Matter narrative", /richText\(\{ label: "Paragraph", mode: "protected-copy"/],
  ["Dark Matter closing thought", /closingThought: richText\(\{[^\n]*mode: "protected-inline"/],
  ["Really About Me opening", /opening: richTextList\("Opening lines", "protected-inline"/],
  ["Missing Man reflection", /reflection: richText\(\{[^\n]*mode: "inline"/],
  ["Missing Man signoff", /signoff: richText\(\{[^\n]*mode: "copy"/],
  ["Contact heading", /const contactSchema = \{[^]*heading: richText\(\{ label: "Heading", mode: "inline"/],
] as const;
for (const [label, pattern] of probes) if (!pattern.test(schema)) schemaErrors.push(`${schemaFile}: declared mode is missing or inconsistent for ${label}`);

if (schemaErrors.length > 0) {
  for (const error of schemaErrors) console.error(error);
  process.exitCode = 1;
} else {
  console.log(`Audit complete: ${findings.length} legacy persisted semantics reported with file and JSON-path context; all schema modes are explicit and renderer probes agree.`);
}
