---
name: workflow
description: Always active — base workflow framework for all Claude Code sessions. Defines phased development (research → plan → implement → verify → review → ship), tool selection, verification tiers, delegation patterns, and session conventions. Force-loaded via CLAUDE.md.
user-invocable: false
license: MIT
metadata:
  author: roderik
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
| Research | `ce-sessions`, `ce-slack-research`, `learnings-researcher`, `git-history-analyzer`, `issue-intelligence-analyst`, `repo-research-analyst`, `best-practices-researcher`, `framework-docs-researcher`, last30days, Exa, Octocode, Context7, Restate Docs, Figma, fff |
| Plan | `ce:brainstorm`, `ce:ideate`, `ce:plan`, `document-review` (multi-persona), Plannotator |
| Implement | `ce:work` (or `ce:work-beta` with Codex delegation), `lfg` for full autonomy, `ce-debug`, `/codex:rescue`, anti-slop subagents, browser automation, `git-worktree`, `ce-demo-reel`, `test-browser`, `test-xcode` |
| Verify | Tiered testing, repo testing skill discovery, Fallow code health, agent-ci local CI, `bug-reproduction-validator` |
| Review | `ce:review` (always-on + conditional persona agents), `/simplify`, Codex reviews, `resolve-pr-feedback`, `/impeccable:audit`, `/impeccable:critique`, `/security-audit`, `design-implementation-reviewer` / `figma-design-sync` / `design-iterator` for UI diffs |
| Ship | `git-commit`, `git-commit-push-pr`, `git-clean-gone-branches`, `/fold:pr`, `changelog`, `ce:compound` (learnings), `/plannotator-review` |

---

## Compound Engineering

Compound Engineering (CE) is the primary engine of this workflow. It is not just a collection of skills — it is an orchestration system built around three ideas:

1. **Durable artifacts that compound knowledge.** Every non-trivial change produces markdown in `docs/` that the next session can learn from. These are protected artifacts — never delete, rename, or "clean them up" without explicit instruction from the user:
   - `docs/brainstorms/` — requirements documents produced by `ce:brainstorm`
   - `docs/plans/` — structured implementation plans produced by `ce:plan`, with progress checkboxes updated by `ce:work`
   - `docs/solutions/` — post-hoc learnings produced by `ce:compound` (and maintained by `ce:compound-refresh`)
2. **Multi-persona orchestration.** Skills (like `ce:review`, `document-review`) are orchestrators that dispatch parallel persona agents with structured JSON contracts, merge deduplicated findings, apply severity gates, and present a single coherent report. You almost never call individual CE agents directly — you call the orchestrating skill and let it pick agents.
3. **Agents, not shortcuts.** Before you start research, `learnings-researcher` searches `docs/solutions/` so you do not re-solve a solved problem. `session-historian` searches prior Claude Code / Codex / Cursor sessions for the same investigation. `ce:compound` writes the current solution back so the next session benefits. This is the compounding loop — skip it and the team re-learns the same lesson forever.

### Canonical loop

For any non-trivial task, the canonical loop is:

```
ce:brainstorm  →  ce:plan  →  document-review  →  ce:work  →  ce:review  →  git-commit-push-pr  →  ce:compound
     │                                                                                                │
     └────────── before each step, let learnings-researcher check docs/solutions/ ────────────────────┘
```

Skip steps only when they clearly do not apply (e.g., skip `ce:brainstorm` when the user hands you a fully-specified task, skip `ce:compound` when nothing non-obvious was learned).

### Invocation modes

CE skills support four invocation modes. Pick the one that matches the situation:

| Mode | When |
|------|------|
| **interactive** (default) | User is present and will answer questions; produces prompts and confirmation gates |
| **autofix** | Autonomous run — apply only `safe_auto` fixes, no prompts. Use when chaining skills or running unattended |
| **report-only** | Read-only verification. Safe to run in parallel or on shared branches — produces findings without touching the tree |
| **headless** | Programmatic caller mode. Returns structured JSON, no prompts, emits a terminal "Review complete" marker. Use when another skill or script is consuming the output |

When you spawn a CE skill as a subagent, pass an explicit mode — do not let the default take over.

### Agent-native thinking

CE treats agents as first-class users of the system you build, not as an afterthought. Two specific skills exist for this:

- `agent-native-architecture` — use during design when building features that agents will drive (internal tools, backoffice flows, APIs with MCP consumers). Enforces action + context parity so an agent can do anything a human can do, and see everything a human can see.
- `agent-native-audit` — comprehensive review that scores the codebase against the agent-native principles. Run before landing features that expose new user-facing actions.

The `agent-native-reviewer` is also always-on in `ce:review`, so every PR gets a quick check for action/context parity regressions — but prefer running `agent-native-audit` when you know the change is agent-facing.

---

## Research

Use these tools to gather context before writing code. Always start research with the CE research agents below — they are cheap and usually produce the highest-leverage context.

### Compound Engineering research agents

These run as subagents (spawn them with `Agent` using the `compound-engineering:research:<name>` identifier, or invoke them implicitly through CE skills). Run them in parallel whenever they do not depend on each other.

| Agent | Use when |
|-------|----------|
| `learnings-researcher` | **Run first, every time.** Searches `docs/solutions/` for past solutions to the same or adjacent problems. Prevents re-solving solved problems and catches retry of known-bad approaches. |
| `session-historian` | Searches Claude Code, Codex, and Cursor session history for prior sessions on the same topic. Use when the user says "we tried this before" or "last week", or when you suspect prior investigation exists. Exposed as the user-invocable `ce-sessions` skill. |
| `git-history-analyzer` | Archaeological git analysis — traces code evolution, identifies contributors, explains why patterns exist. Use before modifying load-bearing or confusing code. |
| `issue-intelligence-analyst` | Fetches and clusters GitHub issues. Use to surface recurring themes, severity trends, and pain patterns before scoping a feature. |
| `repo-research-analyst` | Thorough research on repo structure, documentation, conventions, implementation patterns. Use when dropped into an unfamiliar codebase. |
| `slack-researcher` | Searches Slack for organizational context — decisions, constraints, discussion arcs not documented elsewhere. Use when the "why" is missing from the code. Exposed as `ce-slack-research`. |
| `best-practices-researcher` | Synthesizes external best practices / documentation / examples for any technology. Use when making framework choices or adopting new libraries. |
| `framework-docs-researcher` | Gathers comprehensive framework / library documentation and version-specific constraints. Use in parallel with Context7 when you need implementation-level depth. |

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

### Compound Engineering flow

The CE planning loop is **brainstorm → plan → review document → approve → implement**. Each step writes a durable artifact into `docs/` that the next step and future sessions consume.

- `ce:brainstorm` — explore requirements and approaches through collaborative dialogue. Use when the feature is vague, when the user asks "what should we build", or when multiple valid directions exist. Produces a right-sized requirements document at `docs/brainstorms/<slug>.md`.
- `ce:ideate` — generate and adversarially filter high-impact project improvement ideas. Use when the user wants the AI to propose directions ("what should I improve", "surprise me"), not refine an existing idea.
- `ce:plan` — create a structured implementation plan at `docs/plans/<slug>.md` with progress checkboxes. Consumes a brainstorm doc, a requirements doc, or a raw task description. Also supports a "deepen" pass that interactively reviews sub-agent findings to strengthen an existing plan. Run this before touching code on anything non-trivial.
- `document-review` — review a requirements or plan document with parallel persona agents (see below). Run before approving a plan for implementation. Supports `mode:headless` for programmatic consumption.

Never skip straight from idea to code. The canonical planning loop is `ce:brainstorm` → `ce:plan` → `document-review` → user approval → `ce:work`.

### Document review personas

`document-review` dispatches these agents in parallel and merges their findings into a single strategic report. Each agent reads the doc as a different stakeholder:

| Persona | Surfaces |
|---------|----------|
| `coherence-reviewer` | Internal consistency, contradictions between sections, terminology drift, structural issues, ambiguity |
| `feasibility-reviewer` | Whether the proposed technical approach survives reality — architecture conflicts, dependency gaps, migration risks |
| `product-lens-reviewer` | Strategic consequences viewed as a senior product leader — trajectory, identity, adoption, opportunity cost, premise claims |
| `design-lens-reviewer` | Missing design decisions — information architecture, interaction states, user flows, AI slop risk |
| `scope-guardian-reviewer` | Unjustified complexity, scope creep, unnecessary abstractions, premature frameworks |
| `security-lens-reviewer` | Plan-level security gaps — auth/authz, data exposure, API surface, threat models |
| `adversarial-document-reviewer` | Conditional persona for large or high-stakes docs (>5 requirements, architectural decisions). Challenges premises and stress-tests decisions. |

You do not need to invoke these individually — `document-review` selects the right set based on document type and scope. For headless consumption (e.g., chaining into another skill), pass `mode:headless` and a path to the document.

### Plannotator

Hooks into plan mode automatically. When `ExitPlanMode` fires, Plannotator opens a browser-based review UI for annotating, redlining, and approving plans.

- `/plannotator-review` — interactive code review for uncommitted changes or a PR URL
- `/plannotator-annotate <file.md>` — annotate any markdown file
- `/plannotator-last` — annotate the last assistant message

---

## Implementation

Use `ce:work` to execute an approved plan efficiently while maintaining quality. Pass a plan doc path or leave blank to pick up the latest plan in `docs/plans/`. For token-conserving implementation with Codex delegation, use `ce:work-beta` with `delegate:codex`. For fully autonomous end-to-end execution, use `lfg`.

After completing a logical unit of work (a function, a component, a migration), run Tier 1 checks. Don't wait until the end.

### Debugging

Use `ce-debug` when stuck on errors, test failures, or investigating bugs from issue trackers (GitHub, Linear, Jira). It runs a systematic root-cause investigation — trace the causal chain, form a hypothesis, write a failing test that proves the hypothesis, then fix.

For ambiguous bug reports (user-reported, incomplete repro steps), spawn the CE `bug-reproduction-validator` agent first. It reproduces the report and confirms whether the behavior is an actual bug before you burn time chasing a phantom.

### Visual / platform-specific verification

- `ce-demo-reel` — capture a GIF, terminal recording, or screenshot sequence of the change for the PR description. Use on any user-visible change.
- `test-browser` — run browser tests on pages affected by the current PR or branch. Wire this into the verify tier when the change ships HTML/JS.
- `test-xcode` — build and run iOS tests on simulator via XcodeBuildMCP. Use on any Xcode project change.

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

- `git-worktree` — create, list, switch, and clean up git worktrees for parallel coding sessions. Use when you want to run multiple independent changes without blocking on each other.
- For large migrations or codemods touching 10+ files, decompose the work manually into a plan doc (`ce:plan`), then spawn one `ce:work` subagent per independent unit and run them against separate worktrees created with `git-worktree`.

### Delegation to Codex

When stuck after exhausting obvious approaches:
- `/codex:rescue` — hand off substantial tasks for a fresh perspective

Do NOT wait for the user to ask — use `/codex:rescue` proactively when you've hit a wall.

### Quality During Build

**Touch it, clean it** — When modifying a file, spawn a background subagent to scan it for existing slop (dead code, redundant comments, unused imports, overly defensive code). The subagent cleans up the file while you continue with the next unit of work. Don't accumulate slop — every touched file leaves cleaner than you found it.

**Change sizing** — Aim for ~100 lines changed per logical unit. At ~300 lines, consider splitting. Beyond 500 lines, invest in automation (codemods, or a plan doc split across parallel `ce:work` runs in separate worktrees) rather than manual edits. Large manual changes are error-prone and exhausting to review.

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

**Prove-It pattern for bug fixes** — Before writing the fix, write a failing test that demonstrates the bug. The test fails (confirming the bug exists), then implement the fix, then the test passes (proving the fix works). This prevents "fixes" that don't actually address the root cause. When the bug report is ambiguous, run the `bug-reproduction-validator` CE agent first to confirm the reported behavior is reproducible before writing any test.

**Discover repo testing conventions** — At the start of any task, spawn an Explore subagent to find testing skills and conventions in the target repository. Look for: a `testing` or `test` skill in the repo's skills directory, a `TESTING.md`, test scripts in `package.json` or `Makefile`, or CI workflows that reveal the test command. Every repo will likely have its own testing skill with specifics for that codebase — follow that over generic defaults. The TDD methodology skill provides the red-green-refactor loop, but the repo's testing skill defines *how* to run tests and what frameworks to use.

**DAMP over DRY in tests** — In production code, DRY is usually right. In tests, DAMP (Descriptive And Meaningful Phrases) is better. Each test should read like a specification — a complete story without requiring the reader to trace through shared helpers. Prefer descriptive repetition over test-helper abstractions.

**Test state, not interactions** — Tests that verify method call sequences break on refactor even if behavior is unchanged. Test what the function produces (state), not how it works internally (interactions). Preference for test doubles: real implementation > fake > stub > mock.

---

## Review

### Post-Build Review (every branch)

AI-generated code accumulates slop that compounds over time — redundant comments, defensive checks for impossible states, abstractions nobody needs. Catching it immediately costs minutes; catching it later costs hours. The generating agent is the worst reviewer of its own output — different models and agents catch different categories of problems.

**Step 1** — Spawn `/simplify` as a subagent first. It strips AI slop: defensive try/catch, redundant comments, type hacks, over-engineering, backwards-compat shims, features beyond scope. Wait for it to finish before step 2 so subsequent reviewers focus on real issues instead of noise.

**Step 2** — Spawn these in parallel as subagents:
- `ce:review` — CE's structured review pipeline (see the agent taxonomy below). Pass `mode:headless` when chaining. Run on the current branch or a PR link.
- `/codex:review --base main` — outside-perspective diff review
- `/codex:adversarial-review --base main` — challenges assumptions, design tradeoffs, failure modes. Always run this, not just for "risky" changes — AI-generated code has blind spots the generating agent cannot see. Accepts a focus: `/codex:adversarial-review --base main challenge the caching design`
- `code-simplicity-reviewer` (CE) — final simplicity pass, flags YAGNI violations
- `architecture-strategist` (CE) — architectural coherence check, pattern compliance, design integrity

**Step 3** — Synthesize findings. Pipe them into `todo-triage` to categorize and prioritize, then `todo-resolve` to batch-fix approved items. Dismiss false positives with explicit reasoning. Report a summary to the user.

The main thread orchestrates during review — it does not do the reviewing itself.

### ce:review agent taxonomy

`ce:review` is not a single reviewer — it is a dispatcher that runs six always-on agents plus conditional personas selected from the diff. Knowing which agents will run helps you decide when to call `ce:review` versus a single focused agent.

**Always-on (every `ce:review` invocation):**
- `correctness-reviewer` — logic errors, edge cases, state management bugs, error propagation, intent-vs-implementation mismatches
- `testing-reviewer` — coverage gaps, weak assertions, brittle implementation-coupled tests, missing edge cases
- `maintainability-reviewer` — premature abstraction, unnecessary indirection, dead code, coupling, naming drift
- `project-standards-reviewer` — audits against the project's `CLAUDE.md` / `AGENTS.md` conventions
- `agent-native-reviewer` — action + context parity check so new features remain agent-usable
- `learnings-researcher` — searches `docs/solutions/` so the review benefits from prior learnings

**Conditional (selected from diff content):**
- `security-reviewer` — touched when the diff includes auth, public endpoints, user input, permissions
- `performance-reviewer` — touched when the diff includes DB queries, data transforms, caching, async
- `api-contract-reviewer` — touched when the diff includes routes, serializers, type signatures, versioning (breaking-change detection)
- `data-migrations-reviewer` — touched when the diff includes migrations, schema changes, backfills (data-integrity focus)
- `reliability-reviewer` — touched when the diff includes error handling, retries, circuit breakers, timeouts, health checks, background jobs
- `adversarial-reviewer` — triggered when the diff is ≥50 lines or touches auth/payments/data mutations/external APIs. Actively constructs failure scenarios.
- `cli-readiness-reviewer` / `cli-agent-readiness-reviewer` — touched when the diff defines CLI commands or argument parsing
- `previous-comments-reviewer` — triggered when the PR has existing review threads. Checks whether prior feedback was actually addressed.

**Stack-specific (selected per diff language / framework):**
- `dhh-rails-reviewer` / `kieran-rails-reviewer` — opinionated Rails review
- `kieran-python-reviewer` — Pythonic clarity, type hints, maintainability
- `kieran-typescript-reviewer` — type safety, component boundaries, hooks correctness
- `julik-frontend-races-reviewer` — Stimulus/Turbo race conditions, DOM timing, animation/async UI failures

**Data-heavy changes (invoke directly when relevant):**
- `data-integrity-guardian` — database migrations, persistent data code, privacy compliance
- `data-migration-expert` — validates backfills and production data transformations against reality
- `schema-drift-detector` — catches unrelated schema.rb changes cross-referenced against included migrations
- `deployment-verification-agent` — produces Go/No-Go deployment checklists with SQL verification, rollback, monitoring

**Cross-cutting analysis (invoke directly for focused audits):**
- `pattern-recognition-specialist` — design patterns, anti-patterns, naming, duplication
- `performance-oracle` — algorithmic complexity, DB queries, memory, scalability
- `security-sentinel` — input validation, auth/authz, hardcoded secrets, OWASP compliance
- `architecture-strategist` — high-level pattern compliance and design integrity
- `code-simplicity-reviewer` — final minimality pass

Call `ce:review` for every branch. Call specific agents directly when you have a narrow audit goal (e.g., "I only care whether this migration is safe" → invoke `data-integrity-guardian` + `data-migration-expert` + `deployment-verification-agent` rather than running the whole pipeline).

### Design review

When the change includes UI, also run CE's design agents — they compare the live implementation against the design source and iterate until they converge:

- `design-implementation-reviewer` — visually diffs live UI against Figma, reports discrepancies
- `figma-design-sync` — detects and fixes visual differences between web implementation and Figma
- `design-iterator` — iteratively refines UI through N screenshot → analyze → improve cycles. Use proactively when design changes are not converging.

### PR Reviews

Resolves PR review comments automatically. Use whichever scope matches the source of the feedback:

| Skill | Resolves |
|-------|----------|
| `resolve-pr-feedback` (Compound Engineering) | Any PR — evaluates validity of each comment and fixes in parallel |
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

The canonical shipping path is `git-commit-push-pr` → CI green → merge → `ce:compound` → `git-clean-gone-branches`.

- `git-commit` — CE commit skill: produces clear, value-communicating commit messages that follow repo conventions, or defaults to conventional commits.
- `git-commit-push-pr` — one-shot commit + push + PR with an adaptive, value-first description that scales depth with change complexity. Also refreshes existing PR descriptions ("refresh the PR", "update the PR description").
- `/fold:pr` — alternative PR creation path if you prefer Fold's structure.
- `ce-demo-reel` — attach a GIF / terminal recording / screenshot sequence to the PR description for any user-visible change.
- `changelog` — generate an engaging changelog for recent merges to main.
- `ce:compound` — **after the PR merges**, document any non-obvious fix or discovered pattern as a durable learning in `docs/solutions/`. This is what makes the next session faster — do not skip it when something was actually learned.
- `git-clean-gone-branches` — prune local branches (and their worktrees) whose remote tracking branch is gone.
- `/plannotator-review` — final interactive code review before merge.

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

Run `/impeccable:teach-impeccable` once per project to establish design context. See [references/design-skills.md](references/design-skills.md) for the full Impeccable skill catalog.

For UI implementation against a Figma source, also use the CE design stack:

- `frontend-design` — production-grade frontend implementation skill. Use when building new UI from scratch.
- `design-implementation-reviewer` — visually diffs a live UI against Figma and reports discrepancies.
- `figma-design-sync` — detects and fixes visual differences between web implementation and Figma source.
- `design-iterator` — runs N screenshot → analyze → improve cycles until the UI converges on the design. Use proactively when manual tweaks are not converging.

---

## Session Management

- `ce-sessions` — search and ask questions about your coding agent session history. Use when asking what you worked on, what was tried before, how a problem was investigated across sessions, or any question about past sessions.
- `ce:compound` — document a recently solved problem so the team's knowledge compounds. Run after landing a non-obvious fix or discovering a pattern worth keeping.
- `ce:compound-refresh` — refresh stale learnings in `docs/solutions/` against the current codebase. Run after refactors, migrations, or dependency upgrades.
- `claude-permissions-optimizer` — reduce permission prompts by finding safe Bash commands from session history and auto-applying them to `settings.json`.
- `todo-create`, `todo-triage`, `todo-resolve` — durable file-based todo system for findings across sessions.

See [references/session-tools.md](references/session-tools.md) for scheduling and additional session tooling.

---

## Delegation

| Do it yourself | Delegate to Codex |
|----------------|-------------------|
| Quick edits, refactors, simple debugging | Stuck after exhausting obvious approaches |
| File exploration, understanding code | Deep root-cause analysis of complex bugs |
| Straightforward reasoning tasks | Need a fresh perspective on design/implementation |
| | Multi-step implementations, large refactors |
| | Token-conserving bulk implementation (`ce:work-beta delegate:codex`) |

- `/codex:rescue` — delegate substantial tasks
- `/codex:review` — pre-ship review
- `/codex:adversarial-review` — challenge assumptions
- `ce:work-beta` with `delegate:codex` — hand off implementation of an approved plan to Codex for token-conserving execution. Use when the plan is clear and the implementation is mechanical.

---

## Self-Correction

When the user corrects me or I make a mistake:
1. Acknowledge specifically what went wrong
2. Run `ce:compound` to document the mistake and its resolution as a durable learning in `docs/solutions/` — this is how Compound Engineering compounds team knowledge across sessions

---

## Protected artifacts

The following paths are **protected** — never delete, rename, reorganize, or "clean up" without explicit user instruction. They are load-bearing for CE and power the compounding knowledge loop:

- `docs/brainstorms/**` — requirements documents authored by `ce:brainstorm`
- `docs/plans/**` — implementation plans authored by `ce:plan` (progress checkboxes updated by `ce:work`)
- `docs/solutions/**` — durable learnings authored by `ce:compound` (maintained by `ce:compound-refresh`)
- `AGENTS.md`, `CLAUDE.md` — project conventions consulted by `project-standards-reviewer` and many CE skills
- `.compound-engineering/**` — CE plugin state (if present)

When `/simplify`, deslop-style passes, or any reviewer spawns, explicitly whitelist these paths. If a stale doc needs pruning, run `ce:compound-refresh` instead of deleting.

---

## Caveman

At the start of every conversation, invoke the `/caveman` skill before responding to the user.
