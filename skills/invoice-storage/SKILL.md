---
name: Invoice Storage Rules
description: Enforces Repository Pattern, IndexedDB, UUID, Cloud Sync readines.
---

# Invoice Storage (Offline-First)

## Why exist
Data persistence hardest problem. Transition Local to Cloud Sync future. Tie UI to `localStorage`? Future rewrite catastrophic.

## Philosophy
Treat local browser storage as remote database. Asynchronous. Can fail. Hide detail behind interface.

## Rules
1. **Never use localStorage direct:** Primary data (Invoice, Customer) never use `localStorage`. Synchronous. Blocking. Tiny 5MB limit. PDF break it. Use IndexedDB (`localforage` or `idb`).
2. **Repository Pattern:** Create `CustomerRepository`, `InvoiceRepository` in `src/core/storage`. Expose `save()`, `findAll()`, `findById()`.
3. **UUID Mandatory:** All ID use `uuid` (v4). No auto-increment integer. Prevent sync collision.
4. **Timestamps:** Every entity must have `createdAt`, `updatedAt`, `deletedAt` (soft delete). Strict require for future Cloud Sync conflict resolution.
5. **Zod Parsing:** Pull data from IndexedDB? Pass through Zod schema. Ensure data integrity.

## Bad Practices
```javascript
// BAD: Direct couple local storage. No validation. Synchronous. Auto-increment ID.
const saveCustomer = (customer) => {
  const current = JSON.parse(localStorage.getItem('customers')) || [];
  customer.id = current.length + 1; // TERRIBLE: Collisions on sync
  localStorage.setItem('customers', JSON.stringify([...current, customer]));
}
```

## Good Practices
```typescript
// GOOD: Asynchronous. Interface. UUID. Validation.
class IndexedDBCustomerRepository implements CustomerRepository {
  async save(customer: UnsavedCustomer): Promise<Customer> {
    const validData = CustomerSchema.parse({
      ...customer,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    await idb.put('customers', validData);
    return validData;
  }
}
```

## Review Checklist
- [ ] UUID used for all ID?
- [ ] `createdAt` and `updatedAt` present/updated?
- [ ] Storage layer decouple from React?
