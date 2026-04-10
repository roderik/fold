---
name: workflow
description: "Fold's Codex-native execution workflow for non-trivial engineering tasks: research, plan, implement, verify, review, and ship with accurate reporting, repo-first validation, and explicit parity gaps versus the Claude workflow."
license: MIT
metadata:
  author: roderik
  version: "0.1.0"
---

# Workflow

Use this skill for non-trivial work: multi-file edits, new features, bug investigations, refactors, migrations, and risky reviews. For trivial tasks, act directly and skip the full framework.

This is the Codex-native replacement for Fold's always-on Claude workflow skill. Preserve the outcome standards, but use Codex tools, repo instructions, and current session constraints instead of Claude-only mechanics.

## Core Rules

### Report truthfully

State what happened, not what would have been convenient:

- if tests failed, say they failed
- if you did not run a check, say you did not run it
- if something is complete and verified, say so plainly

Never manufacture a green result or overstate coverage.

### Read local policy first

Before substantial work, check:

- `AGENTS.md`
- repo scripts and task runners
- current working tree state
- any task-specific docs in the repo

Repo-local instructions outrank generic workflow preference.

### Keep scope disciplined

- prefer the primary codepath
- avoid speculative abstraction
- keep business rules single-sourced
- validate inputs early
- do not add compatibility glue without a concrete requirement

### Ask only when blocked

Codex does not use Claude's `AskUserQuestion` workflow here. If a missing answer would materially change the implementation or risk damage, ask one concise plain-text question. Otherwise make a reasonable assumption and continue.

## Phase Framework

Use this sequence for non-trivial tasks:

`RESEARCH -> PLAN -> IMPLEMENT -> VERIFY -> REVIEW -> SHIP`

Skip phases that genuinely do not apply, but do not skip verification or honest reporting.

## Research

Start by building enough context to avoid blind edits.

Preferred order:

1. inspect the relevant code
2. inspect local docs and tests
3. inspect git diff or history if needed
4. use synced skills or web research only when local context is insufficient

Useful Fold Codex skills already in this plugin:

- `fold-setup`
- `fold-update`
- `fold-doctor`
- `tdd`
- `fallow`
- `logging-best-practices`
- `ubiquitous-language`
- `turborepo`
- `agent-browser`
- `last30days`
- `caveman`
- `caveman-compress`

Research guidance:

- use web research for unstable facts, current docs, package behavior, CVEs, and standards
- prefer official docs and primary sources
- when searching locally, stop once you have enough evidence to edit safely

## Plan

For multi-step tasks, create a concrete plan before editing:

- identify the primary codepath
- identify invariants, risks, and verification steps
- call `update_plan` when the work has multiple meaningful stages
- keep one step in progress at a time

If the work is straightforward enough that a formal plan would be noise, move directly into implementation.

Parity note: Claude's Pro Workflow and Plannotator plan-mode gates do not exist as first-class Codex behavior here. Use an explicit local plan instead of pretending those gates still exist.

## Implement

Make direct, canonical changes in the real codepath.

Implementation rules:

- prefer minimal, production-grade changes over broad speculative rewrites
- preserve user changes outside your scope
- keep touched files cleaner than you found them
- do not add wrappers or adapters just to bridge tools
- if the work grows past the original scope, say so and tighten the plan

Tooling guidance:

- use `apply_patch` for manual file edits
- use fast deterministic search such as `rg`, `fd`, `jq`, and `ast-grep` where available
- use `multi_tool_use.parallel` for independent reads
- use `spawn_agent` only if the user explicitly asks for subagents, delegation, or parallel agent work

Use supporting Fold skills when they materially improve correctness:

- `tdd` for red-green-refactor
- `logging-best-practices` for telemetry changes
- `ubiquitous-language` for domain terminology cleanup
- `turborepo` for monorepo build, cache, or task-graph changes
- `agent-browser` for browser automation or UI verification

## Verify

Verification is mandatory. Match the depth to the risk.

### Tier 1

Run fast checks after logical units of work:

- lint
- typecheck
- format check

Prefer the repo's combined check command if one exists.

### Tier 2

Run targeted tests for the code you changed:

- related unit tests
- focused integration tests
- reproduction tests for bug fixes

Every behavior change needs a test unless the repository truly has no automated coverage for that area. For bug fixes, prefer the prove-it pattern: reproduce, fix, verify.

### Tier 3

Run broader validation at meaningful gates:

- before final handoff
- before opening or updating a PR when local CI is available
- after fixing CI-relevant failures

Use `agent-ci` where the repository already relies on it.

### Code health

Run `fallow` for unused code, boundary issues, duplication, and complexity when it is relevant to the touched area.

## Review

Run a review pass that is separate from implementation.

Default review checklist:

- correctness and regression risk
- missing tests
- security impact
- code health and unnecessary complexity
- UX or accessibility regressions for frontend work

Helpful Fold skills:

- `audit` for security-sensitive work
- `impeccable-audit` and `impeccable-critique` for frontend review
- `fold-doctor` for environment and toolchain diagnosis

If the task is a GitHub PR review or CI issue, prefer the GitHub plugin skills already available in this session.

Parity note: the Claude workflow used multiple slash-command review agents and automatic review orchestration. In Codex, do the review explicitly with the skills and tools that actually exist in this environment.

## Ship

Close with a clean delivery:

- summarize what changed
- summarize what was verified
- note unresolved risks or follow-ups
- use `fold-pr` when the user wants a PR prepared

Follow the repo's git policy:

- use conventional commit style when making commits
- ask before `git push`
- use `gh` for PR management

## Domain Add-Ons

Bring in specialized Fold skills only when relevant:

- `linear-cli` for Linear issue work
- `grafana` for production investigation
- `resolve-human-reviews`, `resolve-agent-reviews`, or `resolve-reviews` when review comment resolution is needed

If a referenced skill is unavailable in the current session, continue with the closest direct tool path and state the gap briefly.

## Parity Gaps

Flag these explicitly when they matter:

- no force-loaded always-on skill behavior equivalent to Claude's `CLAUDE.md` bootstrap
- no Claude slash commands such as `/pro-workflow:*`, `/fold:*`, or `/codex:*`
- no `AskUserQuestion` structured UI dependency
- no automatic Plannotator plan-mode interception
- no proactive subagent delegation unless the user explicitly asked for it in this session
- no automatic startup invocation such as Claude's mandatory `/caveman` preamble
