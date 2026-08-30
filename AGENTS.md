# Shared Agent Governance

This file is the shared source of truth for Claude Code and Codex. Keep it rules-only.

## Supported harnesses

- Claude Code
- Codex

Jira `Agent` selects the human-approved harness. If the active harness does not match Jira `Agent`, STOP.

## Human gates

Human approval should be sparse and consequential. Do not ask for confirmation for safe inspection, verification, or mechanical actions already authorized by a higher-level gate.

Human-owned fields/decisions include `Agent`, `Model`, `Planned thinking effort`, `Review Outcome`, moving a Story into `Ready to Develop`, accepting review, moving to Done, destructive Git/history actions, and external publish/deploy unless explicitly delegated. Never write those human-owned fields.

`Actual thinking effort` is agent-written at implementation handoff.

## Story entry gate

A **new Story implementation may start only from Jira status exactly `Ready to Develop`**.

- Backlog / BACKLOG -> STOP
- Refinement / REFINEMENT -> STOP
- Ready to Develop -> continue with remaining gates
- In Progress -> explicit resume only
- In Review -> STOP
- Done -> STOP
- any other status -> STOP unless this repository explicitly defines it as an entry state

The agent must never transition a Story into `Ready to Develop`. Read `.agents/workflows/story-jira-gate.md`.

## Runtime gate

Before implementation, Jira must provide human-owned `Agent`, `Model`, and `Planned thinking effort`. A known runtime mismatch is a STOP. Static `.codex/config.toml` values are defaults only and do not prove the active runtime when CLI/UI overrides may apply. Inability to introspect is not itself a mismatch. Never rewrite Jira to match the running session.

## Scope

One Story per invocation. Implement only the approved slice. No adjacent cleanup, opportunistic redesign, or silent re-scoping. Material scope expansion -> STOP.

## Jira Acceptance Criteria

Acceptance Criteria are real Jira ADF `taskList` / `taskItem` nodes, never Markdown `- [ ]`. Read `.agents/workflows/jira-acceptance-criteria.md`. Preserve the full ADF description; mark only objectively verified items `TODO -> DONE`. If tooling cannot preserve ADF safely, do not degrade it through Markdown.

## Story Git lifecycle

Every Story reaching `In Review` must have a dedicated Story branch and verified local Story commit. The review comment must include branch + commit hash. Read `.agents/workflows/story-git-lifecycle.md`. Push is never implied.

## Safe Git inspection

Read-only Git inspection is always authorized: `status`, `diff`, `diff --cached`, `log`, `show`, `branch --show-current`, `rev-parse`, `ls-files`, `remote -v`. Prefer `git -C <root> ...`.

Within an approved Story, branch creation/switch for the Story, explicit staging, and local commit are mechanical and may proceed without repeated human confirmation.

Never imply authorization for push, pull, fetch, merge, rebase, reset, clean, force/history rewrite, deleting branches, or discarding pre-existing human changes.

## Editing safety

Never mutate tracked source using brittle line-number shell edits (`sed -i X,Y`, line-number `awk`, equivalents). Use content-aware edit/patch mechanisms.

## Jira implementation handoff

The implementation agent may mechanically transition `Ready to Develop -> In Progress`, update verified AC taskItems, write `Actual thinking effort`, transition to `In Review`, and add the review comment. STOP at `In Review`. Never set `Review Outcome` or move to Done.

## Effort ladder

`low < medium < high < xhigh < max`

- low: bounded implementation + focused verification
- medium: plan + immediate callers + normal suite/typecheck/lint/build as applicable
- high: alternatives + broader impact exploration + manual/domain verification where useful
- xhigh: explicit coverage enumeration + adversarial boundary checks
- max: falsifiable hypothesis + independent verification + reproducible evidence

Do not silently map an unavailable requested effort downward.

## Prompt refinement

For requirement refinement / Story generation read `.agents/workflows/refine-prompt.md`. Analyze and propose before Jira writes. Creation happens only after explicit human approval of the decomposition. Generated Stories must not have human-owned implementation gate fields populated by the refinement agent.

## Routing

| Concern | Source of truth |
|---|---|
| Story Jira gate | `.agents/workflows/story-jira-gate.md` |
| Story Git lifecycle | `.agents/workflows/story-git-lifecycle.md` |
| Jira ADF Acceptance Criteria | `.agents/workflows/jira-acceptance-criteria.md` |
| Prompt refinement | `.agents/workflows/refine-prompt.md` |
| Codex implementation adapter | `.agents/skills/implement-story/SKILL.md` |
| Codex refinement adapter | `.agents/skills/generate-user-stories/SKILL.md` |

## Core principle

**Inspect freely. Execute mechanically inside an already-approved scope. Stop at real human decision boundaries.**

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
For this repository, Git commits must use the repository-local identity:

## Safe op
For known-safe routine local operations and future Codex permission-rule tuning, see `.agents/codex-safe-local-operations.md`.

user.name = Giorgio Pedezzi
user.email = giorgio.pedezzi.hqsolutions@gmail.com

Before committing, verify the repository-local Git identity. Do not modify the global Git identity

