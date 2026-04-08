---
description: Install all Fold dependencies and configure the current project's CLAUDE.md
allowed-tools: Read, Edit, Write, Glob, Bash, AskUserQuestion, Skill
---

# Fold Setup

Install all required tools, plugins, and configuration for Fold. Then add or update the Fold workflow configuration in this project's CLAUDE.md file.

## Steps

### Phase 1: Install tools

Run each command separately using Bash. If a tool is already installed, that's fine — continue with the next command. Report any failures at the end but don't stop.

**Homebrew packages:**
```bash
brew install rtk jq ripgrep fd ast-grep shellcheck shfmt schpet/tap/linear agent-browser
```

**npm global packages:**
```bash
npm install -g @redwoodjs/agent-ci agent-reviews ctx7 codex-1up
```

**RTK global config:**
```bash
rtk init -g
```

**fff MCP server:**
```bash
curl -L https://dmtrkovalenko.dev/install-fff-mcp.sh | bash
```

**Plannotator:**
```bash
curl -fsSL https://plannotator.ai/install.sh | bash
```

**Context7 setup** (skill mode, non-interactive — login is separate if needed):
```bash
ctx7 setup --claude --cli -y
```

**Codex companion setup** (yolo profile only, skip tools/vscode/skills we manage ourselves):
```bash
codex-1up install --yes --no-vscode --install-node skip --tools skip --codex-cli yes --profiles-scope single --profile yolo --profile-mode add --web-search live --file-opener none --credentials-store auto --alt-screen auto --personality pragmatic --skills skip --agents-md skip
```

**Agent Browser playwright browsers:**
```bash
agent-browser install
```

### Phase 2: Install Claude Code plugins

Run each pair of commands (marketplace add + install) separately. Do not install the `fold` plugin itself — that's already installed if this command is running.

```bash
claude plugin marketplace add rohitg00/pro-workflow
claude plugin install pro-workflow@pro-workflow
```

```bash
claude plugin marketplace add mksglu/context-mode
claude plugin install context-mode@context-mode
```

```bash
claude plugin marketplace add JuliusBrussee/caveman
claude plugin install caveman@caveman
```

```bash
claude plugin marketplace add backnotprop/plannotator
claude plugin install plannotator@plannotator
```

```bash
claude plugin marketplace add pbakaus/impeccable
claude plugin install impeccable@impeccable
```

```bash
claude plugin marketplace add coreyhaines31/marketingskills
claude plugin install marketing-skills
```

```bash
claude plugin marketplace add mvanhorn/last30days-skill
claude plugin install last30days@last30days-skill
```

```bash
claude plugin marketplace add openai/codex-plugin-cc
claude plugin install codex@openai-codex
```

```bash
claude plugin marketplace add anthropics/claude-plugins-official
claude plugin install plugin-dev@claude-plugins-official
claude plugin install skill-creator@claude-plugins-official
claude plugin install claude-md-management@claude-plugins-official
```

```bash
claude plugin marketplace add austintgriffith/ethskills
claude plugin install ethskills@ethskills
```

```bash
claude plugin marketplace add trailofbits/skills
claude plugin install skill-improver@trailofbits
claude plugin install workflow-skill-design@trailofbits
claude plugin install gh-cli@trailofbits
claude plugin install ask-questions-if-underspecified@trailofbits
claude plugin install audit-context-building@trailofbits
claude plugin install entry-point-analyzer@trailofbits
claude plugin install sharp-edges@trailofbits
claude plugin install differential-review@trailofbits
claude plugin install variant-analysis@trailofbits
claude plugin install spec-to-code-compliance@trailofbits
claude plugin install static-analysis@trailofbits
claude plugin install fp-check@trailofbits
```

### Phase 3: Configure settings

Apply recommended Claude Code settings:
```bash
jq '. * {"env":{"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS":"1","CLAUDE_CODE_NO_FLICKER":"1","CLAUDE_CODE_NEW_INIT":"1"},"attribution":{"commit":"","pr":""}}' ~/.claude/settings.json > /tmp/settings.json && mv /tmp/settings.json ~/.claude/settings.json
```

### Phase 4: Post-install setup

Run these skills:
```
/codex:setup --enable-review-gate
/last30days setup
```

### Phase 5: Clean up legacy CLAUDE.md configuration

Older versions of Fold wrote workflow configuration directly into the project's `CLAUDE.md`. This is no longer needed — the Fold plugin's `CLAUDE.md` now loads the workflow via `@skills/workflow/SKILL.md`, so it's always up to date automatically.

1. Check if a `CLAUDE.md` exists in the current working directory.

2. If it exists, check whether it contains the legacy Fold configuration by looking for the string `RESEARCH  →  PLAN  →  IMPLEMENT  →  VERIFY  →  REVIEW  →  SHIP`.

3. **If legacy content found**: remove all Fold-managed sections (from `## Communication` through `## Caveman` inclusive, including the final caveman paragraph). Preserve any non-Fold content the user added. Tell the user: "Removed legacy Fold workflow from CLAUDE.md — it's now loaded automatically via the plugin."

4. **If no legacy content**: nothing to do. Tell the user: "Fold workflow loads automatically via the plugin. No changes needed."

5. Tell the user to run `/reload-plugins` to pick up the newly installed plugins in the current session.
