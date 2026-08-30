# Story Jira Gate

## New implementation

A new Story may start only from Jira `Ready to Develop`. That state is the human implementation authorization boundary. The agent never moves a Story into it.

## Required order

1. Read the Jira issue and status.
2. Require `Ready to Develop`.
3. Require Jira `Agent`, `Model`, `Planned thinking effort`.
4. Validate harness/runtime according to `AGENTS.md`.
5. Check required blockers/dependencies.
6. Establish the dedicated Story branch.
7. Transition Jira to `In Progress`.
8. Only then edit source.

## Resume

`In Progress` may be resumed only if the human explicitly asked to continue that same Story, the Jira key matches, the dedicated Story branch already exists, branch/working-tree evidence is consistent with the Story, and runtime gates still match. Otherwise STOP.

Never create a new branch from an `In Progress` issue to bypass `Ready to Develop`.
