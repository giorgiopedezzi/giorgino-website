import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { migrateRichTextTree } from "../src/content/rich-text-migration";

const write = process.argv.includes("--write");
const files = process.argv.slice(2).filter((argument) => argument !== "--write");

if (files.length === 0) {
  console.error("Usage: npm run migrate:rich-text -- [--write] <content.json> [...]");
  process.exitCode = 1;
} else {
  for (const file of files) {
    const path = resolve(file);
    const source = JSON.parse(readFileSync(path, "utf8")) as unknown;
    const report: string[] = [];
    const migrated = migrateRichTextTree(source, file, report);
    for (const entry of report) console.log(entry);
    if (write && report.length > 0) writeFileSync(path, `${JSON.stringify(migrated, null, 2)}\n`, "utf8");
  }
}
