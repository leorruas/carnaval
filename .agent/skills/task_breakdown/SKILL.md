---
name: Task Breakdown
description: Methodology for decomposing complex user requests into atomic, verifiable, and granular tasks.
---

# Task Breakdown Skill

This skill provides a systematic approach to decomposing high-level user requests into small, manageable units of work.

## 1. Principles of Atomic Breakdown
- **Granularity**: Each task should represent a single, focused change. If a task takes more than 10-20 minutes to implement, it should likely be broken down further.
- **Independence**: Tasks should be as independent as possible, although some sequence is natural.
- **Verifiability**: Every task MUST have a clear way to verify it's done (e.g., "Run test X", "Check UI element Y").
- **No Ambiguity**: Avoid vague terms like "Implement", "Fix", or "Improve" without context. Use specific verbs: "Create", "Refactor", "Add", "Update", "Delete".

## 2. Deconstruction Process
1. **Identify Components**: List all files, modules, or services affected by the request.
2. **Sequential Logic**: Determine the order of operations (e.g., Database -> Logic -> UI).
3. **Draft Atomic Steps**:
   - Instead of: "Redesign Agenda Page"
   - Use:
     - [ ] Create `MyAgenda.test.jsx` for legacy snapshot.
     - [ ] Refactor `MyAgenda` header to use `motion.header`.
     - [ ] Implement `countdown-card` component for the "Next Block" section.
     - [ ] Update "Share" button styling to match `BottomNav`.

## 3. Formatting the `task.md`
Use the following structure in the `task.md` artifact:
- Use `[ ]` for pending, `[/]` for in-progress, and `[x]` for completed.
- Use sub-bullets for related sub-tasks.
- Include `<!-- id: X -->` for tracking.

## 4. Verification Requirements
Each atomic task in the `task.md` must be followed by a verification step in the planning phase. If no automated test exists, the breakdown MUST include a task to CREATE the test.

## 5. Integration with Planning
The Task Breakdown output directly feeds into the `implementation_plan.md` and the initial `task.md`.
