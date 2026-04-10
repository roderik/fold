---
name: fold-pr
description: Prepare and create a GitHub pull request in Codex using Fold's structured PR format, `gh` CLI, and explicit approval before any push.
---

# Fold PR For Codex

Create a pull request from Codex using Fold's PR structure.

## Rules

- Use `gh` for GitHub operations.
- Ask before any `git push`.
- Keep the PR body short and structured.
- Prefer the sections `Why`, `How`, and `Tests`.

## Workflow

### 1. Gather context

Run these in parallel:

- `git status --short`
- `git log --oneline <base>..HEAD`
- `git diff --stat <base>...HEAD`
- `git rev-parse --abbrev-ref HEAD`
- `git rev-parse --abbrev-ref @{upstream} 2>/dev/null`

Use `main` as the default base branch unless the user specifies another base.

### 2. Handle a dirty worktree

If the worktree is not clean, stop and ask the user whether to commit first or abort PR creation.

Do not push or create a PR until the branch state is intentional.

### 3. Read the diff

Review `git diff <base>...HEAD` and the most important changed files so the PR reflects the actual behavior change, not just the commit messages.

### 4. Draft the PR

Build:

- a short title under 70 characters
- `Why` with 1 to 2 bullets
- `How` with 1 to 3 bullets
- `Tests` with exact commands run and real outcomes

Preferred body format:

```md
## Why
- ...

## How
- ...

## Tests
- `pnpm test`
- Not run
```

### 5. Show the draft

Present the title and body to the user and ask for approval.

Do not push until the user explicitly approves.

### 6. Push and create

After approval:

```bash
git push -u origin HEAD
gh pr create --base <base> --title "<title>" --body "<body>"
```

Use `--draft` only when the user asks for a draft PR.

### 7. Report and next steps

Return the PR URL.

If useful, suggest one of these follow-ups:

- run `!plannotator review`
- run a Codex review
- continue with review resolution

## Failure Handling

- If `gh pr create` would implicitly push, do the explicit `git push` step first so approval remains clear.
- If GitHub auth is missing, stop and tell the user exactly which `gh auth` step is blocking progress.
