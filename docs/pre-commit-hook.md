# Pre-Commit Hook: File Size Limit

## 📋 Overview

A pre-commit hook has been installed at `.git/hooks/pre-commit` to **prevent committing files with more than 250 lines**.

This enforces the componentization principle and keeps the codebase maintainable.

## 🔍 How It Works

1. **Triggers**: Automatically runs before every `git commit`
2. **Checks**: All staged `.js`, `.jsx`, `.ts`, `.tsx` files
3. **Blocks**: Commit if any file exceeds 250 lines
4. **Reports**: Lists all violating files with their line counts

## ✅ Example Output (Blocked Commit)

```bash
❌ COMMIT BLOCKED: The following files exceed the 250 line limit:

  - src/pages/MyAgenda.jsx (444 lines)
  - src/pages/Home.jsx (332 lines)
  - src/components/BlockCard.jsx (288 lines)

💡 Please refactor these files into smaller components before committing.
   See .agent/skills/componentization for guidance.
```

## 🧪 Testing the Hook

To test if the hook is working:

```bash
# Try to commit a large file
echo "test" >> src/pages/MyAgenda.jsx
git add src/pages/MyAgenda.jsx
git commit -m "test: should be blocked"

# Should see the block message above
```

## 🚨 Emergency Override (Use Sparingly!)

If you **absolutely must** commit a large file (e.g., emergency hotfix):

```bash
git commit --no-verify -m "emergency: description"
```

**⚠️ Warning**: Only use `--no-verify` in true emergencies. Document why in the commit message.

## 📊 Current Violations

As of 2026-02-03, these files need refactoring:

| File | Lines | Priority |
|------|-------|----------|
| `src/pages/MyAgenda.jsx` | 444 | High |
| `src/pages/Home.jsx` | 332 | High |
| `src/components/BlockCard.jsx` | 288 | Medium |

**Action**: These files are grandfathered in but should be refactored when touched.

## 🛠️ How to Refactor

See `.agent/skills/componentization/SKILL.md` for detailed guidance on:
- Extracting components
- Separating concerns
- Creating reusable UI elements

## 🔄 Updating the Hook

The hook is located at `.git/hooks/pre-commit`. To modify:

1. Edit the file
2. Ensure it remains executable: `chmod +x .git/hooks/pre-commit`
3. Test with a dummy commit

## 📝 Notes

- The hook counts **all lines** (including comments and whitespace)
- Only checks **staged files** (not entire repo)
- Runs **locally** (not enforced on GitHub, but CI could be added)
- Does **not** check test files (`*.test.js`) - they can be longer

---

**Created**: 2026-02-03  
**Last Updated**: 2026-02-03
