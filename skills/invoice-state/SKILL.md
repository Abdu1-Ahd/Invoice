---
name: Invoice State Rules
description: Enforces Zustand best practices. Slice state by feature. Prevent global re-render.
---

# Invoice State Management (Zustand)

## Why exist
Single global state object bad. Cause whole app re-render when type single character.

## Philosophy
State live close to use. Zustand for complex cross-component state only. Must slice by feature.

## Rules
1. **Multiple Stores:** No create `useAppStore`. Create `useCustomerStore`, `useInvoiceStore`, `useSettingsStore`.
2. **Selector Usage:** Always use selector. Extract state prevent unnecessary re-render.
3. **No Form State Zustand:** Do NOT put form input (typing name) in Zustand. Use React Hook Form. Commit to Zustand/IndexedDB only on success submit.
4. **Hydration Handlers:** Data from IndexedDB async. Store must have `init()` or `load()` action. Handle loading state graceful.

## Bad Practices
```javascript
// BAD: Destructure whole store cause re-render anytime anything change
const { customers, loading, fetchCustomers } = useCustomerStore();
```

## Good Practices
```typescript
// GOOD: Use selectors
const customers = useCustomerStore((state) => state.customers);
const fetchCustomers = useCustomerStore((state) => state.fetchCustomers);
```

## Review Checklist
- [ ] State genuine share across feature? (If no, use `useState`).
- [ ] Use React Hook Form instead Zustand for draft form?
- [ ] All state read use selector?
