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

### Phase 4: Update cship and Agent Browser

```bash
curl -fsSL https://cship.dev/install.sh | bash
```

```bash
agent-browser install
```

### Phase 5: Remove deprecated plugins

Older versions of Fold shipped `pro-workflow`. It is replaced by Compound Engineering — uninstall it if present:

```bash
claude plugin uninstall pro-workflow@pro-workflow || true
claude plugin marketplace remove pro-workflow || true
```

### Phase 6: Update Claude Code plugins

Run each command separately. These will pull the latest versions:

```bash
claude plugin marketplace add EveryInc/compound-engineering-plugin
claude plugin install compound-engineering@compound-engineering-plugin
claude plugin install coding-tutor@compound-engineering-plugin
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
```

```bash
claude plugin marketplace add roderik/fold
claude plugin install fold@fold
```

### Phase 7: Update global skills (Claude Code + Codex)

Re-run the `skills` CLI installs to pick up the latest versions. Each command targets both Claude Code (`~/.claude/skills/`) and Codex (`~/.codex/skills/`).

```bash
npx skills add pbakaus/agent-reviews --skill '*' -g -a claude-code -a codex -y
```

```bash
npx skills add vercel-labs/agent-browser --skill agent-browser --skill dogfood -g -a claude-code -a codex -y
```

```bash
npx skills add fallow-rs/fallow-skills --skill '*' -g -a claude-code -a codex -y
```

```bash
npx skills add boristane/agent-skills --skill logging-best-practices -g -a claude-code -a codex -y
```

```bash
npx skills add mattpocock/skills --skill tdd --skill ubiquitous-language -g -a claude-code -a codex -y
```

```bash
npx skills add vercel/turborepo --skill '*' -g -a claude-code -a codex -y
```

```bash
npx skills add roderik/fold --skill '*' -g -a codex -y
```

Alternatively, run `npx skills update` to refresh every skill already installed via the CLI in one call.

### Phase 8: Update Compound Engineering for Codex

Re-run the Codex installer to sync the latest Compound Engineering prompts and skills into `~/.codex/`:

```bash
bunx @every-env/compound-plugin install compound-engineering --to codex
```

### Phase 9: Report

Summarize what was updated. If any command failed, list the failures and suggest manual fixes.

Tell the user to run `/reload-plugins` to pick up the updated plugins in the current session.
