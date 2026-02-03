---
name: Test Application
description: Protocol for preventing regressions using Vitest, React Testing Library, and Snapshot Testing.
---

# Test Application Skill (Regression Prevention)

This skill ensures that the application is verified through automated tests (`vitest`) with a strict focus on **preventing regressions**.

## 1. When to Use
-   **Always**: Run tests *before* pushing any code.
-   **New Features**: Write tests *alongside* the feature (TDD style preferred).
-   **Refactoring**: **CRITICAL**. Run tests *before* you start to establish a baseline, and *after* to ensure green.
-   **UI Changes**: Use Snapshot Testing to catch unintended visual structure changes.
-   **Force Automated Tests**: **MANDATORY**. If a feature or component does not have automated tests, they **MUST** be created as part of the task. Never assume a project is "too simple" for tests.

## 2. The Golden Rule of Regressions
> "If it's not tested, it's broken."

1.  **Baseline**: Run `npm test` *before* touching legacy code. If it fails, fix the test or the code *first*.
2.  **Implementation**: Make your changes.
3.  **Verification**: Run `npm test` again.
    -   If a test fails -> **REGRESSION**. Fix it immediately.
    -   If a snapshot fails -> **Check Diff**. Is the change intentional? Update snapshot (`u` key).

## 3. Execution Commands
-   **Run All Tests**: `npm test` (Runs in watch mode, press `q` to quit).
-   **Run Single Run (CI style)**: `npm run test:once` (or `npx vitest run`).
-   **Update Snapshots**: `Press 'u'` in watch mode or `npx vitest -u`.
-   **Filter Tests**: `npm test -- -t "ComponentName"` (Run only tests matching string).
-   **UI/E2E**: Dependendo do projeto, pode ter Cypress ou Playwright. Verifique `package.json`.

## 4. Testing Strategies

### A. Unit Logic (Utils/Hooks)
-   Test all branches (if/else).
-   Test edge cases (empty arrays, null values, undefined).

### B. UI Components (Visual Regression Prevention)
-   **Snapshot Testing**: Use `toMatchSnapshot()` to lock the component's structure.
    ```tsx
    it('renders correctly', () => {
        const { asFragment } = render(<MyComponent />);
        expect(asFragment()).toMatchSnapshot();
    });
    ```
-   **Interaction Testing**: Use `userEvent` to simulate clicks/typing.
    ```tsx
    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(onSubmit).toHaveBeenCalled();
    ```

### C. Testing Animations (Framer Motion)
Animations often break tests due to async behavior or DOM updates.
-   **Strategy**: Mock `framer-motion` or skip animations in testing environment.
-   **Mock**:
    ```tsx
    // setupTests.ts or at top of test file
    vi.mock('framer-motion', () => ({
        motion: {
            div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
            // ... mock other elements as needed
        },
        AnimatePresence: ({ children }: any) => <>{children}</>,
    }));
    ```

## 5. Directory Structure
-   Place tests **next to the source file**:
    -   `src/components/MyButton.tsx`
    -   `src/components/MyButton.test.tsx`

## 6. Verification Checklist
-   [ ] Run `npm test` -> All green?
-   [ ] Did I add a new feature? -> Added new test case?
-   [ ] Did I fix a bug? -> Added regression test case?
-   [ ] Did I change UI? -> Updated snapshots?
