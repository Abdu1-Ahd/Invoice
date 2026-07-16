---
name: Invoice Abstraction Rules
description: Defines WET vs DRY philosophy. Abstraction rules. Harmful abstraction prevention.
---

# Rules for Abstraction

## Why exist
Premature abstraction bad. Cause rigid code. Component with 25 props evil.

## Philosophy
Intentional duplication beat accidental complexity. Follow Rule of Three: duplicate code three times before abstract.

## Rules

### 1. Abstract when
- Math pure. Domain-agnostic. Example: currency formatting.
- UI structure identical. Content only different. Example: Button.
- Security risk big. Data integrity risk big. Example: IndexedDB init.

### 2. Duplicate when (WET Code)
WET (Write Everything Twice) better than DRY wrong thing.
- `InvoiceList` and `CustomerList` look same today. Data models diverge tomorrow. Duplicate list layout. No `GenericList`.

### 3. Shared hooks
Create shared hook only for Browser APIs, DOM events, generic React.
- **Good:** `useMediaQuery`, `useClickOutside`, `useLocalStorage`.
- **Bad:** `useFetchData` (Too generic. Hides repository). `useFormWithValidation` (React Hook Form do this. Do not wrap).

### 4. Future needs
Reject "just in case" abstractions. Build now for now.
- *Exception:* Storage Repository Pattern. Cloud Sync coming. Complex business need guaranteed. Build Repo now.

## Review Checklist
- [ ] Component use too many boolean flags (`isInvoice`, `hideHeader`)? Duplicate it.
- [ ] Abstracted domain logic? Diverge future? Revert.
