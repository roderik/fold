---
name: audit
description: "Run a structured security audit in Codex using Fold's two-track audit model: static and diff-driven evidence on one side, context and adversarial review on the other, with explicit finding triage, human decision points, and fix-now criteria."
license: MIT
metadata:
  author: roderik
  version: "0.1.0"
---

# Audit

Use this skill when the user asks for a security review, audit, attack-surface analysis, compliance check, variant hunt, or diff-focused security pass.

This is the Codex-native replacement for Fold's manual Claude audit skill. Preserve the same result, but use Codex tools and Codex-local skills instead of slash commands, `AskUserQuestion`, or Claude plugin wrappers.

## Operating Model

Use two independent tracks and converge in a decision phase:

- Track A: evidence-first review using repo-native static analysis, git diff inspection, and changed-file triage.
- Track B: reasoning-first review using architectural context, trust-boundary mapping, sharp-edge analysis, and variant hunting.
- Convergence: assess each candidate finding, run the false-positive gate, assign confidence, and present a recommendation before any fix.

Do not merge the tracks into one vague pass. Pick the right mode for the request, then execute it cleanly.

## Modes

The user can invoke `$audit` with one of these intents:

- `static`: run or inspect static analysis and turn tool output into an audit report.
- `entry-points`: map externally reachable attack surface for a target scope.
- `context`: build architectural and trust-boundary context before hunting bugs.
- `review`: run a full scope security review with context plus adversarial analysis.
- `diff`: perform a security-focused review of current changes against a base branch.
- `variants`: search for repeated vulnerability patterns across the codebase.
- `compliance`: compare code against a specification, standard, or policy.
- `decide`: assess one or more findings and wait for a human decision.
- `cycle`: run `entry-points -> context -> static -> review -> decide` for a complete audit pass.

If the user does not specify a mode, infer the smallest useful one from the request and say which mode you chose.

## Core Procedure

### 1. Define Scope

Identify the target path, subsystem, diff range, or standard first. If the request is underspecified and the missing scope would materially change the audit, ask one concise plain-text question. Otherwise, choose a reasonable default and state it.

### 2. Build Minimal Context

Always read the code before making claims. Load:

- the target files
- immediate callers and callees
- auth, validation, and config boundaries
- relevant tests
- repo-level security guidance in `AGENTS.md`, `SECURITY.md`, `THREAT_MODEL.md`, or equivalent

For architectural review, use the synced Trail of Bits context skill in `codex/fold/skills/trailofbits-audit-context-building`.

### 3. Execute the Right Mode

#### `static`

Use repo-native analyzers first. Prefer existing project commands and installed tools over inventing new scanners.

Typical tools by ecosystem:

- JavaScript or TypeScript: `eslint`, Semgrep, framework-specific checks
- Python: `ruff`, `bandit`, Semgrep, `pytest` for exploitability confirmation
- Go: `gosec`, `staticcheck`, Semgrep
- Rust: `cargo audit`, `clippy`, `cargo test`
- Solidity and EVM: `slither`, `aderyn`, Semgrep

Then normalize findings into one report:

- deduplicate same issue at same location
- classify severity
- mark which findings were tool-only versus code-confirmed
- do not recommend fixes yet unless the user explicitly asked for remediation

Parity note: the Claude version wrapped a `static-analysis` skill. The Codex tree does not currently ship a first-class synced static-analysis skill, so use repo-native analyzers and available shell tools directly.

#### `entry-points`

Map externally reachable entry points, input sources, privileged operations, and missing gates.

Prefer the synced Trail of Bits entry-point skill in `codex/fold/skills/trailofbits-entry-point-analyzer` when the target is a smart contract codebase. For non-contract systems, perform the same job manually:

- web routes, middleware, controllers, RPC handlers, GraphQL resolvers
- CLI handlers and automation entry points
- background job consumers and queue processors
- public library APIs
- serverless handlers and event triggers

Classify each entry point as:

- ungated
- authenticated
- authorized
- internal only

#### `context`

Use this before a deep review of a non-trivial subsystem. Produce:

- architecture summary
- trust boundaries
- sensitive data flows
- state mutation paths
- external service and file or network I/O boundaries

Prefer the synced Trail of Bits context skill in `codex/fold/skills/trailofbits-audit-context-building`.

#### `review`

Run a full security review over the target scope:

- start with context
- inspect auth and authorization
- trace user-controlled input into sensitive operations
- examine crypto, secrets, file access, network access, and persistence
- look for race conditions, deserialization, resource exhaustion, data leaks, and unsafe error handling

Use the synced Trail of Bits sharp-edge skill in `codex/fold/skills/trailofbits-sharp-edges` if it is relevant to the language or framework. Every substantive finding must then go through the finding-analysis reference before it is reported.

#### `diff`

Use for changed-code security review against `main` unless the user gives another base.

Process:

1. Read `git diff <base>...HEAD`.
2. Classify changed files by security relevance.
3. Focus on auth, validation, secrets, configuration, dependency updates, and new entry points.
4. Use the synced Trail of Bits diff review skill in `codex/fold/skills/trailofbits-differential-review` when helpful.
5. Report blast radius, missing tests, and concrete regression risk.

#### `variants`

Use when you already have a pattern and want similar instances. Supported pattern families:

- injection
- auth-bypass
- race-condition
- crypto-misuse
- input-validation
- resource-exhaustion
- info-leak
- deserialization

Use the synced Trail of Bits variant-analysis skill in `codex/fold/skills/trailofbits-variant-analysis` when it fits the target language. Otherwise perform a focused code search and review the candidate matches manually.

#### `compliance`

Use when the user wants to compare code to a standard or spec such as OAuth 2.0, OWASP ASVS, ERC-20, or an internal policy document.

Read the referenced spec or standard, map requirements to code, and report:

- covered requirements
- deviations
- unsupported or ambiguous requirements
- extensions beyond the spec

Prefer the synced Trail of Bits spec compliance skill in `codex/fold/skills/trailofbits-spec-to-code-compliance` when it fits the material.

#### `decide`

This is the convergence phase. For each candidate finding:

1. read the code again
2. run the procedure in [finding-analysis.md](./references/finding-analysis.md)
3. classify the result
4. recommend one human decision:
   - `confirmed`
   - `false-positive`
   - `accepted-risk`
   - `fix-planned`
   - `fix-now`
   - `wont-fix`

Never silently apply a fix before the human has chosen `fix-now` or explicitly asked you to remediate the finding.

#### `cycle`

For a full audit cycle:

1. map entry points
2. build context
3. run static analysis
4. perform review
5. assess findings in `decide`

Use this mode for full subsystem audits, pre-release hardening, or high-risk refactors.

## Findings Standard

Every reported finding must include:

- severity
- confidence score
- file and line references
- concrete attack path or reason it is currently blocked
- why existing guards are insufficient
- recommended next action

Do not report speculation as a finding. If evidence is incomplete, classify it as `needs-human-review` or `low-confidence`.

## Fix-Now Rules

If the human chooses `fix-now`, follow [fix-now-procedure.md](./references/fix-now-procedure.md).

Keep fixes surgical:

- minimal codepath
- tests added or updated
- relevant verification run
- no opportunistic refactors

If the change exceeds the fix-now envelope, stop and recommend `fix-planned`.

## Reporting

Match the report format to the mode, but always include:

- scope
- tools or skills used
- coverage limits
- findings grouped by severity
- open questions and parity gaps

Be explicit when:

- a scanner was unavailable
- only part of the codebase was reviewed
- a claim depends on inference rather than direct evidence

## Codex-Native Rules

- Use concise plain-text questions when genuinely blocked; there is no `AskUserQuestion` UI dependency here.
- Prefer repo-local commands and synced Codex skills over Claude slash commands.
- Use web research only for unstable facts such as current CVEs, package advisories, or evolving standards.
- If the audit touches pull requests or GitHub review state, use `gh` or the GitHub plugin rather than describing manual steps.

## Parity Gaps

Flag these when relevant:

- No Claude slash-command wrapper such as `/security-audit ...`; the Codex equivalent is intent-driven `$audit`.
- No first-class synced `static-analysis` skill currently ships in this Codex tree; static mode uses repo analyzers directly.
- No structured `AskUserQuestion` UI; use concise plain text when a human decision is required.
- No automatic persistence of finding state across turns; restate unresolved findings clearly when resuming.
