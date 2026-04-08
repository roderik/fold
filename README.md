# Fold

A curated collection of skills and configurations for Claude Code.

## Installation

First install the Fold plugin itself:

```bash
claude plugin marketplace add roderik/fold
claude plugin install fold@fold
```

Then run the setup command to install all dependencies, plugins, and configuration:

```
/fold:setup
```

This installs:
- **CLI tools** via Homebrew: rtk, jq, ripgrep, fd, ast-grep, shellcheck, shfmt, linear, agent-browser
- **npm packages**: agent-ci, agent-reviews
- **Installer scripts**: fff MCP, Plannotator, Context7, Codex companion
- **Claude Code plugins**: pro-workflow, context-mode, caveman, plannotator, impeccable, marketing-skills, last30days, codex
- **Settings**: agent teams, no-flicker, new init, empty attribution
- **Project CLAUDE.md**: appends the Fold workflow configuration

## Commands

| Command | Description |
|---------|-------------|
| `/fold:setup` | Full install — tools, plugins, settings, and project CLAUDE.md |
| `/fold:update` | Update all tools and plugins to latest versions |
| `/fold:doctor` | Check that everything is installed and working |
| `/fold:pr` | Create a well-structured GitHub pull request |

## API Keys

After setup, you'll need to configure API keys for some services:

Register at exa.ai for 1,000 free searches/month (no credit card required).
Register at scrapecreators.com for 100 free API calls (no credit card required).

```bash
# Add to ~/.config/last30days/.env
EXA_API_KEY=...
SCRAPECREATORS_API_KEY=...
```

## Project CLAUDE.md Configuration

`/fold:setup` automatically configures the project's CLAUDE.md. Running it again updates any changed sections without duplicating content.

### Why this matters

The plugin's CLAUDE.md is loaded automatically, but Claude prioritizes instructions it sees in the **project's own** CLAUDE.md. Without these entries:

- **fff tools won't be preferred** — Claude defaults to its built-in Grep/Glob instead of the frecency-ranked fff MCP tools
- **Context7 won't trigger automatically** — Claude won't proactively look up library docs unless told to
- **Codex delegation won't happen proactively** — Claude will keep trying itself instead of handing off when stuck
- **The workflow phases won't be followed** — Claude won't structure its work into Research → Plan → Implement → Verify → Review → Ship
- **Caveman won't load** — the token-saving context compression won't activate
