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

**cship statusline:**
```bash
curl -fsSL https://cship.dev/install.sh | bash
```

**cship config** (Full Starship Prompt preset):
```bash
cat > ~/.config/cship.toml << 'TOML'
[cship]
lines = [
  "$starship_prompt",
  "$cship.model $cship.cost $cship.context_bar $cship.usage_limits",
]

[cship.model]
symbol = " "
style  = "bold fg:#7aa2f7"

[cship.cost]
symbol             = "💰 "
style              = "fg:#a9b1d6"
warn_threshold     = 2.0
warn_style         = "fg:#e0af68"
critical_threshold = 5.0
critical_style     = "bold fg:#f7768e"

[cship.context_bar]
symbol             = " "
format             = "[$symbol$value]($style)"
width              = 10
style              = "fg:#7dcfff"
warn_threshold     = 40.0
warn_style         = "fg:#e0af68"
critical_threshold = 70.0
critical_style     = "bold fg:#f7768e"

[cship.usage_limits]
five_hour_format   = "⌛ 5h {pct}%"
seven_day_format   = "📅 7d {pct}%"
separator          = " "
warn_threshold     = 70.0
warn_style         = "fg:#e0af68"
critical_threshold = 90.0
critical_style     = "bold fg:#f7768e"
TOML
```

**Agent Browser playwright browsers:**
```bash
agent-browser install
```

### Phase 2: Install Claude Code plugins

Run each pair of commands (marketplace add + install) separately. Do not install the `fold` plugin itself — that's already installed if this command is running.

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

### Phase 2b: Install skills globally (Claude Code + Codex)

These skills are published on GitHub and are installed globally to both Claude Code (`~/.claude/skills/`) and Codex (`~/.codex/skills/`) via the `skills` CLI. Run each command separately.

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

Also mirror the Fold-native skills (audit, grafana, linear-cli, workflow) into Codex so the workflow guidance is available there too:

```bash
npx skills add roderik/fold --skill '*' -g -a codex -y
```

### Phase 2c: Install Compound Engineering skills for Codex

Compound Engineering ships its own Codex installer that writes prompts and skills into `~/.codex/prompts` and `~/.codex/skills`:

```bash
bunx @every-env/compound-plugin install compound-engineering --to codex
```

### Phase 2d: Install Karpathy guidelines for Codex

Inject the Karpathy coding guidelines into `~/.codex/AGENTS.md` (idempotent — replaces existing block or prepends if missing):

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
