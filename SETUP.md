# Dual-agent starter setup

Unzip at the new repository root.

1. Complete `PROJECT-CONFIG.md`.
2. Replace `__PROJECT_ROOT__` in `.codex/rules/story-git.rules.template`.
3. Rename it to `.codex/rules/story-git.rules`.
4. Trust the project `.codex/` layer and restart Codex after rule changes.
5. Authenticate Atlassian MCP for Codex if needed; configure Claude Atlassian access separately if needed.
6. Add project-specific path rules/docs only after the repository needs them.

Implementation:
- Codex: `$implement-story ABC-123`
- Claude Code: `/implement-story ABC-123`

Refinement:
- Codex: `$generate-user-stories ABC-123`
- Claude Code: `/generate-user-stories ABC-123`

The human moves a Story to `Ready to Develop` and sets Agent/Model/Planned effort. The implementation agent performs the mechanical workflow through local commit and Jira `In Review`, then stops.
