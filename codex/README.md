# Codex Support

This directory contains Fold's Codex-specific packaging and skills.

## Layout

- `fold/` - the isolated Codex plugin root
- `fold/.codex-plugin/plugin.json` - Codex plugin manifest
- `fold/skills/` - Codex-only skills for Fold

## Marketplace

Codex marketplace metadata stays at the repository root in:

- `../.agents/plugins/marketplace.json`

That matches the current Codex repo-plugin layout used by existing plugins such as `caveman`: the marketplace file is top-level, while the plugin implementation lives in its own isolated directory.
