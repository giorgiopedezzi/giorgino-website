import { richText } from "../src/content/rich-text-field";

richText({ label: "Copy", mode: "copy" });
richText({ label: "Inline", mode: "inline" });
richText({ label: "Protected copy", mode: "protected-copy" });
richText({ label: "Protected inline", mode: "protected-inline" });

// @ts-expect-error A renderer mode is mandatory at schema construction time.
richText({ label: "Missing mode" });

// @ts-expect-error Arbitrary renderer profiles are not part of the contract.
richText({ label: "Unknown mode", mode: "custom" });
