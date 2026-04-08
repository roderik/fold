# Fold

A curated collection of skills and configurations for Claude Code.

## Installation

```bash
# Installed packages
brew install rtk
rtk init -g
curl -L https://dmtrkovalenko.dev/install-fff-mcp.sh | bash
curl -fsSL https://plannotator.ai/install.sh | bash
npx ctx7 setup

# Workflow
claude plugin marketplace add rohitg00/pro-workflow
claude plugin install pro-workflow@pro-workflow

# Context protection
claude plugin marketplace add mksglu/context-mode
claude plugin install context-mode@context-mode
claude plugin marketplace add JuliusBrussee/caveman
claude plugin install caveman@caveman

# Planning
claude plugin marketplace add backnotprop/plannotator
claude plugin install plannotator@plannotator

# Design
claude plugin marketplace add pbakaus/impeccable
claude plugin install impeccable@impeccable
claude plugin install frontend-design@claude-plugins-official

# Marketing
claude plugin marketplace add coreyhaines31/marketingskills
claude plugin install marketing-skills

# Research
claude plugin marketplace add mvanhorn/last30days-skill
claude plugin install last30days@last30days-skill

# Second opinion
claude plugin marketplace add openai/codex-plugin-cc
claude plugin install codex@openai-codex

# All the rest
claude plugin marketplace add roderik/fold
claude plugin install fold@fold
```

## Setup

```
/codex:setup --enable-review-gate
/last30days setup
```

Register at exa.ai for 1,000 free searches/month, no credit card required.

```
# Add to ~/.config/last30days/.env
EXA_API_KEY=...
```

Register at scrapecreators.com for 100 free API calls (no credit card required).

```
# Add to ~/.config/last30days/.env
SCRAPECREATORS_API_KEY=...
```

In your project run

```
npx @tanstack/intent@latest install
```

## Project CLAUDE.md Configuration

Run `/fold:setup` in any project to automatically add the Fold workflow configuration to that project's `CLAUDE.md`.

```
/fold:setup
```

This appends the full workflow (Research, Planning, Implementation, Verification, Review, Shipping, File Search, Design, Delegation, Self-Correction, Caveman) to your project's CLAUDE.md. It's idempotent — running it again won't duplicate the config.

### Why this matters

The plugin's CLAUDE.md is loaded automatically, but Claude prioritizes instructions it sees in the **project's own** CLAUDE.md. Without these entries:

- **fff tools won't be preferred** — Claude defaults to its built-in Grep/Glob instead of the frecency-ranked fff MCP tools
- **Context7 won't trigger automatically** — Claude won't proactively look up library docs unless told to
- **Codex delegation won't happen proactively** — Claude will keep trying itself instead of handing off when stuck
- **The workflow phases won't be followed** — Claude won't structure its work into Research → Plan → Implement → Verify → Review → Ship
- **Caveman won't load** — the token-saving context compression won't activate