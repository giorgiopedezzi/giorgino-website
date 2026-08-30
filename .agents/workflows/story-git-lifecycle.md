# Story Git Lifecycle

## Default naming

Branch: `feature/<JIRA-KEY>-<story-summary-slug>`

Commit: `<JIRA-KEY>: <Story summary>`

Use a repository-specific convention if one is explicitly documented.

## Before source editing

After Jira/runtime gates pass:

1. inspect `git status --short` and `git branch --show-current`;
2. if working-tree changes are not confidently attributable to this Story, do not stash/discard/absorb them: STOP;
3. if already on the correct Story branch, continue; otherwise create it from the currently checked-out clean base branch;
4. do not automatically fetch/pull/rebase/merge/change base;
5. for a new Story, transition Jira to `In Progress` after the branch exists.

## Final handoff

`implement -> verify AC individually -> update verified Jira taskItems -> explicit git add -- <Story files> -> inspect git diff --cached -> commit -> rev-parse HEAD -> Actual thinking effort -> In Review -> review comment -> STOP`

Never use `git add .` or `git add -A`.

The review comment includes branch, commit hash, summary, verification, any AC left TODO, and material caveats.

Story implementation does not authorize push/pull/fetch/merge/rebase/reset/clean/force/history rewrite/branch deletion/discarding pre-existing human changes.
