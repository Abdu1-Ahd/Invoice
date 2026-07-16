---
name: Invoice Component Rules
description: Enforces separation between dumb UI components and smart feature components.
---

# Invoice Components (Smart vs Dumb)

## Why exist
UI components coupled to business logic impossible reuse. Business components polluted with styling logic impossible read. Separate them.

## Philosophy
Two strict component categories:
1. **Shared/Dumb Components:** Live `src/shared/components`. Know nothing about "Invoices" or "Customers". Know only props (`title`, `onClick`, `isOpen`).
2. **Feature/Smart Components:** Live `src/features/*/components`. Wired to domain. Read Zustand stores. Render Dumb components.

## Rules
1. **No Domain Logic in Shared:** `<Button />` or `<Card />` in `src/shared` never import `useCustomerStore`. Never reference domain type `Invoice`.
2. **Tailwind Abstraction:** Shared components encapsulate Tailwind classes. No force consumer pass 20 Tailwind classes for primary button. Use `tailwind-merge` and `clsx` (`cn()` utility) allow class override safely.
3. **Prop Spreading:** Shared components extend HTML element props. (e.g., `interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>`).

## Review Checklist
- [ ] Component highly reusable across different features? -> Put `shared`.
- [ ] Component require specific business entity knowledge? -> Put `features`.
- [ ] Tailwind classes merged safely use `cn()`?
