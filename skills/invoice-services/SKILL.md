---
name: Invoice Services Rules
description: Defines service, business logic ownership, decouple logic from React.
---

# Services Engineering

## Why exist
Business logic (calculate total, generate PDF) in React Component or `useEffect` bad. Impossible test. Impossible reuse. Susceptible React bug.

## Philosophy
React rendering engine. Not business engine. **Services** own business logic. Plain TypeScript function/class. Know nothing about DOM, Hook, React context.

## Rules

### 1. What qualifies Service?
Module perform specific business operation.
- `PdfGenerationService`: Take `Invoice` return Blob.
- `CalculationService`: Take line item return subtotal.
- `BackupService`: Orchestrate Repository read and zip data.

### 2. Pure vs Impure
- **Pure Services:** Same input, same output. No read DB. No write DB. Example: `CurrencyFormatter`, `TaxCalculator`. Belong `src/features/*/utils` or `src/core/utils`.
- **Impure Services (Orchestrators):** Interact Repository or API. Example: `InvoiceGenerationService` (save DB, generate PDF). Belong `src/features/*/services`.

### 3. Strict Decoupling
Service **never** import `React`, `useState`, `useEffect`. Service need state? React Component extract state, pass to service as argument.

### 4. Dependency Injection
Impure service rely Repository? No hardcode repository instance. Pass repository as dependency (constructor/argument). Allow mock repository in test.

## Bad Practices
```javascript
// BAD: Business logic trapped inside React component
const InvoiceForm = () => {
  const [items, setItems] = useState([]);
  
  // Logic trapped! No reuse. No test without DOM.
  const total = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  
  return <div>{total}</div>;
}
```

## Good Practices
```typescript
// GOOD: Logic extracted to pure service/util
// src/features/invoices/utils/calculations.ts
export const calculateInvoiceTotal = (items: LineItem[]): number => {
  return items.reduce((sum, item) => sum + (item.qty * item.price), 0);
}

// src/features/invoices/components/InvoiceForm.tsx
const InvoiceForm = () => {
  const [items, setItems] = useState<LineItem[]>([]);
  const total = calculateInvoiceTotal(items);
  return <div>{total}</div>;
}
```

## Review Checklist
- [ ] Complex logic extracted to plain TypeScript service?
- [ ] Service devoid of React import?
- [ ] Impure service separated from pure calculation utility?
