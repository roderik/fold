---
description: Create a well-structured GitHub pull request for the current branch
allowed-tools: Bash(git:*), Bash(gh:*), Read, Glob, AskUserQuestion, Skill
argument-hint: [base-branch]
---

# Create Pull Request

Create a GitHub pull request for the current branch. If a base branch argument is provided, use it. Otherwise default to `main`.

## Steps

1. **Gather context** — run these in parallel:
   - `git status` to check for uncommitted changes
   - `git log --oneline main..HEAD` (or the provided base branch) to see all commits on this branch
   - `git diff main...HEAD --stat` to see which files changed
   - `git rev-parse --abbrev-ref HEAD` to get the current branch name
   - Check if the branch has a remote tracking branch: `git rev-parse --abbrev-ref @{upstream} 2>/dev/null`

2. **Handle uncommitted changes** — if there are uncommitted changes, ask the user if they want to commit first before creating the PR. Do not proceed until the working tree is clean.

3. **Read the diffs** — run `git diff main...HEAD` (using the base branch) to understand the actual changes. For large diffs, read the most important files individually.

4. **Draft the PR** — based on the commits and diffs, draft:
   - **Title**: short, under 70 characters, describing the change (not the branch name)
   - **Summary**: 1-3 bullet points of what changed and why
   - **Test plan**: how to verify the changes work

5. **Show the draft to the user** — present the title and body. Ask if they want to adjust anything before creating.

6. **Push and create** — run these sequentially:
   - Push the branch: `git push -u origin HEAD`
   - Create the PR:
     ```
     gh pr create --title "the title" --body "$(cat <<'EOF'
     ## Summary
     - bullet points

     ## Test plan
     - [ ] verification steps
     EOF
     )"
     ```

7. **Report** — show the PR URL to the user.

8. **Next steps** — loop until the user is done:

   Use `AskUserQuestion` with these options:
   - **Run /plannotator-review** — interactive code review before merge
   - **Run /autofix-pr** — hand off CI watching and review resolution to the cloud
   - **Run /wrap-up** — session summary and handoff notes
   - **Done** — no more shipping steps needed

   When the user picks a skill, invoke it with the `Skill` tool (e.g. `Skill({ skill: "plannotator-review" })`), then loop back and ask again. Stop looping when the user picks "Done".
