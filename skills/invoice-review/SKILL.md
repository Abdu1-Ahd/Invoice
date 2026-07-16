---
name: Invoice Code Review Standards
description: Engineering review checklist. Focus architectural quality.
---

# Code Review Standards

## Why exist
Review not subjective debate about syntax (Prettier do that). Review catch architectural decay, security risk, tech debt before merge.

## Philosophy
Review focus **Engineering Quality**. Every implementation must pass standard before production.

## The Engineering Checklist

### 1. Architecture & Dependency Direction
- [ ] **FSD Compliance:** Feature isolate logic? (No `customers` code leak `invoices`).
- [ ] **Direction:** Imports flow down? (`app` -> `features` -> `domain` -> `core` -> `shared`).
- [ ] **Domain Purity:** Zod schemas and TypeScript models free React import?

### 2. State Management & Storage
- [ ] **Repository Pattern:** Read/write IndexedDB exclusive through Repository?
- [ ] **UUID Enforcement:** UUIDs (v4) generated for new entity? No auto-increment integer?
- [ ] **Render Safety:** Zustand store subscription use selector? Prevent global re-render?

### 3. Maintainability & Reusability
- [ ] **Smart vs Dumb:** Generic UI placed `shared/components`? Domain component kept `features/`?
- [ ] **Business Logic Separation:** Complex math/transform extracted pure function/service? Away from React?
- [ ] **Intentional Duplication:** Avoid premature abstraction? (Duplicate if serve different domains).

### 4. Scalability & Future Extensibility
- [ ] **Sync Readiness:** New entity include `createdAt` and `updatedAt`?
- [ ] **Data Validation:** Data validated Zod immediately after cross boundary (DB read, user input)?

### 5. Readability & Naming
- [ ] **Semantic Naming:** Name hook, component, service describe exact responsibility?
- [ ] **Self-Documenting Code:** Code clear enough inline comments unnecessary?

## How to use
Implementation fail *any* check? Reject. Engineer must refactor. Tech debt not temporary loan. Tech debt permanent tax.
