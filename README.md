# Fold

A curated collection of skills and configurations for Claude Code.

## Installation

Install the Fold plugin:

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
| Scripts | fff MCP server, Plannotator |
| Config | RTK global config, Context7 (skill mode), Codex (yolo profile) |
| Plugins | pro-workflow, context-mode, caveman, plannotator, impeccable, marketing-skills, last30days, codex |
| Settings | agent teams, no-flicker, new init, empty attribution |
| Project | Appends Fold workflow configuration to CLAUDE.md |

After setup, run `/reload-plugins` to activate everything in the current session.

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
