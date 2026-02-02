---
name: Check Golden Rules
description: Protocol for complying with the 'Golden Rules' (Psychological Safety & JTBD).
---

# Check Golden Rules Skill

This skill enforces the product philosophy defined in `docs/golden-rules.md`.
*"O job principal não é fazer o dinheiro sobrar. É conseguir olhar para o dinheiro sem precisar fugir."*

## 1. When to Use
-   **Designing Features**: Before code, checking the "Why".
-   **Writing Copy**: Empty states, Error messages, Onboarding.
-   **Reviewing Logic**: Does this flow punish the user?

### Companion Skill
-   **Clarify Requirements**: Use these together. Often, a vague request ("Make it better") needs both clarification AND a Golden Rule check to ensure the "better" isn't "more stressful".

## 2. The Psychology Checklist

### A. The "Judgement Test" (Push vs Pull)
-   [ ] **Does it blame?**: Avoid "You failed" or strict red alerts.
-   [ ] **Does it tolerate gaps?**: If the user skips a month, does the app look broken? (It shouldn't).
-   [ ] **Does it demand perfection?**: Avoid "Complete your profile to continue".

### B. Empty States as Education
-   [ ] **Not just "Empty"**: Does it explain *why* this screen exists?
-   [ ] **First Step**: Is there a clear, low-friction action?
-   [ ] **No Guilt**: Avoid "You haven't added anything yet :(".

### C. Error Messages as Conversation
-   [ ] **Partnership**: "Thanks for helping us fix this" vs "Error 500".
-   [ ] **Validation**: If they chose a manual/hard path, validate that choice.
-   [ ] **No "Sorry for the inconvenience"**: Be human, not a robot.

## 3. The Golden Rule Check
Ask yourself:
1.  **Does this make the user look at their money MORE?** (Correct)
2.  **Does this make the user want to flee?** (Wrong)
3.  **Does this make them feel evaluated?** (Wrong)

## 4. Output
-   A specific validation that the feature/copy meets the "Non-Judgemental" standard.
-   If it fails, propose a "Psychological Refactor" (e.g., changing copy from "Missing Data" to "Ready for a Fresh Start").
