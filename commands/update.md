---
description: Update all Fold tools, plugins, and dependencies to their latest versions
allowed-tools: Bash, AskUserQuestion, Skill
---

# Fold Update

Update all tools and plugins managed by Fold to their latest versions.

## Steps

### Phase 1: Update Homebrew packages

```bash
brew upgrade rtk jq ripgrep fd ast-grep shellcheck shfmt linear agent-browser
```

If a package isn't installed, install it instead:
```bash
brew install rtk jq ripgrep fd ast-grep shellcheck shfmt schpet/tap/linear agent-browser
```

### Phase 2: Update npm global packages

```bash
npm update -g @redwoodjs/agent-ci agent-reviews ctx7 codex-1up
```

### Phase 3: Re-run installer scripts

These are idempotent and will update to the latest version:

```bash
curl -L https://dmtrkovalenko.dev/install-fff-mcp.sh | bash
```

```bash
curl -fsSL https://plannotator.ai/install.sh | bash
```

```bash
ctx7 setup --claude --cli -y
```

```bash
codex-1up install --yes --no-vscode --install-node skip --tools skip --codex-cli yes --profiles-scope single --profile yolo --profile-mode add --web-search live --file-opener none --credentials-store auto --alt-screen auto --personality pragmatic --skills skip --agents-md skip
```

### Phase 4: Update Agent Browser browsers

```bash
agent-browser install
```

### Phase 5: Update Claude Code plugins

Run each command separately. These will pull the latest versions:

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

```bash
claude plugin marketplace add roderik/fold
claude plugin install fold@fold
```

### Phase 6: Report

Summarize what was updated. If any command failed, list the failures and suggest manual fixes.

Tell the user to run `/reload-plugins` to pick up the updated plugins in the current session.
