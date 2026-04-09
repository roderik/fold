---
name: workflow
description: Always active — base workflow framework for all Claude Code sessions. Defines phased development (research → plan → implement → verify → review → ship), tool selection, verification tiers, delegation patterns, and session conventions. Force-loaded via CLAUDE.md.
user-invocable: false
license: MIT
metadata:
  author: roderik
  version: "0.3.0"
---

## Epistemic Discipline

Report outcomes faithfully: if tests fail, say so with the relevant output; if you did not run a verification step, say that rather than implying it succeeded. Never claim "all tests pass" when output shows failures, never suppress or simplify failing checks (tests, lints, type errors) to manufacture a green result, and never characterize incomplete or broken work as done. Equally, when a check did pass or a task is complete, state it plainly — do not hedge confirmed results with unnecessary disclaimers, downgrade finished work to "partial," or re-verify things you already checked. The goal is an accurate report, not a defensive one.

## Scope

This workflow applies to non-trivial tasks (multi-file changes, new features, bug investigations). For trivial tasks (single-file edits, quick lookups, one-line fixes), act directly — skip the phased workflow entirely.

## Communication

Always use `AskUserQuestion` when you need user input, confirmation, or a decision. Never use plain text questions — the structured UI makes choices clearer and keeps the conversation actionable.

---

## Code Quality Principles

AI agents generate slop — unnecessary comments, defensive code for impossible scenarios, over-engineered abstractions, features nobody asked for. Every line of code has ongoing cost: tests, documentation, security patches, mental overhead. The value is the functionality, not the code itself. These principles prevent slop from entering the codebase.

**KISS** — Choose the simplest approach that solves the actual problem. A readable 5-line if/else beats a clever 1-line ternary. Three similar lines of code is better than a premature abstraction.

**YAGNI** — Build what was asked for, nothing more. No speculative features, no "while I'm here" additions, no preemptive extensibility. If nobody asked for it and there's no concrete use case today, don't build it.

**Boy Scout Rule** — Leave every file you touch cleaner than you found it. Remove dead code, unnecessary comments, unused imports, stale TODOs. This applies especially to AI-generated code — spawn a background subagent to scan each modified file for existing slop and clean it up in parallel with your next unit of work.

**Least Surprise** — Code should do what a reader expects. Prefer conventional patterns over novel ones. Name things for what they do, not how they work internally.

**Chesterton's Fence** — Before simplifying or removing code, understand why it exists. Check git blame, check tests, check callers. If you can't explain why it was written this way, you're not ready to change it.

### Anti-rationalization guardrails

AI agents talk themselves into cutting corners. Watch for these:

| Rationalization | Reality |
|----------------|---------|
| "Fewer lines is always simpler" | A 1-line nested ternary is not simpler than a 5-line if/else. Simplicity is comprehension speed, not line count. |
| "This abstraction might be useful later" | If it's not used now, it's complexity without value. Remove it. |
| "The original author must have had a reason" | Maybe. Check git blame. But accumulated complexity often has no reason — it's residue of iteration under pressure. |
| "It's faster to do it all at once" | It *feels* faster until something breaks and you can't find which of 500 changed lines caused it. |
| "I'll clean this up later" | No you won't. Clean it up now or it stays forever. |

---

## Workflow

Follow this phased workflow for any non-trivial task. Skip phases that don't apply.

```
RESEARCH  →  PLAN  →  IMPLEMENT  →  VERIFY  →  REVIEW  →  SHIP
```

| Phase | Tools |
|-------|-------|
| Research | last30days, Exa, Octocode, Context7, Restate Docs, Figma, fff |
| Plan | Pro Workflow `/develop`, Plannotator, `/pro-workflow:thoroughness-scoring` |
| Implement | Pro Workflow phases, Codex `/codex:rescue`, anti-slop subagents, browser automation, `/pro-workflow:batch-orchestration`, `/pro-workflow:parallel-worktrees` |
| Verify | Tiered testing, repo testing skill discovery, Fallow code health, agent-ci local CI |
| Review | `/simplify`, `/pro-workflow:deslop`, Codex reviews, agent-reviews, `/impeccable:audit`, `/impeccable:critique`, `/security-audit` |
| Ship | `/pro-workflow:smart-commit`, `/fold:pr`, `/pro-workflow:wrap-up`, `/plannotator-review` |

---

## Research

Use these tools to gather context before writing code.

### last30days

Research any topic across Reddit, X, YouTube, HN, and the web.

- `/last30days <topic>` — one-shot research
- `/last30days <topic> for <tool>` — scoped research
- Watchlist mode: `last30 watch <topic> every <interval>` for recurring research

### Exa

Web search for current information, company lookups, and broad discovery.

- `web_search_exa` for general web search
- `get_code_context_exa` for code examples from GitHub, Stack Overflow, docs
- `crawling_exa` for fetching full content from a known URL
- Use search operators: `site:`, quoted phrases, `intitle:` to narrow results

### Octocode

Semantic code research across GitHub/GitLab repos (public + private). Find real implementations, usage patterns, or explore PRs in external repos.

- LSP intelligence: go-to-definition, find references, call hierarchy
- Also works for local code search, directory browsing, file finding

### Context7

Always use Context7 when library/API documentation, code generation, setup, or configuration steps are needed — without the user having to explicitly ask.

### Restate Docs

Use `search_restate` and `get_page_restate` MCP tools when working with Restate — the durable execution framework. For SDK APIs, service definitions, deployment, configuration, and patterns.

### Figma

Use `get_design_context` as primary tool when given Figma URLs. Returns code, screenshots, and contextual hints. Adapt output to project stack — it's a reference, not final code. Also: `get_screenshot`, `get_metadata`, `get_figjam`, `generate_diagram`.

---

## Planning

### Pro Workflow `/develop`

Structured development via `/pro-workflow:develop <feature>`. Four phases with confidence scoring and approval gates:

1. **Research** — confidence score → GO/HOLD
2. **Plan** — present approach → wait for approval
3. **Implement** — quality gates every 5 edits
4. **Review** — security & quality check → commit

Never skip phases. Never proceed without approval between phases.

### Plannotator

Hooks into plan mode automatically. When `ExitPlanMode` fires, Plannotator opens a browser-based review UI for annotating, redlining, and approving plans.

- `/plannotator-review` — interactive code review for uncommitted changes or a PR URL
- `/plannotator-annotate <file.md>` — annotate any markdown file
- `/plannotator-last` — annotate the last assistant message

### Thoroughness Scoring

Use `/pro-workflow:thoroughness-scoring` to score decision points 1-10. Includes scope checks to distinguish contained vs unbounded work.

---

## Implementation

Use Pro Workflow phases for structured implementation. After completing a logical unit of work (a function, a component, a migration), run Tier 1 checks. Don't wait until the end.

### Browser Automation

| Skill | Use when |
|-------|----------|
| `/fold:agent-browser` | Navigate pages, fill forms, take screenshots, test web apps |
| `/fold:electron` | Automate Electron desktop apps (VS Code, Slack, Discord, Figma) |
| `/fold:slack` | Interact with Slack workspaces via browser automation |
| `/fold:dogfood` | Systematically explore and test a web app to find bugs/UX issues |
| `/fold:vercel-sandbox` | Run browser automation inside Vercel Sandbox microVMs |
| `/fold:agentcore` | Run browser automation on AWS Bedrock AgentCore cloud browsers |

### Parallel Work

- `/pro-workflow:batch-orchestration` — decompose large changes into independent units, spawn parallel agents in isolated worktrees. Use for migrations, refactors, codemods touching 10+ files.
- `/pro-workflow:parallel-worktrees` — create git worktrees for parallel coding sessions with zero dead time.
- `/pro-workflow:agent-teams` — coordinate multiple Claude Code sessions as lead + teammates with shared task lists and mailbox messaging.

### Delegation to Codex

When stuck after exhausting obvious approaches:
- `/codex:rescue` — hand off substantial tasks for a fresh perspective

Do NOT wait for the user to ask — use `/codex:rescue` proactively when you've hit a wall.

### Quality During Build

**Touch it, clean it** — When modifying a file, spawn a background subagent to scan it for existing slop (dead code, redundant comments, unused imports, overly defensive code). The subagent cleans up the file while you continue with the next unit of work. Don't accumulate slop — every touched file leaves cleaner than you found it.

**Change sizing** — Aim for ~100 lines changed per logical unit. At ~300 lines, consider splitting. Beyond 500 lines, invest in automation (`/pro-workflow:batch-orchestration`, codemods) rather than manual edits. Large manual changes are error-prone and exhausting to review.

**Stop-the-line** — When something breaks mid-implementation, stop adding features. Preserve evidence (error output, logs, repro steps), diagnose root cause, fix it, verify the fix, then resume. Don't guess-and-fix — diagnose first.

---

## Methodology References

Follow these reference skills during implementation (loaded automatically; not user-invocable).

| Skill | Guidance |
|-------|----------|
| **tdd** | Red-green-refactor loop, vertical slices, integration tests over mocks |
| **logging-best-practices** | Wide events (canonical log lines), structured logging |
| **ubiquitous-language** | DDD-style glossary extraction. Invoke to generate `UBIQUITOUS_LANGUAGE.md` |
| **turborepo** | Monorepo task pipelines, caching, filtering, CI optimization |

---

## Verification

Use a tiered approach — fast feedback often, full CI only at gates.

### Tier 1: Fast checks (seconds) — run often

Run after each logical unit of work and before every commit.

- **Lint**: `eslint`, `ruff`, `clippy`, or whatever the project uses
- **Typecheck**: `tsc --noEmit`, `mypy`, `pyright`, etc.
- **Format check**: `prettier --check`, `rustfmt --check`, etc.

If the project has a single command for all fast checks (e.g., `npm run check`, `make lint`), prefer that.

### Tier 2: Targeted tests (seconds–minutes) — run at sub-task boundaries

Run after completing a meaningful sub-task.

- Run only tests affected by your changes: `jest --findRelatedTests <changed-files>`, `pytest <changed-module>`, or equivalent
- If no way to scope tests, skip to Tier 3 at commit time

### Tier 3: Full CI (minutes) — run at gates only

Run with agent-ci at these checkpoints:
1. **Before creating a commit** — final verify step
2. **After fixing CI failures** — confirm the fix before pushing

```bash
npx agent-ci run --quiet --workflow .github/workflows/pr.yml
```

- When a step fails, fix the issue, then: `npx @redwoodjs/agent-ci retry --name <runner>`
- Do NOT push to trigger remote CI when agent-ci can run it locally
- Use `--no-matrix` to collapse matrix jobs into a single run when full matrix isn't needed

### Code Health

Run **fallow** to check for code health issues:
- Unused code, circular dependencies, duplication, complexity hotspots, boundary violations
- Auto-fixes available for some findings

### When to skip tiers

- **Docs-only or config-only**: Tier 1 only. Skip tests unless config affects build/runtime.
- **Single-line fixes**: Tier 1 + Tier 2. Full CI if the fix touches shared code.
- **Refactors touching many files**: All three tiers.

### Testing

Every behavior change, bug fix, and new feature needs a test. No exceptions.

**Prove-It pattern for bug fixes** — Before writing the fix, write a failing test that demonstrates the bug. The test fails (confirming the bug exists), then implement the fix, then the test passes (proving the fix works). This prevents "fixes" that don't actually address the root cause.

**Discover repo testing conventions** — At the start of any task, spawn an Explore subagent to find testing skills and conventions in the target repository. Look for: a `testing` or `test` skill in the repo's skills directory, a `TESTING.md`, test scripts in `package.json` or `Makefile`, or CI workflows that reveal the test command. Every repo will likely have its own testing skill with specifics for that codebase — follow that over generic defaults. The TDD methodology skill provides the red-green-refactor loop, but the repo's testing skill defines *how* to run tests and what frameworks to use.

**DAMP over DRY in tests** — In production code, DRY is usually right. In tests, DAMP (Descriptive And Meaningful Phrases) is better. Each test should read like a specification — a complete story without requiring the reader to trace through shared helpers. Prefer descriptive repetition over test-helper abstractions.

**Test state, not interactions** — Tests that verify method call sequences break on refactor even if behavior is unchanged. Test what the function produces (state), not how it works internally (interactions). Preference for test doubles: real implementation > fake > stub > mock.

---

## Review

### Post-Build Review (every branch)

AI-generated code accumulates slop that compounds over time — redundant comments, defensive checks for impossible states, abstractions nobody needs. Catching it immediately costs minutes; catching it later costs hours. The generating agent is the worst reviewer of its own output — different models and agents catch different categories of problems.

**Step 1** — Spawn `/pro-workflow:deslop` as a subagent. It strips AI slop: defensive try/catch, redundant comments, type hacks, over-engineering, backwards-compat shims, features beyond scope. Wait for it to finish before step 2 — deslop removes noise so subsequent reviewers focus on real issues.

**Step 2** — Spawn these three as parallel subagents:
- `/simplify` — checks reuse, quality, and efficiency (spawns its own parallel agents internally)
- `/codex:review --base main` — reviews the cleaned-up diff from an outside perspective
- `/codex:adversarial-review --base main` — challenges assumptions, design tradeoffs, failure modes. Always run this, not just for "risky" changes — AI-generated code has blind spots the generating agent can't see. Accepts a focus: `/codex:adversarial-review --base main challenge the caching design`

**Step 3** — Synthesize findings from all three subagents. Apply fixes, dismiss false positives, report summary to the user.

The main thread orchestrates during review — it does not do the reviewing itself.

### PR Reviews

Resolves PR review comments automatically. Three skills for different scopes:

| Skill | Resolves |
|-------|----------|
| `/fold:resolve-reviews` | All comments (human + bot) |
| `/fold:resolve-agent-reviews` | Bot comments only |
| `/fold:resolve-human-reviews` | Human comments only |

Workflow: fetch unanswered comments → evaluate → fix real issues → dismiss false positives → reply → report summary.

### UI Review

- `/impeccable:audit` — technical quality: a11y, perf, theming, responsive. P0-P3 severity ratings.
- `/impeccable:critique` — UX evaluation: Nielsen's 10 heuristics, persona-based testing, quantitative scoring.

### Security Review

- `/security-audit cycle [--scope <path>]` — full security audit cycle (entry points → context → static → review → decide)
- `/security-audit diff [--base <branch>]` — security-focused diff review of current branch changes
- `/security-audit review --scope <path>` — AI-based security review with confidence scoring

See the `security-audit` skill for full command reference (static, context, entry-points, review, diff, variants, compliance, decide, finding, cycle).

---

## Shipping

- `/pro-workflow:smart-commit` — structured commit with quality gates and change review
- `/fold:pr` — create a well-structured GitHub pull request for the current branch
- `/pro-workflow:wrap-up` — end-of-session summary, commit, handoff notes
- `/plannotator-review` — final interactive code review before merge

---

## Observability

Use the **grafana** skill for production investigation. See [references/observability.md](references/observability.md) for commands and workflow.

---

## Issue Tracking

Use **linear-cli** to manage Linear issues. See [references/issue-tracking.md](references/issue-tracking.md) for commands.

---

## File Search

For any file search or grep in the current git-indexed directory, always use fff tools:
- `grep` — search file contents (bare identifiers only, no complex regex)
- `find_files` — explore which files/modules exist for a topic
- `multi_grep` — OR logic across multiple patterns

Stop searching after 2 greps — read the code.

---

## Design

Run `/impeccable:teach-impeccable` once per project to establish design context. See [references/design-skills.md](references/design-skills.md) for the full skill catalog.

---

## Session Management

See [references/session-tools.md](references/session-tools.md) for the full catalog of Pro Workflow session tools and scheduling.

---

## Delegation

| Do it yourself | Delegate to Codex |
|----------------|-------------------|
| Quick edits, refactors, simple debugging | Stuck after exhausting obvious approaches |
| File exploration, understanding code | Deep root-cause analysis of complex bugs |
| Straightforward reasoning tasks | Need a fresh perspective on design/implementation |
| | Multi-step implementations, large refactors |

- `/codex:rescue` — delegate substantial tasks
- `/codex:review` — pre-ship review
- `/codex:adversarial-review` — challenge assumptions

---

## Self-Correction

When the user corrects me or I make a mistake:
1. Acknowledge specifically what went wrong
2. Run `/pro-workflow:learn-rule` to capture the correction as a persistent learning rule

---

## Caveman

At the start of every conversation, invoke the `/caveman` skill before responding to the user.
