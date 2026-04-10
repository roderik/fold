---
name: fold-setup
description: Set up Fold for Codex with a production-grade local toolchain, Codex-native MCP wiring, project AGENTS.md guidance, and explicit parity gaps versus the Claude workflow.
---

# Fold Setup For Codex

Set up the Fold toolchain for Codex. Prefer Codex-native integration points over Claude-specific ones.

## Goals

- Install the shared CLI toolchain used by Fold.
- Configure Codex-specific integrations instead of Claude-only hooks.
- Add or update project-level `AGENTS.md` guidance instead of `CLAUDE.md`.
- Call out unsupported parity items explicitly instead of silently skipping them.

## Phase 1: Install CLI tools

Use the same package set as Fold's Claude workflow:

```bash
brew install rtk jq ripgrep fd ast-grep shellcheck shfmt schpet/tap/linear agent-browser
npm install -g @redwoodjs/agent-ci agent-reviews ctx7 codex-1up
```

If a tool is already installed, continue.

## Phase 2: Configure Codex-native tools

### RTK

Initialize RTK for Codex instead of Claude:

```bash
rtk init -g --codex
```

### FFF MCP

Install the MCP binary:

```bash
curl -L https://dmtrkovalenko.dev/install-fff-mcp.sh | bash
```

Then add it to Codex if it is not already configured:

```bash
codex mcp add fff -- fff-mcp
```

### Context7

Use the Codex setup path, not the Claude one:

```bash
ctx7 setup --codex --cli -y
```

### Codex 1UP

Reapply Fold's Codex profile choices explicitly:

```bash
codex-1up install --yes --no-vscode --install-node skip --tools skip --codex-cli yes --profiles-scope single --profile yolo --profile-mode add --web-search live --file-opener none --credentials-store auto --alt-screen auto --personality pragmatic --skills skip --agents-md skip
```

### Agent Browser

Install browser binaries after the CLI is present:

```bash
agent-browser install
```

### Plannotator

Install the `plannotator` binary:

```bash
curl -fsSL https://plannotator.ai/install.sh | bash
```

For Codex usage, the supported commands are:

```bash
!plannotator review
!plannotator annotate path/to/file.md
!plannotator last
```

## Phase 3: Configure Codex

Inspect `~/.codex/config.toml` and ensure the expected Fold profile settings exist.

Expected root settings:

- `profile = "yolo"`
- `file_opener = "none"`
- `cli_auth_credentials_store = "auto"`
- `mcp_oauth_credentials_store = "auto"`
- `personality = "pragmatic"`

Expected `profiles.yolo` settings:

- `approval_policy = "never"`
- `sandbox_mode = "danger-full-access"`
- `web_search = "live"`

Expected `profiles.yolo.features` settings:

- `multi_agent = true`

Expected `tui` settings:

- `alternate_screen = "auto"`

If the current repository should enable the local Fold plugin and no Codex UI flow is available, add this config entry:

```toml
[plugins."fold@fold"]
enabled = true
```

Use this only when the repo exposes `.agents/plugins/marketplace.json` and `codex/fold/.codex-plugin/plugin.json`.

## Phase 4: Add project guidance

Codex uses `AGENTS.md`, not `CLAUDE.md`.

If the current project has no `AGENTS.md`, create one. If it already exists, append or update a small Fold-managed section without overwriting unrelated content.

The managed section should state:

- Fold workflow is `RESEARCH -> PLAN -> IMPLEMENT -> VERIFY -> REVIEW -> SHIP`.
- Fold Codex skills are preferred for setup, update, doctor, and PR flows.
- Shared repo instructions remain authoritative over plugin guidance.

## Phase 5: Report

Summarize:

- what installed successfully
- what was configured in `~/.codex/config.toml`
- whether `AGENTS.md` was added or updated
- which parity gaps remain

Then tell the user to restart Codex or reopen the repository so plugin and config changes are reloaded.

## Parity Gaps

Flag these explicitly when reporting:

- `cship` is Claude-only. Its installer wires `~/.claude/settings.json`, while Codex uses built-in `tui.status_line` config.
- Claude marketplace plugins from Fold's original setup do not have a generic Codex install flow in this environment.
- Plannotator supports code review and annotation in Codex, but not plan mode.
- Claude's `/codex:setup --enable-review-gate` has no native Codex equivalent here.
