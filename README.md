# Fold

A curated collection of skills and configurations for Claude Code and Codex.

## Installation

Install the Fold Claude plugin:

```bash
claude plugin marketplace add roderik/fold
claude plugin install fold@fold
```

Then run setup to install everything else:

```
/fold:setup
```

This handles the full tool chain:

| Category | What gets installed |
|----------|-------------------|
| Homebrew | rtk, jq, ripgrep, fd, ast-grep, shellcheck, shfmt, linear, agent-browser |
| npm | agent-ci, agent-reviews, ctx7, codex-1up |
| Scripts | fff MCP server, Plannotator, cship statusline |
| Config | RTK global config, Context7 (skill mode), Codex (yolo profile), cship (Full Starship Prompt) |
| Plugins | pro-workflow, caveman, plannotator, impeccable, marketing-skills, last30days, codex |
| Settings | agent teams, no-flicker, new init, empty attribution |
| Project | Appends Fold workflow configuration to CLAUDE.md |

After setup, run `/reload-plugins` to activate everything in the current session.

## Codex Support

Fold now includes a separate Codex plugin layout with no shared skill tree:

| Path | Purpose |
|------|---------|
| `.agents/plugins/marketplace.json` | Top-level Codex marketplace metadata |
| `codex/fold/.codex-plugin/plugin.json` | Codex plugin manifest |
| `codex/fold/skills/` | Codex-only Fold skills |

This mirrors the repo-local Codex plugin structure used by existing marketplace plugins: marketplace metadata stays at the repo root, while the Codex plugin implementation lives in its own isolated directory.

### Install In Codex

There are two supported ways to install Fold for Codex.

#### Option 1: Repo-local install

Use this when you want Fold available only inside this repository.

1. Clone the repo somewhere on your machine:

```bash
git clone git@github.com:roderik/fold.git ~/Development/fold
```

2. Enable the plugin in `~/.codex/config.toml`:

```toml
[plugins."fold@fold"]
enabled = true
```

3. Restart Codex or reopen the repository.

Codex will discover the repo-local marketplace at `.agents/plugins/marketplace.json`, which points at `./codex/fold`.

#### Option 2: Computer-wide install

Use this when you want Fold available across projects on your computer.

1. Clone the repo somewhere stable:

```bash
git clone git@github.com:roderik/fold.git ~/Development/fold
```

2. Create the Codex home-local plugin layout:

```bash
mkdir -p ~/.agents/plugins ~/plugins
ln -s ~/Development/fold/codex/fold ~/plugins/fold
```

3. Create or update `~/.agents/plugins/marketplace.json`:

If you already have other local plugins, append the `fold` entry instead of replacing the whole file.

```json
{
  "name": "local",
  "interface": {
    "displayName": "Local Plugins"
  },
  "plugins": [
    {
      "name": "fold",
      "source": {
        "source": "local",
        "path": "./plugins/fold"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Coding"
    }
  ]
}
```

4. Enable the plugin in `~/.codex/config.toml`:

```toml
[plugins."fold@local"]
enabled = true
```

5. Restart Codex.

The home-local layout follows the Codex plugin spec: `~/.agents/plugins/marketplace.json` is the marketplace root, and `./plugins/fold` resolves to `~/plugins/fold`.

### Install The Toolchain

After the plugin is visible in Codex, run the Fold setup flow from a Codex session:

```text
Use $fold-setup to install the Fold Codex toolchain on this machine
```

That installs and configures the Codex-side dependencies such as RTK, Context7, agent-browser, `codex-1up`, and the Fold Codex config conventions.

Current Codex-only Fold skills include:

- `fold`
- `fold-setup`
- `fold-update`
- `fold-doctor`
- `fold-pr`

To sync Codex-portable skills from upstream plugin repos into Fold's Codex plugin tree, run:

```bash
./sync-codex.sh
```

## Commands

| Command | Description |
|---------|-------------|
| `/fold:setup` | Full install — tools, plugins, settings, and project CLAUDE.md |
| `/fold:update` | Update all tools and plugins to their latest versions |
| `/fold:doctor` | Check that everything is installed and report pass/fail |
| `/fold:pr` | Create a well-structured GitHub pull request |

## API Keys

After setup, configure API keys for optional services:

- [exa.ai](https://exa.ai) — 1,000 free searches/month, no credit card required
- [scrapecreators.com](https://scrapecreators.com) — 100 free API calls, no credit card required

```bash
# Add to ~/.config/last30days/.env
EXA_API_KEY=...
SCRAPECREATORS_API_KEY=...
```

## Project CLAUDE.md

`/fold:setup` appends the Fold workflow to the project's CLAUDE.md. Running it again updates changed sections without duplicating content.

Claude prioritizes instructions in the **project's own** CLAUDE.md over plugin instructions. Without these entries, tools like fff, Context7, Codex delegation, and the workflow phases won't activate reliably.
