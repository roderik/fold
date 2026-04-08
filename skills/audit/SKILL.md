---
name: security-audit
description: "Security audit skill — two-track architecture: Track A (tool-based: static analysis → decide) and Track B (AI-based: context → review → decide). Wraps Trail of Bits plugins for language-agnostic security auditing. Commands: /security-audit static, /security-audit context, /security-audit review, /security-audit diff, /security-audit variants, /security-audit decide, /security-audit finding, /security-audit entry-points, /security-audit compliance, /security-audit cycle"
user-invocable: true
allowed-tools: Bash, Read, Edit, Write, Glob, Grep, Agent, AskUserQuestion, Skill
license: MIT
metadata:
  author: roderik
  version: "0.1.0"
---

# Security Audit Skill

Security audit commands wrapping Trail of Bits plugins with project-specific context. Language and framework agnostic — works on any codebase.

**References** (loaded by commands that need them):
- `references/finding-analysis.md` — Finding Analysis shared procedure (FP gate, confidence scoring, classification)
- `references/fix-now-procedure.md` — Fix-Now shared procedure (eligibility, implementation, verification)

## Architecture

Two independent tracks. They never call each other.

```
Track A (tool-based)                    Track B (AI-based)
─────────────────────                   ──────────────────
/security-audit static                  /security-audit context --scope <path>
  → Run static analysis tools             → Build architectural context
  → Classify, dedup, assign scope         → Map trust boundaries
  → Report findings

/security-audit entry-points --scope    /security-audit review --scope <path>
  → Map attack surface                    → Full security review
  → Identify ungated entry points         → Guidelines + sharp edges + patterns
                                          → Report findings with confidence

                    /security-audit decide
                    ──────────────────────
                    → Assess each finding
                    → FP gate (3 checks)
                    → Present recommendation to human
                    → Register human's decision

/security-audit diff                    /security-audit variants --pattern <type>
  → Security diff review                  → Hunt similar vulnerabilities
  → Current branch vs base                → Cross-codebase pattern search

/security-audit compliance --spec <reference>
  → Verify spec-to-code compliance
```

All tracks converge on `/security-audit decide` for assessment and human decision.

### Finding Lifecycle

```
static/review creates finding →
decide assesses (read code, FP gate, confidence score) →
  presents recommendation → human decides →
    confirmed → fix (code changed, tests added)
    false-positive → document and dismiss
    accepted-risk → document rationale
    fix-planned → track for later
```

---

## Commands

### `static`

Run static analysis tools on the codebase and report findings.

**Usage:** `/security-audit static [--scope <path>]`

**Trail of Bits skill:** `static-analysis`

**Workflow:**

1. If `--scope` provided, limit analysis to that directory. Otherwise, analyze the full project.
2. Detect project type and available tools:
   - **JavaScript/TypeScript**: ESLint security rules, Semgrep
   - **Python**: Bandit, Semgrep, Ruff security rules
   - **Go**: gosec, staticcheck, Semgrep
   - **Rust**: cargo-audit, clippy (security lints), Semgrep
   - **Solidity**: Slither, Aderyn, Semgrep
   - **General**: Semgrep with auto-detected rulesets
3. Invoke `Skill({ skill: "static-analysis" })` scoped to the project/path.
4. Deduplicate findings across tools (same file:line + same issue = one finding).
5. Classify by severity: Critical, High, Medium, Low, Informational.
6. Output structured report:

```
## Static Analysis Report

### Tools Run
| Tool | Version | Rules | Findings |
|------|---------|-------|----------|

### Critical Findings
| ID | Tool | File:Line | Rule | Description |
|----|------|-----------|------|-------------|

### High Findings
...

### Summary
- Total: N findings (X critical, Y high, Z medium)
- Files analyzed: N
- Deduplicated: N findings merged
```

---

### `entry-points`

Map the attack surface by identifying all externally reachable entry points.

**Usage:** `/security-audit entry-points --scope <path>`

**Trail of Bits skill:** `entry-point-analyzer`

**Workflow:**

1. Parse `--scope` to determine which code to analyze.
2. Detect entry point patterns based on project type:
   - **Web APIs**: HTTP route handlers, middleware chains, GraphQL resolvers
   - **CLI tools**: command handlers, argument parsers
   - **Libraries**: public API surface, exported functions
   - **Smart contracts**: external/public functions, receive/fallback
   - **Serverless**: handler functions, event triggers
3. Invoke `Skill({ skill: "entry-point-analyzer" })` scoped to the path.
4. Categorize entry points by authentication/authorization requirements:
   - **Ungated** (no auth) — highest priority
   - **Authenticated** (requires valid session/token)
   - **Authorized** (requires specific role/permission)
   - **Internal** (not directly reachable from outside)
5. Output structured report:

```
## Entry Points: <scope>

### Ungated (No Auth Required) — HIGH PRIORITY
| File | Function/Route | Input Sources | Risk |
|------|---------------|---------------|------|

### Authenticated
| File | Function/Route | Auth Method | Input Sources |
|------|---------------|-------------|---------------|

### Authorized (Role-Gated)
| File | Function/Route | Required Role | Input Sources |
|------|---------------|---------------|---------------|

### Summary
- Total entry points: N
- Ungated: N (priority review)
- Input validation coverage: N%
```

---

### `context`

Build deep architectural analysis context for a scope before vulnerability hunting.

**Usage:** `/security-audit context --scope <path>`

**Trail of Bits skill:** `audit-context-building`

**Workflow:**

1. Parse `--scope` to determine analysis target.
2. Read project structure, dependency graph, and configuration.
3. Invoke `Skill({ skill: "audit-context-building" })` scoped to the path.
4. Output structured context:

```
## Audit Context: <scope>

### Architecture
- Dependency graph (internal + external)
- Data flow diagram
- Trust boundaries

### Trust Boundaries
- Authentication boundaries
- Authorization layers
- External service boundaries
- User input processing boundaries

### Data Flow
- Sensitive data paths (credentials, PII, tokens)
- State mutation paths
- External API interactions

### Attack Surface Summary
- External inputs: <list>
- Privileged operations: <list>
- Cryptographic operations: <list>
- File/network I/O: <list>
```

---

### `review`

Full security review combining guidelines, sharp edges, and pattern analysis.

**Usage:** `/security-audit review --scope <path>`

**Trail of Bits skills:** `sharp-edges`, `audit-context-building`

**Workflow:**

1. Parse `--scope` to determine review target.
2. Build context first — run the `context` workflow internally to understand architecture.
3. Invoke Trail of Bits skills sequentially:
   a. `Skill({ skill: "sharp-edges" })` — identify dangerous APIs, footgun patterns, and common misuse.
   b. Cross-reference with project-specific patterns:
      - Authentication/authorization bypasses
      - Injection vectors (SQL, command, path traversal, XSS)
      - Cryptographic misuse (weak algorithms, hardcoded keys, timing attacks)
      - Race conditions and TOCTOU bugs
      - Resource exhaustion / DoS vectors
      - Deserialization of untrusted data
      - Sensitive data exposure (logs, errors, responses)
4. For each finding, execute the **Finding Analysis** shared procedure (see `references/finding-analysis.md`): read source → trace data flow → FP gate (3 checks) → "Do Not Report" filters → confidence scoring → classification. Only findings with confidence >= 75 get fix recommendations.
5. Output consolidated findings with confidence scores:

```
## Security Review: <scope>

### Critical Findings
| ID | Confidence | File:Line | Issue | Recommendation |
|----|------------|-----------|-------|----------------|

### High Findings
...

### Low-Confidence (below 60 — human review needed)
| ID | Confidence | File:Line | Issue | Why Low-Confidence |
|----|------------|-----------|-------|--------------------|

### Informational
...
```

---

### `diff`

Security-focused review of current branch changes.

**Usage:** `/security-audit diff [--base <branch>]`

**Trail of Bits skill:** `differential-review`

**Workflow:**

1. Default base branch is `main` (or `master`). Override with `--base`.
2. Get the diff: `git diff <base>...HEAD`
3. Classify changed files by security relevance:
   - **High**: auth, crypto, input validation, access control, secrets, database queries
   - **Medium**: API routes, middleware, configuration, dependencies
   - **Low**: tests, docs, formatting, comments
4. Invoke `Skill({ skill: "differential-review" })` with the diff and security context.
5. Focus review on:
   - New entry points or removed auth checks
   - Changed input validation or sanitization
   - Modified access control logic
   - New dependencies (supply chain risk)
   - Changed cryptographic operations
   - Modified error handling (information leakage)
   - Configuration changes affecting security posture
6. Output structured review:

```
## Differential Security Review

### Changed Files (security-relevant)
| File | Relevance | Change Summary |
|------|-----------|----------------|

### Security-Relevant Changes
| Severity | File:Line | Change | Risk | Recommendation |
|----------|-----------|--------|------|----------------|

### Dependency Changes
| Package | Old | New | Advisory Check |
|---------|-----|-----|----------------|

### Blast Radius
- Files changed: N (M security-relevant)
- New entry points: N
- Removed guards: N
```

---

### `variants`

Hunt for similar vulnerabilities across the codebase based on a known pattern.

**Usage:** `/security-audit variants --pattern <type>`

**Trail of Bits skill:** `variant-analysis`

**Pattern types:**
- `injection` — SQL, command, path traversal, XSS, template injection
- `auth-bypass` — Missing or incorrect authentication/authorization checks
- `race-condition` — TOCTOU, double-spend, concurrent modification
- `crypto-misuse` — Weak algorithms, hardcoded keys, timing attacks
- `input-validation` — Unchecked parameters, type confusion, overflow
- `resource-exhaustion` — Unbounded loops, memory allocation, file handles
- `info-leak` — Sensitive data in logs, errors, responses, headers
- `deserialization` — Untrusted deserialization, prototype pollution

**Workflow:**

1. Parse `--pattern <type>`.
2. Invoke `Skill({ skill: "variant-analysis" })` with:
   - The pattern type and language-specific detection patterns
   - Scope: full codebase (or `--scope` if provided)
3. Output:

```
## Variant Analysis: <pattern-type>

### Known Pattern
<description of the vulnerability pattern being hunted>

### Instances Found
| ID | File:Line | Function | Confidence | Description |
|----|-----------|----------|------------|-------------|

### False Positives (reviewed and dismissed)
| File:Line | Function | Why Dismissed |
|-----------|----------|---------------|

### Recommendations
- <actionable recommendation per instance>
```

---

### `compliance`

Verify specification-to-code compliance.

**Usage:** `/security-audit compliance --spec <reference>`

**Trail of Bits skill:** `spec-to-code-compliance`

The `--spec` argument can be:
- A file path to a specification document
- A standard name (e.g., "OAuth 2.0", "ERC-20", "OWASP ASVS")
- A URL to a specification

**Workflow:**

1. Parse `--spec` to load the specification reference.
2. Identify the implementation code that should conform to the spec.
3. Invoke `Skill({ skill: "spec-to-code-compliance" })` with the spec and implementation.
4. Output:

```
## Compliance Report: <spec-name>

### Specification Coverage
| Requirement | Implementation | Status | Notes |
|-------------|---------------|--------|-------|

### Deviations
| Requirement | Expected | Actual | Severity | Justification Needed |
|-------------|----------|--------|----------|---------------------|

### Extensions (beyond spec)
| Extension | Implementation | Deviation Risk |
|-----------|---------------|----------------|
```

---

### `decide`

Assess findings and register human decisions. Convergence point for all tracks.

**Usage:**
- `/security-audit decide` — interactive: present each finding, ask for decision
- `/security-audit decide --finding "<description>"` — assess a specific finding

**Trail of Bits skills:** `sharp-edges`, `fp-check` (for assessment)

**Decision types:** `confirmed`, `false-positive`, `accepted-risk`, `fix-planned`, `fix-now`, `wont-fix`

**Workflow:**

1. Collect all unresolved findings from the current session or a previous audit report.
2. For each finding, execute the **Finding Analysis** shared procedure (see `references/finding-analysis.md`): read source → trace data flow → cross-reference project context → invoke `sharp-edges` + `fp-check` → FP gate (3 checks) → "Do Not Report" filters → confidence scoring → classification.
3. **Present assessment to the human.** Always present the full analysis and wait for the human to decide. Never apply fixes before the human chooses `fix-now`.

   If classification is `confirmed` AND the fix meets Fix-Now eligibility criteria (see `references/fix-now-procedure.md`), include a **Proposed Fix** section describing exactly what code changes would be made.

```
## Assessment: Finding #N

**File:** <file:line>
**Severity:** <severity>
**Confidence:** <score>/100
**Classification:** <confirmed|likely-fp|needs-context>

### Analysis
<key observations, data flow, FP gate results (1-2 sentences each)>
<source code observations with file:line references>
<confidence deductions with reasoning>

### Proposed Fix (if fix-now eligible)
**Eligible:** Yes | No (<reason>)
**Files:** <file paths that would be changed>
**Changes:** <description of what would be changed>

### Recommendation
**Suggested decision:** `<decision-type>`
**Rationale:** <why>
```

4. **Wait for human decision** via `AskUserQuestion`. Options must include the recommended decision (marked recommended) plus alternatives. If fix-now eligible, `fix-now` must be listed.
5. **Record the decision and take action:**
   - `fix-now` → execute the **Fix-Now Procedure** (see `references/fix-now-procedure.md`): implement fix, run tests, report result
   - `fix-planned` → note for future work
   - `false-positive` / `wont-fix` → document rationale
   - `accepted-risk` → document rationale and risk acceptance

**Batch mode** (`/security-audit decide` with multiple findings): process in batches of 10 to prevent context exhaustion. Sort by severity (highest first). For each batch:
1. Spawn parallel assessment subagents (read-only — no edits, no ticket writes)
2. Present assessments sequentially (one at a time, human decides each before seeing the next)
3. Register decisions immediately after each
4. Output batch checkpoint summary after each batch of 10

---

### `finding`

Log a single finding from manual code review. The agent reads the source, analyzes it, and reports it.

**Usage:** `/security-audit finding`

**Workflow:**

1. **Gather the finding description** via `AskUserQuestion`:
   - **Title**: short description
   - **Severity**: Critical / High / Medium / Low
   - **File(s) and location**: which file, function, lines
   - **What did you observe?**: the vulnerability description
   - **Impact**: consequence if exploited
   - **Recommendation**: how to fix
   - **Attack scenario**: step-by-step exploit narrative

2. **Run Finding Analysis** (see `references/finding-analysis.md`): read source → FP gate → confidence scoring → classification.

3. **Report the finding** with full analysis context:

```
## Finding Created

**Title:** <title>
**Severity:** <severity>
**Confidence:** <score>/100
**Classification:** <confirmed|false-positive|by-design|needs-human-review>

### Analysis Summary
<FP gate results, confidence deductions, cross-references>

Next step: run `/security-audit decide` to register a decision on this finding.
```

---

### `cycle`

Run a full audit cycle. Orchestrates all commands into a comprehensive security audit.

**Usage:**
- `/security-audit cycle [--scope <path>]` — full cycle
- `/security-audit cycle --deep [--scope <path>]` — full cycle with adversarial reasoning pass

**Workflow:**

**Phase 0 — Context loading.**
1. Read project security documentation (SECURITY.md, THREAT_MODEL.md, or equivalent) if present.
2. Detect project type, language, and available security tooling.

**Phase 1 — Automated analysis** (sequential — findings inform each other):
```
/security-audit entry-points --scope <path>
/security-audit context --scope <path>
/security-audit static --scope <path>
/security-audit review --scope <path>
```

**Phase 1.5 — Adversarial reasoning** (`--deep` only). Spawn a separate agent that:
1. Reads the codebase + context + all findings from Phase 1
2. Ignores all predefined checklists and patterns
3. Asks: "Given what I know about this system's trust boundaries, what attack paths were NOT covered? How would I steal data, escalate privileges, or disrupt service?"
4. Applies the same FP gate and confidence scoring from Finding Analysis
5. Reports additional findings under `### Adversarial Reasoning Findings`

This phase catches logic bugs and economic exploits that structured scanning misses. Deliberately unstructured — the agent reasons freely.

**Phase 2 — Cross-cutting analysis.**
a. If the project implements a specification, run `/security-audit compliance --spec <reference>`
b. For each confirmed finding pattern from Phase 1, run `/security-audit variants --pattern <type>` to find similar vulnerabilities elsewhere

**Phase 3 — Summary report.**

```
## Audit Cycle: Complete

### Findings by Severity
| Severity | Count | Actionable (≥75 confidence) | Low-Confidence |
|----------|-------|----------------------------|----------------|

### Phase Results
| Phase | Command | Findings | Duration |
|-------|---------|----------|----------|

### Adversarial Findings (--deep only)
| ID | File:Line | Issue | Confidence |
|----|-----------|-------|------------|

### Next Steps
- Run `/security-audit decide` to assess and register decisions for all findings
- High-confidence findings: <list with file:line>
- Needs human review: <list with file:line>
```

---

## Rules

1. **Always load project context first.** Read security docs, project structure, and dependency graph before invoking any Trail of Bits skill. Commands that take `--scope` should understand the surrounding architecture, not just the scoped files.
2. **Run Finding Analysis on every finding.** No exceptions. Every finding from `static`, `review`, `finding`, or `cycle` goes through the full procedure in `references/finding-analysis.md` — FP gate, "Do Not Report" filters, confidence scoring, classification.
3. **Apply the False-Positive Gate before recommending fixes.** 3 checks: concrete path, reachable entry, no existing guard. Findings that fail any check are classified `false-positive` without fix recommendations.
4. **Report confidence scores on every finding.** Findings below 75 are flagged as `low-confidence` for human review. They do NOT get fix recommendations.
5. **Never fix without human approval.** `decide` presents recommendations and proposed fixes. Only `fix-now` (chosen by human) triggers the Fix-Now Procedure. The agent never applies fixes preemptively.
6. **Two-track independence.** Track A (`static`, `finding`) and Track B (`cycle`, `review`, `diff`, `variants`) are independent finding-creation tracks. `/security-audit decide` is the shared convergence point.
7. **Deduplicate across commands.** Same file:line + same issue class = one finding. Tag all sources that flagged it.
8. **Confidence is orthogonal to severity.** A Critical finding can have low confidence (probably FP). A Medium finding can have high confidence (definitely real). Don't conflate them.
9. **Scope Trail of Bits skills correctly.** When `--scope` is provided, pass only the relevant files to the skill. Include dependencies for compilation/type-checking context but don't audit them.
10. **Batch decides in groups of 10.** Prevents context exhaustion. Sort by severity. Parallel assessment, sequential human decisions.
