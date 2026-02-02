---
name: GitHub Interaction
description: Standard procedure for committing and pushing changes.
---

# GitHub Interaction Skill

## CRITICAL: Changelog First (MANDATORY)

**BEFORE** committing, you MUST update `docs/CHANGELOG.md`:

-   **Format**: `[YYYY-MM-DD HH:mm] - <Commit Message>`
-   **Example**: `[2026-01-19 09:35] - feat: Add user authentication`
-   **Rule**: NEVER skip the Date and Time. This is NON-NEGOTIABLE.

## 1. Pre-Commit Review
-   **Review**: Run `git status` and `git diff --stat`.
-   **Clean**: Ensure no unwanted files (logs, temp) are staged.

## 2. Commit & Push
1.  Update `docs/CHANGELOG.md` with timestamped entry (see above).
2.  Stage changes: `git add .`
3.  Commit: `git commit -m "feat/fix: <description>"`
    -   Use conventional commits.
4.  Push: `git push`
