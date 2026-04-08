# Fix-Now Procedure

When the human chooses `fix-now` as their decision, the agent implements the proposed fix. This is an explicit human choice — the agent never applies fixes without the human selecting `fix-now`.

## Eligibility Criteria

All must be true (checked during assessment to determine if `fix-now` is offered):
- Decision type is `fix-now`
- The fix is **simple and surgical** — a targeted code change, not an architectural redesign
- The finding has a clear, specific recommendation (e.g., "add input validation", "use parameterized query", "add auth check")
- The fix is localized (affects 1-3 files, not cross-cutting refactors)
- The affected code is in the current working tree (not in external dependencies)

## Skip Fix-Now (go straight to fix-planned)

When:
- The recommendation says "redesign", "refactor", "migrate", or "restructure"
- The fix requires adding new modules, interfaces, or changing architecture
- The fix requires understanding external systems or deployment procedures
- The fix involves changing public APIs with downstream consumers across multiple modules
- The finding is about a missing architectural pattern (e.g., "implement rate limiting across all endpoints")

## Procedure

1. **Read affected source code.** Load the module(s) and function(s) mentioned in the finding. Read existing tests for the affected code.

2. **Implement the fix.** Apply the recommendation from the finding:
   - Edit the source file(s) with the minimal change that addresses the vulnerability
   - Follow existing code style and patterns
   - Do NOT introduce unrelated changes, refactors, or improvements

3. **Add or update tests.** Write test(s) that:
   - Verify the fix prevents the attack scenario described in the finding
   - Do not break existing test assertions
   - Follow the project's existing test patterns

4. **Verify the fix.** Run the project's build and relevant tests (see Verification tiers in workflow skill).

5. **Classify the result:**

   | Outcome | Action |
   |---------|--------|
   | Build + tests pass | Fix succeeded — report changed files and test results |
   | Build fails | Revert all changes, mark as fix-planned, report build error |
   | Tests fail | Revert all changes, mark as fix-planned, report test failure |
   | Fix too complex (> 3 files or architectural) | Skip, mark as fix-planned, explain complexity |

## What Fix-Now Does NOT Do

- Cross-cutting refactors
- Changes requiring new deployments or migration scripts
- Fixes requiring understanding business requirements not in the codebase
- Changes to external dependencies or interfaces
