---
name: Invoice Architecture Rules
description: Enforces Feature-Sliced Design dependency rules. Layer isolation. Folder rules.
---

# Invoice Architecture (Feature-Sliced Design)

## Why exist
Without boundaries, React app becomes Big Ball of Mud. Skill defines file location. When make folder. Who import who.

## Explicit Dependency Rules

Dependency flow strict one direction. Layer import only from below.
1. `app` (Highest) - Import anything.
2. `features` - Import `domain`, `core`, `shared`.
3. `domain` - Import `core`, `shared`.
4. `core` - Import `shared`.
5. `shared` (Lowest) - Import nothing above.

**Forbidden Imports:**
- ❌ `features/invoices` import `features/customers`. (Features siblings. Must isolate).
- ❌ `shared/components` import `features/invoices`. (Shared code dumb. No business logic).
- ❌ `domain` import `features`. (Data schemas no know UI).

**Why rule exist:** Strict DAG (Directed Acyclic Graph) stop circular dependency. Stop tight coupling. Safe delete `features/invoices` without break `features/customers` or `shared`.

## Folder Organization

### New feature folder when?
Feature become folder in `src/features/` when represent distinct business domain (Inventory, Expenses). Has own state, component, API logic.

### Stay local when?
Keep component, hook, utility local in `src/features/*/components` until explicitly needed by other feature. Premature move to `shared/` cause bloat.

### Move to `shared` when?
Move to `src/shared/` only when genuinely agnostic of business domain. Used by two or more features.
- Example: Custom `<SelectBox />` used in Invoices and Customers. Belong `shared`.
- Example: `<InvoiceStatusBadge />` used multiple times in invoices. Belong `features/invoices/components`.

### Folder Entropy
Feature too large? Split. If `invoices` grow distinct sub-domains (`invoice-templates`, `invoice-recurring`), split to sibling features (`features/templates`, `features/recurring_invoices`). Maintain cohesion.

## Review Checklist
- [ ] Imports obey strict downward direction?
- [ ] Feature strictly isolated? Can delete without break app?
- [ ] Absolute imports correct?
- [ ] Code moved to `shared/` prematurely? Revert.
