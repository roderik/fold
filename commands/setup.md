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

### Phase 5: Configure project CLAUDE.md

The canonical source of the workflow configuration is the Fold plugin's own `CLAUDE.md`, located at the root of this plugin's repository (the same directory that contains `commands/`, `skills/`, and `README.md`).

1. Check if a `CLAUDE.md` exists in the current working directory. If not, create one.

2. Read the current project `CLAUDE.md` and the plugin's canonical `CLAUDE.md`.

3. Check if Fold configuration is already present by looking for the string `RESEARCH  →  PLAN  →  IMPLEMENT  →  VERIFY  →  REVIEW  →  SHIP` in the project's `CLAUDE.md`.

4. **If not present**: append the full content of the plugin's `CLAUDE.md` to the end of the project's `CLAUDE.md` (preserve all existing content).

5. **If already present**: compare each section (identified by `## ` headings) between the project's Fold configuration and the plugin's canonical version. For any section where the content differs, replace the project's version with the canonical version. Do not touch sections in the project's `CLAUDE.md` that are not part of the Fold configuration. Report which sections were updated.

6. Tell the user the result:
   - If freshly added: "Fold workflow configured in CLAUDE.md. Run `/teach-impeccable` to set up design context for this project."
   - If updated: list the sections that changed.
   - If already up to date: "Fold configuration is already up to date."

7. Tell the user to run `/reload-plugins` to pick up the newly installed plugins in the current session.
