---
description: Add or update Fold workflow configuration in the current project's CLAUDE.md
allowed-tools: Read, Edit, Write, Glob, AskUserQuestion
---

# Fold Setup

Add or update the Fold workflow configuration in this project's CLAUDE.md file.

The canonical source of the workflow configuration is the Fold plugin's own `CLAUDE.md`, located at the root of this plugin's repository (the same directory that contains `commands/`, `skills/`, and `README.md`).

## Steps

1. Check if a `CLAUDE.md` exists in the current working directory. If not, create one.

2. Read the current project `CLAUDE.md` and the plugin's canonical `CLAUDE.md`.

3. Check if Fold configuration is already present by looking for the string `RESEARCH  →  PLAN  →  IMPLEMENT  →  VERIFY  →  REVIEW  →  SHIP` in the project's `CLAUDE.md`.

4. **If not present**: append the full content of the plugin's `CLAUDE.md` to the end of the project's `CLAUDE.md` (preserve all existing content).

5. **If already present**: compare each section (identified by `## ` headings) between the project's Fold configuration and the plugin's canonical version. For any section where the content differs, replace the project's version with the canonical version. Do not touch sections in the project's `CLAUDE.md` that are not part of the Fold configuration. Report which sections were updated.

6. Tell the user the result:
   - If freshly added: "Fold workflow configured in CLAUDE.md. Run `/teach-impeccable` to set up design context for this project."
   - If updated: list the sections that changed.
   - If already up to date: "Fold configuration is already up to date."
