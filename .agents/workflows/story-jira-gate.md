# Story Jira Gate

## New implementation

A new Story may start only from Jira `Ready to Develop`. That state is the human implementation authorization boundary. The agent never moves a Story into it.

## GWR Jira field contract

For project `GWR`, the following Jira custom-field IDs are authoritative and must be used directly:

- `Model` = `customfield_10220`
- `Agent` = `customfield_10221`
- `Planned thinking effort` = `customfield_10222`
- `Actual thinking effort` = `customfield_10224`

Do not rediscover these fields through Jira issue-type metadata on every Story.

Use issue-type metadata only if:
1. a required field ID is not defined by this workflow, or
2. Jira explicitly rejects one of the configured IDs as invalid.

If Jira connector metadata omits, truncates, or fails to return these fields, treat that as a connector limitation, not as evidence that the fields do not exist.

When reading a Story, prefer a direct issue fetch that explicitly requests the known custom-field IDs (or all issue fields) over metadata-based field discovery.

Acceptance Criteria are not a Jira custom field in this project. Their handling is defined exclusively by `.agents/workflows/jira-acceptance-criteria.md`.

## Required order

1. Read the Jira issue and status.
2. Require `Ready to Develop`.
3. Read and require the configured Jira fields directly:
   - `customfield_10221` — Agent
   - `customfield_10220` — Model
   - `customfield_10222` — Planned thinking effort
4. Validate harness/runtime according to `AGENTS.md`.
5. Check required blockers/dependencies.
6. Establish the dedicated Story branch.
7. Transition Jira to `In Progress`.
8. Only then edit source.

Do not stop or ask the human to populate a required GWR field merely because connector metadata failed to expose it. First read the known field ID directly from the issue.

## Resume

`In Progress` may be resumed only if the human explicitly asked to continue that same Story, the Jira key matches, the dedicated Story branch already exists, branch/working-tree evidence is consistent with the Story, and runtime gates still match. Otherwise STOP.

Never create a new branch from an `In Progress` issue to bypass `Ready to Develop`.
