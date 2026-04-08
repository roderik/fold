## Workflow

Follow this phased workflow for any non-trivial task. Skip phases that don't apply.

```
RESEARCH  →  PLAN  →  IMPLEMENT  →  VERIFY  →  REVIEW  →  SHIP
```

| Phase | Tools |
|-------|-------|
| Research | last30days, Exa, Octocode, Context7, fff |
| Plan | Pro Workflow `/develop`, Plannotator plan review |
| Implement | Pro Workflow phases, Codex `/codex:rescue`, agent-browser |
| Verify | agent-ci local CI, Pro Workflow quality gates |
| Review | `/simplify`, Codex `/codex:review` + `/codex:adversarial-review`, agent-reviews, Impeccable `/audit` `/critique` |
| Ship | `/smart-commit`, `/fold:pr`, `/wrap-up`, `/plannotator-review`, `/autofix-pr` |

---

## Research

Use these tools to gather context before writing code.

### last30days

Research any topic across Reddit, X, YouTube, HN, and the web. Use when you need community sentiment, recent trends, or real-world usage patterns.

- `/last30days <topic>` — one-shot research
- `/last30days <topic> for <tool>` — scoped research
- Watchlist mode: `last30 watch <topic> every <interval>` for recurring research

### Exa

Web search for current information, company lookups, and broad discovery.

- `web_search_exa` for general web search
- `get_code_context_exa` for API usage and code examples
- Use search operators: `site:`, quoted phrases, `intitle:` to narrow results
- Lower `tokensNum` (1000-2000) for focused snippets, higher (5000+) for comprehensive context

### Octocode

Semantic code research across GitHub/GitLab repos (public + private based on your permissions). Use when you need to find real implementations, usage patterns, or explore PRs in external repos.

- Searches repos naturally — find how others solved similar problems
- LSP intelligence: go-to-definition, find references, call hierarchy
- Also works for local code search, directory browsing, file finding

### Context7

Always use Context7 when library/API documentation, code generation, setup, or configuration steps are needed — without the user having to explicitly ask.

---

## Planning

### Pro Workflow

Structured development via `/develop <feature>`. Implements Research > Plan > Implement > Review with confidence scoring and approval gates.

```
/develop add user authentication
```

The four phases:
1. **Research** — confidence score → GO/HOLD
2. **Plan** — present approach → wait for approval
3. **Implement** — quality gates every 5 edits
4. **Review** — security & quality check → commit

Never skip phases. Never proceed without approval between phases.

Other Pro Workflow skills:
- `/deslop` — remove AI slop from generated code
- `/wrap-up` — end-of-session ritual (summarize, commit, handoff notes)
- `/smart-commit` — structured commits with context
- `/orchestrate` — parallel worktrees for complex multi-file work

### Plannotator

Hooks into plan mode automatically. When `ExitPlanMode` fires, Plannotator opens a browser-based review UI where the user can annotate, redline, and approve plans.

Additional commands:
- `/plannotator-review` — interactive code review for uncommitted changes or a PR URL
- `/plannotator-annotate <file.md>` — annotate any markdown file
- `/plannotator-last` — annotate the last assistant message

---

## Implementation

Use Pro Workflow phases for structured implementation. For browser-based work, use agent-browser skills.

When stuck after exhausting obvious approaches, delegate to Codex:
- `/codex:rescue` — hand off substantial tasks for a fresh perspective

Do NOT wait for the user to ask — use `/codex:rescue` proactively when you've hit a wall.

---

## Verification

### agent-ci

Run GitHub Actions locally. Instant feedback, no push required.

```bash
npx agent-ci run --quiet --workflow .github/workflows/pr.yml
```

- When a step fails, the run pauses. Fix the issue, then: `npx @redwoodjs/agent-ci retry --name <runner>`
- Do NOT push to trigger remote CI when agent-ci can run it locally
- CI was green before you started — any failure is caused by your changes
- Use `--no-matrix` to collapse matrix jobs into a single run when full matrix isn't needed

---

## Review

### /simplify

Run `/simplify` after implementing a feature or accepting AI-generated code. It spawns parallel agents checking reuse, quality, and efficiency, then applies fixes automatically.

What it catches: duplicated logic, missed abstractions, unused imports, overly complex conditionals, performance inefficiencies.

Use `/simplify` for structural quality. Use `/deslop` for AI-specific artifacts (defensive checks, redundant comments, orphaned debug code). They're complementary — run both on AI-generated code.

### Codex Reviews

Run before shipping any change:
- `/codex:review` — reviews uncommitted changes or branch diffs (`--base main`)
- `/codex:adversarial-review` — challenges assumptions, design tradeoffs, and failure modes. Use for risky areas (auth, data loss, race conditions). Accepts a focus: `/codex:adversarial-review --base main challenge the caching design`

### agent-reviews

Resolves PR review comments automatically. Three skills available:

| Skill | What it resolves |
|-------|-----------------|
| `resolve-reviews` | All comments (human + bot) |
| `resolve-agent-reviews` | Bot comments only |
| `resolve-human-reviews` | Human comments only |

Workflow: fetch unanswered comments → evaluate each → fix real issues → dismiss false positives → reply with outcome → watch for new comments → report summary.

### Impeccable (for UI work)

- `/audit` — scores 5 dimensions with P0-P3 severity ratings
- `/critique` — scores against Nielsen's 10 heuristics, tests with persona archetypes

---

## Shipping

- `/smart-commit` — structured commit with context
- `/fold:pr` — create a well-structured GitHub pull request for the current branch
- `/wrap-up` — end-of-session summary, commit, handoff notes
- `/plannotator-review` — final interactive code review before merge
- `/autofix-pr` — hand off PR to cloud for autonomous CI fixing and review comment resolution

### /autofix-pr

After finishing a PR, run `/autofix-pr` to send your session context to the cloud. Claude then autonomously watches the PR and:

- **CI failures**: reads the error, investigates, pushes a fix, explains what it did
- **Clear review comments**: makes the change, pushes, replies to the thread
- **Ambiguous feedback**: asks you before acting
- **Architectural decisions / conflicting reviewers**: escalates to you

The PR stays green while you're away. Use this as the last step after `/plannotator-review` and pushing — it keeps the PR alive without you babysitting CI or review cycles.

---

## File Search

For any file search or grep in the current git-indexed directory, always use fff tools:
- `grep` — search file contents (bare identifiers only, no complex regex)
- `find_files` — explore which files/modules exist for a topic
- `multi_grep` — OR logic across multiple patterns

Stop searching after 2 greps — read the code.

---

## Design

Run `/teach-impeccable` once per project to establish design context.

Key design commands:
- `/polish` — final quality pass (alignment, spacing, consistency)
- `/audit` — technical quality checks (a11y, perf, theming, responsive)
- `/critique` — UX evaluation with scoring
- `/typeset` — fix typography (fonts, hierarchy, sizing, weight)
- `/arrange` — fix layout, spacing, visual rhythm
- `/overdrive` — technically ambitious effects (shaders, physics, 60fps)
- `/bolder` — amplify bland designs
- `/quieter` — tone down aggressive designs
- `/colorize` — add strategic color
- `/distill` — strip to essence
- `/harden` — error handling, i18n, edge cases
- `/normalize` — realign to design system standards

---

## Delegation

| Do it yourself | Delegate to Codex |
|----------------|-------------------|
| Quick edits, refactors, simple debugging | Stuck after exhausting obvious approaches |
| File exploration, understanding code | Deep root-cause analysis of complex bugs |
| Straightforward reasoning tasks | Need a fresh perspective on design/implementation |
| | Multi-step implementations, large refactors |

- `/codex:review` — pre-ship review
- `/codex:adversarial-review` — challenge assumptions
- `/codex:rescue` — delegate substantial tasks
- `/codex:status` / `/codex:result` / `/codex:cancel` — manage background jobs

---

## Self-Correction

When the user corrects me or I make a mistake:
1. Acknowledge specifically what went wrong
2. Propose a concise rule: `[LEARN] Category: One-line rule`
3. Wait for approval before adding to LEARNED section

Also available: `/learn-rule` from Pro Workflow for persistent self-correction across sessions.

---

## Caveman

Load `/caveman`
