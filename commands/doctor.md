---
description: Check that all Fold dependencies are installed and working correctly
allowed-tools: Bash, AskUserQuestion
---

# Fold Doctor

Check that all tools, plugins, and configuration required by Fold are installed and working correctly. Report a checklist of pass/fail results.

## Steps

### Phase 1: Check CLI tools

For each tool below, run `which <tool>` (or the noted command) to verify it's installed. Record pass/fail for each.

| Tool | Check command |
|------|--------------|
| rtk | `which rtk && rtk --version` |
| jq | `which jq && jq --version` |
| ripgrep | `which rg && rg --version` |
| fd | `which fd && fd --version` |
| ast-grep | `which ast-grep && ast-grep --version` |
| shellcheck | `which shellcheck && shellcheck --version` |
| shfmt | `which shfmt && shfmt --version` |
| linear | `which linear && linear --version` |
| agent-browser | `which agent-browser && agent-browser --version` |
| agent-ci | `which agent-ci || npx @redwoodjs/agent-ci --version` |
| agent-reviews | `which agent-reviews || npx agent-reviews --version` |
| ctx7 | `which ctx7 && ctx7 --version` |
| codex-1up | `which codex-1up && codex-1up --version` |
| codex | `which codex && codex --version` |
| cship | `which cship && cship --version` |

Run all check commands in parallel where possible.

### Phase 2: Check Claude Code plugins

Run `claude plugin list` and verify these plugins are installed:

- pro-workflow
- caveman
- plannotator
- impeccable
- marketing-skills
- last30days
- codex
- fold

### Phase 3: Check settings

Read `~/.claude/settings.json` and verify these keys are set:

- `env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` = `"1"`
- `env.CLAUDE_CODE_NO_FLICKER` = `"1"`
- `env.CLAUDE_CODE_NEW_INIT` = `"1"`
- `attribution.commit` = `""`
- `attribution.pr` = `""`
- `statusLine.type` = `"command"` and `statusLine.command` = `"cship"`

### Phase 4: Check project CLAUDE.md

Check if the current project's `CLAUDE.md` contains Fold configuration by looking for `RESEARCH  →  PLAN  →  IMPLEMENT  →  VERIFY  →  REVIEW  →  SHIP`.

### Phase 5: Report

Present results as a checklist:

```
## Fold Doctor Report

### CLI Tools
- [x] rtk (v1.2.3)
- [x] jq (v1.7)
- [ ] linear — not found (run `/fold:setup` to install)
...

### Plugins
- [x] pro-workflow
- [ ] caveman — not installed
...

### Settings
- [x] CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS
- [ ] CLAUDE_CODE_NO_FLICKER — missing
...

### Project
- [x] CLAUDE.md has Fold configuration
```

If anything failed, suggest running `/fold:setup` to fix missing items or `/fold:update` to update outdated tools.
