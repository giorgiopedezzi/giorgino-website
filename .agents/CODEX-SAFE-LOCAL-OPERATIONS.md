# CODEX SAFE LOCAL OPERATIONS — Personal Website

**Project:** `C:/Projects/PERSONAL/giorgino-website`  
**Purpose:** collect routine local operations that have already been observed as safe and expected during the Jira Story workflow, so Codex permission rules can later be refined to avoid unnecessary approval prompts.

## Confirmed safe operations observed during GWR-4

### Stage an explicit, verified Story file

```powershell
git -C C:/Projects/PERSONAL/giorgino-website add -- src/components/home/HomePage.module.css
```

Context:
- local operation only
- explicit file path
- file already verified as part of the active Story
- no remote side effect
- no broad staging such as `git add .`

### Create the required local Story commit

```powershell
git -C C:/Projects/PERSONAL/giorgino-website commit -m "GWR-4: Responsive / Mobile Fidelity"
```

Context:
- local operation only
- staged diff already inspected/verified
- commit belongs to the active Jira Story
- no push
- no remote side effect

## Permission-rule intent

Candidate operations for reduced approval friction:
- `git status`
- `git branch --show-current`
- `git diff`
- `git diff --staged`
- explicit Story-scoped `git add -- <file-or-files>`
- local `git commit -m "<Story key>: <Story title>"` after required verification

Keep approval / safeguards for:
- `git push`
- force push
- remote mutations
- destructive resets
- `git clean`
- branch deletion
- broad/unscoped staging such as `git add .` unless explicitly justified
- commands that modify files outside the active Story scope
- commands that bypass Jira or `implement-story`
- privilege elevation / Administrator execution

## Environment note

Previous Codex workspace startup issues were related to Windows/Git ownership and Git safe-directory handling.

Repository owner should remain the normal Windows user.

Codex should run normally, not permanently as Administrator.

If Git reports dubious ownership for the Codex sandbox identity, configure the specific repository as a Git `safe.directory` rather than weakening Git safety globally.
