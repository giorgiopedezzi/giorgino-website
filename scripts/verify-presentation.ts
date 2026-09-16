import assert from "node:assert/strict";

import { resolvePresentation, validatePresentationOverrides } from "../src/content/presentation";

assert.deepEqual(resolvePresentation(), { scale: "medium", measure: "wide", tone: "strong" });
assert.deepEqual(
  resolvePresentation({ scale: "small", measure: "narrow", tone: "quiet" }, { scale: "large" }),
  { scale: "large", measure: "narrow", tone: "quiet" },
);
assert.deepEqual(resolvePresentation({ scale: "small" }, {}), { scale: "small", measure: "wide", tone: "strong" });
assert.deepEqual(validatePresentationOverrides({ scale: "medium", measure: "wide", tone: "quiet" }), { scale: "medium", measure: "wide", tone: "quiet" });
assert.equal(validatePresentationOverrides(undefined, "content.presentation"), undefined);
assert.throws(() => validatePresentationOverrides({ scale: "43px" }, "content.presentation"), /supported semantic value/);
assert.throws(() => validatePresentationOverrides({ width: "720px" }, "content.presentation"), /unsupported presentation property/);

console.log("Verified semantic presentation resolution and reset-to-inheritance behavior.");
