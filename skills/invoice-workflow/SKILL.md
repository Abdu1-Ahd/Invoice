---
name: Invoice Workflow Rules
description: Defines engineer operation. Tech debt handling. Definition "Done".
---

# Engineering Workflow

## Why exist
Multiple engineer work over time cause drift. Skill enforce uniform standard. Prevent spaghetti code.

## Philosophy
Think like Principal Engineer. No blind execute task. Challenge bad architecture. Propose good alternative. Execute.

## Rules
1. **Always Check Foundation:** Before add feature, read `GEMINI.md` and `skills/`. Repository teach you think.
2. **Refuse Premature Optimization:** No cache, memoization, complex abstraction. Wait for profiling (`invoice-performance`).
3. **Refuse Tech Debt:** Break FSD? Synchronous logic in `localStorage`? Push back. Do right or no do.
4. **Refactor Protocol (Boy Scout):** Touch bad file (missing Zod)? Fix it. Leave codebase better.
5. **Definition "Done":**
   - Slice correct in `src/features`.
   - Data flow async Repository.
   - Typed (TypeScript) and validated (Zod).
   - UI match design system (`invoice-design-system`).
   - Pass review (`invoice-review`).

## Review Checklist
- [ ] Challenge user bad architecture request?
- [ ] Leave codebase clean?
- [ ] Feature truly "Done"?
