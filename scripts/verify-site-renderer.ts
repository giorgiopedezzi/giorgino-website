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
  const configuredBaseUrl = process.env.SITE_RENDERER_BASE_URL;
  if (configuredBaseUrl) {
    const configuredUrl = new URL(configuredBaseUrl);
    if (configuredUrl.protocol !== "http:" && configuredUrl.protocol !== "https:") throw new Error("SITE_RENDERER_BASE_URL must use HTTP(S)");
    return configuredUrl.origin;
  }
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

    const publicPaths = ["/en", "/it", "/en/contact", "/it/contact", "/en/really-about-me", "/it/really-about-me", "/en/running", "/it/running", "/en/thinking", "/it/thinking", "/en/thinking/dialogues", "/it/thinking/dialogues"];
    for (const path of publicPaths) {
      const response = await fetch(`${baseUrl}${path}`);
      assert.equal(response.status, 200, `${path} must remain publicly renderable`);
    }
    const contactHtml = await (await fetch(`${baseUrl}/en/contact`)).text();
    assert.match(contactHtml, /Confirmed contact details will appear here\./);
    assert.match(contactHtml, /<title>Contact .* Giorgio Pedezzi<\/title>/);
    assert.match(contactHtml, /rel="canonical" href="http:\/\/localhost:\d+\/en\/contact"/);
    assert.match(contactHtml, /hrefLang="it" href="http:\/\/localhost:\d+\/it\/contact"/);
    const homeHtml = await (await fetch(`${baseUrl}/en`)).text();
    assert.match(homeHtml, /href="\/en\/thinking"/);
    assert.match(homeHtml, /href="\/en\/running"/);
    assert.match(homeHtml, /href="\/en\/really-about-me"/);
    assert.doesNotMatch(homeHtml, /Missing Man\./, "Home must not reproduce the personal deep page");
    const aboutHtml = await (await fetch(`${baseUrl}/en/really-about-me`)).text();
    assert.match(aboutHtml, /Experience matters only if it doesn/);
    assert.match(aboutHtml, /Started programming/);
    console.log("Verified localized public routes, homepage deep-page handoffs, personal-content separation, metadata, development preview rendering, and animated GIF preservation.");
  } finally {
    server?.kill();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
