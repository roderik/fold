---
name: fold-doctor
description: Audit a Fold-for-Codex environment, checking CLI tools, Codex config, MCP wiring, plugin enablement, and known parity gaps with clear pass or fail reporting.
---

# Fold Doctor For Codex

Check that Fold's Codex environment is installed and configured correctly. Report pass or fail per item.

## Phase 1: Check CLI tools

Run these in parallel where possible:

| Tool | Check |
|------|-------|
| `rtk` | `which rtk && rtk --version` |
| `jq` | `which jq && jq --version` |
| `rg` | `which rg && rg --version` |
| `fd` | `which fd && fd --version` |
| `ast-grep` | `which ast-grep && ast-grep --version` |
| `shellcheck` | `which shellcheck && shellcheck --version` |
| `shfmt` | `which shfmt && shfmt --version` |
| `linear` | `which linear && linear --version` |
| `agent-browser` | `which agent-browser && agent-browser --version` |
| `agent-ci` | `which agent-ci || npx @redwoodjs/agent-ci --version` |
| `agent-reviews` | `which agent-reviews || npx agent-reviews --version` |
| `ctx7` | `which ctx7 && ctx7 --version` |
| `codex-1up` | `which codex-1up && codex-1up --version` |
| `codex` | `which codex && codex --version` |
| `plannotator` | `which plannotator && plannotator --version` |
| `fff-mcp` | `which fff-mcp` |

Do not check `cship` as a required Codex dependency. It is a Claude-only status-line tool.

## Phase 2: Check Codex config

Read `~/.codex/config.toml` and verify:

### Root settings

- `profile = "yolo"`
- `personality = "pragmatic"`
- `file_opener = "none"`
- `cli_auth_credentials_store = "auto"`
- `mcp_oauth_credentials_store = "auto"`

### Fold profile settings

- `profiles.yolo.approval_policy = "never"`
- `profiles.yolo.sandbox_mode = "danger-full-access"`
- `profiles.yolo.web_search = "live"`
- `profiles.yolo.features.multi_agent = true`

### TUI settings

- `tui.alternate_screen = "auto"`

## Phase 3: Check MCP and plugin wiring

Run:

```bash
codex mcp list
```

Check whether `fff` is configured.

If the current repository contains both:

- `.agents/plugins/marketplace.json`
- `codex/fold/.codex-plugin/plugin.json`

then also check whether `~/.codex/config.toml` contains:

```toml
[plugins."fold@fold"]
enabled = true
```

If you cannot confirm plugin enablement, report that explicitly instead of inferring success.

## Phase 4: Check project guidance

For Codex, inspect project `AGENTS.md`, not `CLAUDE.md`.

Report whether the project contains Fold guidance covering:

- `RESEARCH -> PLAN -> IMPLEMENT -> VERIFY -> REVIEW -> SHIP`
- Fold Codex skills for setup, update, doctor, or PR

## Phase 5: Report

Use this structure:

```md
## Fold Doctor Report

### CLI Tools
- [x] codex (v...)
- [ ] plannotator - not found

### Codex Config
- [x] profile = yolo
- [ ] plugins."fold@fold" - not enabled

### MCP
- [x] fff configured
- [ ] another required server missing

### Project
- [x] AGENTS.md contains Fold guidance
- [ ] AGENTS.md missing Fold workflow block

### Parity Gaps
- [!] cship intentionally unsupported in Codex
- [!] Plannotator plan mode unavailable in Codex
```

If anything fails, suggest `fold-setup` or `fold-update` as the next step.
