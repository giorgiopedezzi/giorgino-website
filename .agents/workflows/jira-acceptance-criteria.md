# Jira Acceptance Criteria — ADF Integrity

## Creation

Acceptance Criteria,if present, must be real Jira ADF: one `taskList`, one `taskItem` per criterion, initial `attrs.state = "TODO"`. Never use Markdown `- [ ]`, escaped Markdown checkboxes, or ordinary bullets as a substitute. If no Acceptance Criteria exist, ask the human for explicit approval to proceed without them. Proceed only after that approval.

## Implementation

Preserve the complete Jira description as ADF. Map each AC to its existing taskItem. Verify individually. Change only objectively proven items `TODO -> DONE`; leave unproven items TODO. Do not mark all DONE merely because implementation/global tests finished.

## Tool limitation

If the Jira tool cannot safely create/preserve ADF taskItems, do not degrade the description through Markdown. During creation: STOP. During implementation: leave the checklist unchanged and report the limitation in the In Review handoff.

## Correcting existing Stories

When explicitly fixing previously malformed Acceptance Criteria, preserve criterion wording verbatim, convert to real ADF taskItems, and mark DONE only when implementation evidence supports it. Jira status alone is not verification.
