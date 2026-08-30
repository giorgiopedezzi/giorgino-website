# Project configuration

Complete once for this repository.

## Repository

- Project name: `<PROJECT_NAME>`
- Absolute repo root: `<PROJECT_ROOT>`

Replace `__PROJECT_ROOT__` in `.codex/rules/story-git.rules.template`, then rename it to `story-git.rules` and restart Codex. Project-local `.codex/rules` must be trusted to load.

## Jira

- Project key: `<PROJECT_KEY>`

Confirm/update these workflow states: Backlog, Refinement (if used), Ready to Develop, In Progress, In Review, Done.

Confirm field equivalents: Agent, Model, Planned thinking effort, Actual thinking effort, Review Outcome, Category (optional). Human-owned: Agent/Model/Planned/Review Outcome. Agent-written: Actual thinking effort.

Optional refinement labels: `ai-prompt`, `ai-refined`. Use only if this Jira project uses them.

## Git

Default branch: `feature/<JIRA-KEY>-<story-summary-slug>`

Default commit: `<JIRA-KEY>: <Story summary>`

Change only if the repository already has a stronger convention.

## Project-specific rules

Add stack/architecture/path-specific rules separately. Do not copy Garmin, Framer, Azure, React, FIT, or other project-specific rules unless they genuinely apply.
