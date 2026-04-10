# Fix-Now Procedure

Only use this procedure after the human explicitly chooses `fix-now` or explicitly asks for remediation of a specific audit finding.

## Eligibility

All of these must be true:

- the finding is `confirmed`
- the remediation is small and surgical
- the recommendation is specific
- the work is localized to one to three files
- the affected code is in the current repository and working tree

If any condition fails, recommend `fix-planned` instead.

## Skip Fix-Now

Do not attempt fix-now when the change requires:

- redesign or architectural restructuring
- new modules or broad interfaces
- deployment or migration choreography
- downstream API coordination across multiple subsystems
- new global patterns such as rate limiting or permission architecture

## Procedure

1. Re-read the affected code and tests.
2. Implement the smallest fix that blocks the confirmed attack path.
3. Add or update tests that prove the vulnerability is blocked.
4. Run the relevant verification commands.
5. Report the exact files changed and the verification result.

## Allowed Outcome States

| Outcome | Action |
|---|---|
| fix verified | report success with changed files and tests |
| build or tests fail | stop, report failure, recommend `fix-planned` |
| remediation grows beyond the fix-now envelope | stop, recommend `fix-planned` |

## Constraints

- no opportunistic cleanup
- no unrelated refactors
- no changes to external dependencies unless the finding is explicitly about that dependency
- no silent rollback of other in-flight user changes
