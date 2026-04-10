---
name: fold-update
description: Update Fold's Codex toolchain and configuration using Codex-native commands, then report real parity gaps versus the Claude workflow.
---

# Fold Update For Codex

Update the Fold toolchain for Codex. Keep the Codex path first-class and do not rerun Claude-only setup steps.

## Phase 1: Update package-managed tools

Upgrade the shared Homebrew toolchain:

```bash
brew upgrade rtk jq ripgrep fd ast-grep shellcheck shfmt linear agent-browser
```

If any package is missing, install it:

```bash
brew install rtk jq ripgrep fd ast-grep shellcheck shfmt schpet/tap/linear agent-browser
```

Update the npm-based tools:

```bash
npm update -g @redwoodjs/agent-ci agent-reviews ctx7 codex-1up
```

## Phase 2: Reapply Codex-native installers

Refresh RTK's Codex integration:

```bash
rtk init -g --codex
```

Refresh FFF:

```bash
curl -L https://dmtrkovalenko.dev/install-fff-mcp.sh | bash
```

Refresh Plannotator:

```bash
curl -fsSL https://plannotator.ai/install.sh | bash
```

Refresh Context7 using the Codex path:

```bash
ctx7 setup --codex --cli -y
```

Update `codex-1up` itself:

```bash
codex-1up update --yes
```

Then reapply Fold's desired Codex configuration:

```bash
codex-1up install --yes --no-vscode --install-node skip --tools skip --codex-cli yes --profiles-scope single --profile yolo --profile-mode add --web-search live --file-opener none --credentials-store auto --alt-screen auto --personality pragmatic --skills skip --agents-md skip
```

Update Agent Browser with its native updater:

```bash
agent-browser upgrade
```

## Phase 3: Verify persisted Codex config

Read `~/.codex/config.toml` and confirm the expected Fold settings still exist:

- root `profile = "yolo"`
- root `personality = "pragmatic"`
- root `file_opener = "none"`
- `profiles.yolo.approval_policy = "never"`
- `profiles.yolo.sandbox_mode = "danger-full-access"`
- `profiles.yolo.web_search = "live"`
- `profiles.yolo.features.multi_agent = true`
- `tui.alternate_screen = "auto"`

If the current repo uses the local Fold plugin, confirm:

```toml
[plugins."fold@fold"]
enabled = true
```

If it is missing, add it or flag the plugin as not enabled.

## Phase 4: Repo-maintainer extras

If the current repository is the Fold repo itself, refresh mirrored Codex skills:

```bash
./sync.sh
```

Only do this inside the Fold repository.

## Phase 5: Report

Report:

- updated tools and versions where visible
- config values refreshed
- MCP servers still present or missing
- parity gaps that remain unsupported

Tell the user to restart Codex or reopen the repo if plugin/config changes were applied.

## Parity Gaps

Keep these explicit:

- `cship` is not a Codex status-line solution.
- Claude marketplace plugin updates do not map directly to Codex in this environment.
- Plannotator plan mode remains unavailable in Codex.
- Claude review-gate behavior does not have a native Codex counterpart here.
