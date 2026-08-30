---
name: implement-story
description: Implement exactly one Jira Story under the shared human-gated workflow.
---

# Implement Story

Input: one Jira Story key. Read `AGENTS.md`, then follow in order:

1. `.agents/workflows/story-jira-gate.md`
2. `.agents/workflows/jira-acceptance-criteria.md`
3. `.agents/workflows/story-git-lifecycle.md`

One Story only. Start a new implementation only from `Ready to Develop`. Match Jira Agent/Model/Planned effort. Establish the Story branch before editing. Implement only approved scope. Verify AC individually. Preserve ADF. Stage explicit Story files, inspect staged diff, commit locally, message must start with JIRA issue id (example: HRA-1), record hash, write Actual effort, transition to In Review, comment branch+commit+verification, STOP. Never push or move to Done unless separately requested.
