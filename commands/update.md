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
claude plugin marketplace add forrestchang/andrej-karpathy-skills
claude plugin install andrej-karpathy-skills@karpathy-skills
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

### Phase 8b: Update Karpathy guidelines for Codex

Inject or update the Karpathy coding guidelines in `~/.codex/AGENTS.md` (idempotent — replaces existing block or prepends if missing):

```bash
KARPATHY_BLOCK='<!-- BEGIN KARPATHY GUIDELINES -->
## Karpathy Guidelines

Behavioral guidelines to reduce common LLM coding mistakes (derived from Andrej Karpathy'\''s observations). Bias toward caution over speed; for trivial tasks, use judgment.

### Think Before Coding
- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don'\''t pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what'\''s confusing. Ask.

### Simplicity First
- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn'\''t requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

### Surgical Changes
- Don'\''t "improve" adjacent code, comments, or formatting.
- Don'\''t refactor things that aren'\''t broken.
- Match existing style, even if you'\''d do it differently.
- If you notice unrelated dead code, mention it — don'\''t delete it.
- Remove imports/variables/functions that YOUR changes made unused; don'\''t remove pre-existing dead code unless asked.
- Every changed line should trace directly to the user'\''s request.

### Goal-Driven Execution
- Transform tasks into verifiable goals: "Add validation" → "Write tests for invalid inputs, then make them pass"; "Fix the bug" → "Write a test that reproduces it, then make it pass".
- For multi-step tasks, state a brief plan with verification per step.
- Strong success criteria let you loop independently; weak criteria require constant clarification.
<!-- END KARPATHY GUIDELINES -->'

AGENTS_FILE="$HOME/.codex/AGENTS.md"
if [ ! -f "$AGENTS_FILE" ]; then
  echo "$KARPATHY_BLOCK" > "$AGENTS_FILE"
elif grep -q '<!-- BEGIN KARPATHY GUIDELINES -->' "$AGENTS_FILE"; then
  awk '/<!-- BEGIN KARPATHY GUIDELINES -->/{skip=1} /<!-- END KARPATHY GUIDELINES -->/{skip=0; next} !skip' "$AGENTS_FILE" > "$AGENTS_FILE.tmp"
  printf '%s\n\n' "$KARPATHY_BLOCK" | cat - "$AGENTS_FILE.tmp" > "$AGENTS_FILE"
  rm "$AGENTS_FILE.tmp"
else
  printf '%s\n\n' "$KARPATHY_BLOCK" | cat - "$AGENTS_FILE" > "$AGENTS_FILE.tmp"
  mv "$AGENTS_FILE.tmp" "$AGENTS_FILE"
fi
```

### Phase 9: Report

Summarize what was updated. If any command failed, list the failures and suggest manual fixes.

Tell the user to run `/reload-plugins` to pick up the updated plugins in the current session.
