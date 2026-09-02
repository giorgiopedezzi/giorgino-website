import assert from "node:assert/strict";

import { validateSiteAuthoringUpdate } from "../src/content/thinking-authoring-validation";
import { getAuthoringFoundation, validateAuthoringFoundation } from "../src/content/site-content";
import { getRunningContent, validateRunningContent } from "../src/content/running";

const foundation = getAuthoringFoundation("en");
assert.equal(foundation.title, "Local authoring foundation");
assert.deepEqual(foundation.items.map((item) => item.order), [1]);

const validMedia = { src: "/site-media/animated-proof.gif", alt: "An animated proof", caption: "GIF caption" };
assert.deepEqual(validateAuthoringFoundation({ ...foundation, media: [validMedia] }).media, [validMedia]);
assert.throws(
  () => validateAuthoringFoundation({ ...foundation, media: [{ src: "/site-media/unsupported.svg", alt: "SVG" }] }),
  /JPEG, PNG, WebP, or GIF/,
);
assert.throws(
  () => validateAuthoringFoundation({ ...foundation, link: "javascript:alert(1)" }),
  /internal path or an http\(s\) URL/,
);
assert.throws(
  () => validateAuthoringFoundation({ ...foundation, items: [{ order: 1, label: "One", href: "/en" }, { order: 1, label: "Two", href: "/en" }] }),
  /orders must be unique/,
);
assert.throws(
  () => validateSiteAuthoringUpdate({ additions: [{ path: "src/content/home.ts", contents: "" }], deletions: [] }),
  /outside approved site content and media directories/,
);
assert.throws(
  () => validateSiteAuthoringUpdate({ additions: [{ path: "src/content/site/fr/authoring-foundation.json", contents: "" }], deletions: [] }),
  /outside approved site content and media directories/,
);
assert.throws(
  () => validateSiteAuthoringUpdate({ additions: [{ path: "src/content/site/en/authoring-foundation.json", contents: Buffer.from(JSON.stringify({ ...foundation, title: "" })).toString("base64url") }], deletions: [] }),
  /expected a non-empty string/,
);

const running = getRunningContent("en");
assert.equal(getRunningContent("it").hero.label, "Running / Costruire");
assert.deepEqual(running.principles.items.map((item) => item.order), [1, 2, 3, 4, 5]);
assert.throws(
  () => validateRunningContent({ ...running, liveApp: { ...running.liveApp, href: "javascript:alert(1)" } }),
  /internal path or an http\(s\) URL/,
);
assert.throws(
  () => validateRunningContent({ ...running, object: { ...running.object, media: [{ src: "/site-media/unsupported.svg", alt: "SVG" }] } }),
  /JPEG, PNG, WebP, or GIF/,
);
assert.throws(
  () => validateRunningContent({ ...running, principles: { ...running.principles, items: [{ order: 1, text: "One" }, { order: 1, text: "Two" }] } }),
  /orders must be unique/,
);
assert.throws(
  () => validateSiteAuthoringUpdate({ additions: [{ path: "src/content/site/fr/running.json", contents: "" }], deletions: [] }),
  /outside approved site content and media directories/,
);

console.log("Verified localized authoring content, Running ordering and visibility data, URL and media validation, and approved write paths.");
