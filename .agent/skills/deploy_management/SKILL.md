---
name: Deployment Management
description: Standard protocol for deploying the application and cataloging releases.
---

# Deployment Management Skill

This skill governs the "Go-Live" process. It ensures every deployment is safe, verified, and traceable.

## 1. The Golden Rules of Deployment
1.  **Never Deploy Broken Code**: Tests (`npm test`) and Build (`npm run build`) must pass locally first.
2.  **Every Deploy is an Event**: A deployment is not just a command; it's a milestone. It must be recorded.
3.  **Traceability**: We must know *when* a version went live and *what* was in it.

## 2. Cataloging Protocol (CHANGELOG)
The `docs/CHANGELOG.md` is our source of truth.

### The Entry Format
Immediately before running the deploy command, append a **Deployment Entry** to the top of the unreleased section (or create a new section).

**Format**:
`[YYYY-MM-DD HH:mm] - 🚀 deploy: <Description of the Release>`

**Examples**:
*   `[2026-02-04 10:00] - 🚀 deploy: Release v1.2.0 - Friends Feature Complete`
*   `[2026-02-04 14:30] - 🚀 deploy: Hotfix for Search Accent Issue`

## 3. The Deployment Checklist
Before running `firebase deploy`:

1.  [ ] **Status Check**: `git status` is clean (or changes are deliberately staged).
2.  **Verification**:
    *   `npm test` (Unit tests pass)
    *   `npm run build` (No compilation errors)
3.  **Documentation**:
    *   `CHANGELOG.md` updated with "🚀 deploy" entry.
4.  **Commit**: Ensure the changelog update is committed.
    *   `git add docs/CHANGELOG.md`
    *   `git commit -m "chore: prepare for deployment"`
5.  **Launch**:
    *   `firebase deploy`
