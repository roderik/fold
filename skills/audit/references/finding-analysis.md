# Finding Analysis Procedure

Shared procedure used by `/audit decide`, `/audit finding`, and `/audit review` to deep-dive a finding before classification. Input: finding data (title, file:line, severity, description, source tool). Output: classification + confidence score + analysis context.

## Procedure

### 1. Read Source Code

Read the actual source at the reported file:line. Load the affected module and its immediate dependencies. Understand the surrounding context (function, class/struct, module boundaries).

### 2. Cross-Reference Project Context

Check whether the finding matches:
- An intentional design pattern documented in project docs
- A known accepted risk
- A documented security assumption or trust boundary

### 3. Check Project Invariants

If the project maintains security invariants (documented in CLAUDE.md, SECURITY.md, THREAT_MODEL.md, or similar), check whether the finding indicates a violation. Invariant violations auto-escalate to Critical severity.

### 4. Invoke Trail of Bits Skills

a. `Skill({ skill: "sharp-edges" })` — check if the finding matches a known footgun pattern
b. `Skill({ skill: "fp-check" })` — verify the finding is not a false positive

### 5. False-Positive Gate (3 checks)

Before generating a fix recommendation, run these mandatory checks. Fail any check → classify as `false-positive`:

| # | Check | Question | Fail → |
|---|-------|----------|--------|
| 1 | **Concrete attack path** | Can you trace input → vulnerable code → harmful state change end-to-end? | Drop: no concrete path |
| 2 | **Reachable entry point** | Can an attacker actually reach this? Check auth guards, middleware, access control, rate limiting. | Drop: unreachable |
| 3 | **No existing guard** | Is there validation, sanitization, auth check, or mitigation that already prevents this? | Drop: already guarded |

If all 3 checks pass → proceed to confidence scoring. If any check fails → classify as `false-positive` with the specific check that failed as justification.

### 6. Apply "Do Not Report" Filters

Skip findings that match these categories — they are noise, not security issues:
- Admin/operator privilege by design (documented roles doing what they're supposed to do)
- Code quality observations without security impact (missing comments, style issues)
- Requires compromising multiple independent security boundaries simultaneously (theoretical)
- Self-contained impact (only affects the attacker's own data/resources)
- Gas/performance micro-optimizations without security implications

Filtered findings are noted as `filtered:<reason>` in analysis output but do NOT get fix recommendations.

**Exceptions to filters:**
- Recovery/admin functions that can drain assets the system needs to fulfill obligations → NOT filtered
- Griefing attacks where attacker harms others but gains nothing → apply griefing deduction instead of filtering

### 7. Confidence Scoring

Start at 100 and apply mechanical deductions:

| Condition | Deduction |
|-----------|-----------|
| Privileged caller required (admin/operator/deployer) | -25 |
| Attack path partial (can't trace exact input → state change → outcome) | -20 |
| Impact self-contained (only affects attacker's own resources) | -15 |
| Impact is griefing (attacker harms others but gains nothing) | -10 |
| Requires compromising multiple independent auth boundaries | -30 |
| Blocked by existing mitigation (partial, not complete) | -20 |
| Pattern is common but rarely exploitable in this language/framework | -10 |

**Additions:**
| Condition | Addition |
|-----------|----------|
| Touches authentication or authorization logic | +10 |
| User-controlled input reaches sensitive operations | +10 |
| Affects data integrity or financial operations | +10 |

**Threshold: 75.** Findings at or above 75 are actionable. Findings below 75 go into the report as `low-confidence` for human review — they do NOT get fix recommendations.

Confidence is orthogonal to severity:
- `[Critical, confidence: 95]` = definitely real, definitely bad → fix now
- `[Medium, confidence: 60]` = might be real, moderate impact → human review
- `[High, confidence: 40]` = probably not real despite seeming bad → likely FP

### 8. Classification

Based on FP gate, filters, and confidence scoring, classify the finding:

| Classification | Meaning |
|----------------|---------|
| `confirmed` | FP gate passed, confidence >= 75, concrete vulnerability |
| `false-positive` | FP gate failed or tool analysis incorrect |
| `by-design` | Matches documented intentional pattern |
| `filtered` | Matched a "Do Not Report" filter |
| `needs-human-review` | Ambiguous — could go either way |

Final output per finding: `classification` + `confidence` + `analysis summary`.
