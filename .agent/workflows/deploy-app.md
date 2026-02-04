---
description: Standard workflow to deploy the application safely.
---

# Deploy App Workflow

This workflow implements the protocol defined in `skills/deploy_management/SKILL.md`.

## Step 1: Pre-flight Checks
Ensure your workspace is clean and ready.

1. Check git status.
   - Run: `git status`
   - **Instruction**: Ensure there are no unexpected uncommitted changes.

## Step 2: Verification
Prove that the code works.

// turbo
2. Run Unit Tests.
   - Run: `npm test run` (using `run` to avoid watch mode)

// turbo
3. Run Build Verification.
   - Run: `npm run build`

## Step 3: Cataloging
Record this event in history.

4. Update Changelog.
   - **Instruction**: Add a new entry to the top of the unreleased section in `docs/CHANGELOG.md`.
   - Format: `[YYYY-MM-DD HH:mm] - 🚀 deploy: <Short Description>`
   - Example: `[2026-02-04 15:00] - 🚀 deploy: Release v1.0.1 - Bug fixes`

5. Commit the Catalog Entry.
   - Run: `git add docs/CHANGELOG.md`
   - Run: `git commit -m "chore: catalog deploy"`

## Step 4: Launch
Push to production.

// turbo
6. Deploy to Firebase.
   - Run: `firebase deploy`

## Step 5: Post-Launch
Sync with repository.

7. Push to GitHub.
   - Run: `git push`
