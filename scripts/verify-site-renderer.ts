import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";

// A two-frame, looping 1×1 GIF. Keeping the fixture generated here makes its binary
// provenance explicit while committing the resulting repository-owned media asset.
const animatedGif = Buffer.from("R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAIfkEAAAAAAAsAAAAAAEAAQAAAgJEAQA7", "base64");
const mediaDirectory = join(process.cwd(), "public", "site-media");
const mediaPath = join(mediaDirectory, "animated-authoring-proof.gif");
mkdirSync(mediaDirectory, { recursive: true });
writeFileSync(mediaPath, animatedGif);

let server: ReturnType<typeof spawn> | undefined;

async function waitForServer(baseUrl: string) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/en/authoring-foundation`);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Timed out waiting for the local Next.js renderer");
}

async function rendererBaseUrl() {
  try {
    const existing = await fetch("http://127.0.0.1:3000/en/authoring-foundation");
    if (existing.ok) return "http://127.0.0.1:3000";
  } catch {
    // No local development server is already running.
  }
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "-p", "3002"], { cwd: process.cwd(), stdio: "ignore" });
  return "http://127.0.0.1:3002";
}

async function main() {
  try {
    const baseUrl = await rendererBaseUrl();
    await waitForServer(baseUrl);
    const page = await fetch(`${baseUrl}/en/authoring-foundation`);
    const pageHtml = await page.text();
    assert.equal(page.status, 200);
    assert.match(pageHtml, /animated-authoring-proof\.gif/);

    const image = await fetch(`${baseUrl}/site-media/animated-authoring-proof.gif`);
    const bytes = Buffer.from(await image.arrayBuffer());
    assert.equal(image.headers.get("content-type"), "image/gif");
    assert.equal(bytes.subarray(0, 6).toString("ascii"), "GIF89a");
    assert.ok(bytes.filter((byte) => byte === 0x2c).length >= 2, "the GIF must retain two image frames");
    console.log("Verified the development renderer emits the authoring preview and preserves the two-frame animated GIF.");
  } finally {
    server?.kill();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
