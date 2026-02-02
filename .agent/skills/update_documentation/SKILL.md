---
name: Update Documentation
description: Routine for keeping the documentation ecosystem alive and synchronized.
---

# Update Documentation Skill

This skill ensures that "Documentation is Alive" (Handbook Rule 1). It transforms documentation from a static chore into a dynamic reflection of the code's truth.

## 1. Context Analysis (The "What Changed?" Step)
Before writing anything, analyze the recent changes to determine the SCOPE of the documentation update.
*   **Run**: `git status` or `git diff --name-only` to see modified files.
*   **Map**: Use the following table to identify which documents need attention:

| Modified Files | Target Documentation |
| :--- | :--- |
| `src/components/ui/*`, `tailwind.config.js` | `docs/style-guide.md`, `docs/design-system-components.md` |
| `src/services/*`, `src/utils/*`, `src/hooks/*` | `docs/business-rules.md` |
| `src/routes/*`, `src/features/*` | `docs/page-inventory.md`, `docs/business-rules.md` |
| `package.json` | `docs/dependency-map.md` |
| *Any code change* | `docs/CHANGELOG.md` |

## 2. Execution Protocol

### A. Business Logic Updates (`docs/business-rules.md`)
*   **Goal**: Ensure the "Rules" section reflects the *actual* code logic.
*   **Action**: If a calculation, validation, or flow changed, locate the specific rule ID or section and simple **rewrite it**. Do not append conflicting info.
*   **Critical**: If a rule was *removed* from code, remove it from docs.

### B. UI & Design System (`docs/style-guide.md`)
*   **Goal**: Keep the Design System as the source of truth for UI patterns.
*   **Action**:
    1.  If a new core component was added, add a brief usage entry in "Componentes de UI".
    2.  If a token changed (e.g., color, spacing), update the "Paleta de Cores" or "Tipografia".
    3.  **Visual Check**: If a pattern creates a visual regression in docs (e.g., text referring to a blue button that is now yellow), fix it immediately.

### C. Application Structure (`docs/page-inventory.md`)
*   **Goal**: Maintain a map of the app's surface area.
*   **Action**:
    1.  **New Route**: Add the URL, Component Name, and Purpose.
    2.  **Deleted Route**: Mark as [DEPRECATED] or remove.

### D. Dependencies (`docs/dependency-map.md`)
*   **Goal**: Track architectural complexity.
*   **Action**: Only update if a *major* store, service, or external library was added/removed.

### E. Changelog (`docs/CHANGELOG.md`)
*   **Mandatory**: Every significant task completion MUST have an entry.
*   **Format**: `[YYYY-MM-DD HH:mm] - type: Description`.
    *   `feat`: New features.
    *   `fix`: Bug fixes.
    *   `refactor`: Code changes without behavior change.
    *   `ui`: Visual updates.
    *   `docs`: Documentation only.
*   **Example**: `[2026-01-27 15:30] - feat: Added Motion System to Button and Card components.`

## 3. Verification (Self-Correction)
After updating the docs, perform a quick "Sanity Check":
1.  **Consistency**: Does `business-rules.md` contradict the code I just wrote?
2.  **Links**: Did I break any internal links (e.g., `[See Rule 12]`)?
3.  **Clarity**: Is the new documentation readable for a non-technical stakeholder?

> [!TIP]
> If you find a discrepancy between Code and Docs, **Code is Truth**. Update Docs to match Code immediately.
