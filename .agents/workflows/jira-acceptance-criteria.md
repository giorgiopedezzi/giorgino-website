# Jira Acceptance Criteria — ADF Integrity

## Storage model

Acceptance Criteria are not a Jira custom field in project `GWR`.

They live inside the Jira issue description as real ADF:
- one `taskList`
- one `taskItem` per criterion
- `attrs.state = "TODO"` or `"DONE"`

Do not search Jira custom-field metadata for an Acceptance Criteria field.

## Creation

Acceptance Criteria, if present, must be real Jira ADF: one `taskList`, one `taskItem` per criterion, initial `attrs.state = "TODO"`.

Never use Markdown `- [ ]`, escaped Markdown checkboxes, or ordinary bullets as a substitute.

If no Acceptance Criteria exist, ask the human for explicit approval to proceed without them. Proceed only after that approval.

Absence of a custom Acceptance Criteria field is not evidence that Acceptance Criteria are missing. Inspect the issue description for ADF task items.

## Implementation

Preserve the complete Jira description as ADF.

Map each AC to its existing `taskItem`. Verify individually. Change only objectively proven items `TODO -> DONE`; leave unproven items TODO.

Do not mark all DONE merely because implementation/global tests finished.

## Connector / tool limitation

Some Jira connector reads may flatten the issue description to text even when Jira itself stores ADF task items.

A flattened connector response is not evidence that the Jira description lacks ADF or Acceptance Criteria.

If the Jira tool cannot safely create or preserve ADF `taskItem`s:
- during creation: STOP rather than degrading the description through Markdown
- during implementation: leave the checklist unchanged and report the limitation in the In Review handoff

Do not replace real Jira ADF with Markdown merely because the connector cannot round-trip it safely.

## Correcting existing Stories

When explicitly fixing previously malformed Acceptance Criteria, preserve criterion wording verbatim, convert to real ADF `taskItem`s, and mark DONE only when implementation evidence supports it.

Jira status alone is not verification.
