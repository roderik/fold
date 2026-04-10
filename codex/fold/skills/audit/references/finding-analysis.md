# Finding Analysis Procedure

Use this procedure for `$audit decide`, any deep-dive on a single finding, and any review result that looks exploitable but still needs confirmation.

Input:

- title
- file and line
- severity hypothesis
- description
- source tool or review path

Output:

- classification
- confidence score
- concise analysis summary

## Procedure

### 1. Read the code

Read the reported location, then the surrounding module, callers, callees, and relevant tests. Do not classify from tool output alone.

### 2. Cross-check project context

Check whether the candidate finding conflicts with:

- `AGENTS.md`
- `SECURITY.md`
- `THREAT_MODEL.md`
- architecture or design docs
- accepted-risk documentation

If the behavior is intentional and documented, classify it as `by-design` or `accepted-risk`, not a vulnerability.

### 3. Check invariants

If the repository defines security invariants, verify whether the finding violates one. Invariant violations should be escalated in severity even if exploitability is still being evaluated.

### 4. Use supporting skills where helpful

If the language or codebase fits, use the synced Trail of Bits analysis skills already present in `codex/fold/skills`, especially:

- `trailofbits-sharp-edges`
- `trailofbits-audit-context-building`
- `trailofbits-variant-analysis`

Treat those skills as supporting evidence, not as a replacement for reading the code.

### 5. False-positive gate

All three checks must pass before you recommend a fix:

| Check | Question | Failure result |
|---|---|---|
| Concrete attack path | Can you trace attacker-controlled input to a harmful state change or leak | classify `false-positive` or `needs-human-review` |
| Reachable entry point | Can an attacker actually reach the code given current auth, middleware, and deployment assumptions | classify `false-positive` |
| No effective existing guard | Is there already validation, sanitization, permissioning, or containment that blocks exploitation | classify `false-positive` |

If any check fails, explain why and stop short of a remediation recommendation.

### 6. Apply do-not-report filters

Do not elevate noise into findings. Filter out:

- intended admin or operator powers used as designed
- code quality issues without security impact
- purely theoretical chains that require breaking multiple independent boundaries first
- self-harm only behavior with no broader system impact
- micro-optimizations framed as security problems without evidence

Exception: if an admin or recovery action can violate obligations to other users, keep it in scope.

### 7. Score confidence

Start at 100 and apply deductions:

| Condition | Deduction |
|---|---|
| privileged caller required | -25 |
| attack path only partial | -20 |
| impact is self-contained | -15 |
| impact is griefing only | -10 |
| multiple boundaries must already be compromised | -30 |
| a partial mitigation already exists | -20 |
| pattern is common noise in this stack | -10 |

Apply additions:

| Condition | Addition |
|---|---|
| affects auth or authorization | +10 |
| user-controlled input reaches a sensitive sink | +10 |
| affects integrity, assets, or privileged state | +10 |

Interpretation:

- `>= 75`: actionable
- `60-74`: plausible but needs human review
- `< 60`: low confidence, do not recommend a fix

### 8. Classify

Use one of:

- `confirmed`
- `false-positive`
- `by-design`
- `accepted-risk`
- `filtered`
- `needs-human-review`

Report the classification, confidence, and the shortest defensible explanation.
