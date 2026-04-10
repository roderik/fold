# Session Management & Compound Engineering Reference

## Compound Engineering canonical loop

```
ce:brainstorm  →  ce:plan  →  document-review  →  ce:work  →  ce:review  →  git-commit-push-pr  →  ce:compound
```

Artifacts produced: `docs/brainstorms/`, `docs/plans/`, `docs/solutions/` (all protected — see workflow SKILL.md).

## Session & knowledge tools

| Skill | Purpose |
|-------|---------|
| `ce-sessions` | Search and ask questions about past coding agent session history (Claude Code, Codex, Cursor) |
| `ce-slack-research` | Search Slack for organizational context, decisions, constraints, discussion arcs |
| `ce:compound` | Document a recently solved problem as a durable learning in `docs/solutions/` |
| `ce:compound-refresh` | Refresh stale or drifting learnings in `docs/solutions/` against the current codebase |
| `ce-update` | Check if the compound-engineering plugin is up to date; fix stale cache |
| `todo-create` | Create durable todos in the file-based todo system |
| `todo-triage` | Review pending todos for approval and categorization |
| `todo-resolve` | Batch-resolve approved todos (typically after review/triage) |
| `claude-permissions-optimizer` | Reduce permission prompts by promoting safe Bash commands into `settings.json` |

## Research agents (invoke as subagents)

Call via `Agent` with the CE agent identifier, or let a CE skill dispatch them.

| Agent | Purpose |
|-------|---------|
| `learnings-researcher` | Search `docs/solutions/` for prior solutions. **Run first on every task.** |
| `session-historian` | Search Claude Code / Codex / Cursor session history |
| `git-history-analyzer` | Archaeological git history analysis |
| `issue-intelligence-analyst` | Cluster GitHub issues by theme and severity |
| `repo-research-analyst` | Thorough repo structure / conventions research |
| `slack-researcher` | Slack context mining |
| `best-practices-researcher` | External best-practices synthesis |
| `framework-docs-researcher` | Framework / library docs gathering |

## Review agents (invoke directly for narrow audits)

`ce:review` orchestrates the full pipeline. Call individual agents only when you have a focused goal.

**Always-on in `ce:review`:** `correctness-reviewer`, `testing-reviewer`, `maintainability-reviewer`, `project-standards-reviewer`, `agent-native-reviewer`, `learnings-researcher`.

**Conditional:** `security-reviewer`, `performance-reviewer`, `api-contract-reviewer`, `data-migrations-reviewer`, `reliability-reviewer`, `adversarial-reviewer`, `cli-readiness-reviewer`, `cli-agent-readiness-reviewer`, `previous-comments-reviewer`.

**Stack-specific:** `dhh-rails-reviewer`, `kieran-rails-reviewer`, `kieran-python-reviewer`, `kieran-typescript-reviewer`, `julik-frontend-races-reviewer`.

**Data-heavy:** `data-integrity-guardian`, `data-migration-expert`, `schema-drift-detector`, `deployment-verification-agent`.

**Cross-cutting analysis:** `pattern-recognition-specialist`, `performance-oracle`, `security-sentinel`, `architecture-strategist`, `code-simplicity-reviewer`.

## Workflow agents

| Agent | Purpose |
|-------|---------|
| `bug-reproduction-validator` | Reproduce and validate bug reports before writing tests |
| `pr-comment-resolver` | Evaluate and resolve PR review threads, returns structured summaries |
| `spec-flow-analyzer` | Analyze specifications / feature descriptions for user-flow completeness |
| `lint` | Run Ruby / ERB linting checks before pushing |

## Design agents

| Agent | Purpose |
|-------|---------|
| `design-implementation-reviewer` | Visually diff live UI against Figma |
| `figma-design-sync` | Detect and fix visual differences between implementation and Figma |
| `design-iterator` | N-cycle screenshot → analyze → improve loop |

## CE invocation modes

| Mode | When |
|------|------|
| `interactive` (default) | User present, produces prompts and confirmation gates |
| `autofix` | Autonomous — apply only `safe_auto` fixes, no prompts |
| `report-only` | Read-only verification, safe for parallel runs |
| `headless` | Programmatic caller mode, structured JSON output |

## Scheduling

Use `/schedule` to create remote agents that execute on a cron schedule. For one-off remote triggers, use `RemoteTrigger`.
