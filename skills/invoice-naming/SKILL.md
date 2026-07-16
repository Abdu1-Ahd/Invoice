---
name: Invoice Naming Philosophy
description: Defines naming conventions. Components, hooks, stores, services. Immediate recognizability.
---

# Naming Philosophy

## Why exist
Naming is architecture. Future engineer understand file job, layer, responsibility by read name. 

## Philosophy
Name communicate responsibility, not just type. Verbose explicit better than terse abbreviation.

## Rules by Category

### 1. Components (PascalCase)
- **Shared UI:** Name exactly what it is. `Button.tsx`, `Modal.tsx`, `SelectBox.tsx`.
- **Feature UI:** Prefix domain if specific. `CustomerList.tsx`, `InvoiceCreatorForm.tsx`.
- **Pages/Routes:** Suffix `Page`. `DashboardPage.tsx`, `CustomerDetailsPage.tsx`.

### 2. Hooks (camelCase, `use` prefix)
- **State Hooks:** Name after action/data. `useCustomers`, `useActiveInvoice`.
- **Utility Hooks:** Name after capability. `useClickOutside`, `useMediaQuery`.

### 3. State Management (camelCase, `Store` suffix)
- Zustand stores end `Store`.
- Examples: `useCustomerStore`, `useSettingsStore`.
- *Never* generic name (`useAppStore`, `useData`).

### 4. Storage & Repositories (PascalCase, `Repository` suffix)
- Interfaces end `Repository`: `CustomerRepository`.
- Implementations prefix technology: `IndexedDBCustomerRepository`.

### 5. Services & Utilities (camelCase or PascalCase)
- **Impure Orchestrators (Classes):** PascalCase. Suffix `Service`. `PdfGenerationService`, `BackupService`.
- **Pure Functions:** camelCase verb phrases. `calculateTax`, `formatCurrency`, `generateInvoiceId`.

### 6. Domain Models & Schemas (PascalCase)
- **Types/Interfaces:** Plain entity name. `Customer`, `Invoice`. (No `I` prefix. No `ICustomer`).
- **Zod Schemas:** Suffix `Schema`. `CustomerSchema`, `InvoiceSchema`.

### 7. File and Folder Naming
- **Folders:** `kebab-case`. `features/recurring-invoices`, `shared/date-picker`.
- **Files (React):** `PascalCase.tsx` if export React component. 
- **Files (Logic):** `camelCase.ts` if export pure function, hook, config.

## Review Checklist
- [ ] Name convey exact responsibility?
- [ ] No abbreviation? (`calcTotal` bad. `calculateTotal` good).
- [ ] Casing match standard? (PascalCase Component, camelCase function).
