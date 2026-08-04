# Product Requirements Document (PRD) - Ledgerly

## Purpose
Deliver ultra-fast, offline-first invoice & financial management platform. Zero backend dependencies required at launch. Permanent local data sovereignty. Optional cloud backup.

## Problem Statement
Traditional billing software demands constant web connectivity, introduces latency, charges monthly subscription fees for basic functions, and traps agency financial data inside proprietary server silos. Small businesses require reliable local invoice tools with zero lag and cloud sync capability.

## Target Users
| Segment | Profile & Core Needs |
|---|---|
| **Marketing Agencies** | Manage retainer billing, customizable invoice templates, client ledgers, brand customization. |
| **Freelancers / Contractors** | Fast draft-to-paid billing cycle, localized customer DB, one-click PDF exports. |
| **Small Businesses** | Offline CRM capability, clear analytics dashboards, reliable expense/revenue tracking. |

## Core Features
| Feature Module | Capabilities & Technical Implementation |
|---|---|
| **Offline CRM** | Customer CRUD operations stored locally in IndexedDB. Instant keyword Search & filtering. |
| **Invoice Engine** | Interactive multi-line builder, automatic tax/discount/subtotal calculation, status lifecycle tracking (`Draft` → `Sent` → `Paid` → `Overdue`). |
| **PDF Renderer** | Client-side PDF generation via lazy-loaded `jsPDF`/`html2canvas`. Supports embedded Base64 brand logos. |
| **Payment Ledger** | Record manual customer payments linked to invoice UUIDs. Balance remaining tracking. |
| **Financial Analytics** | Real-time visual metrics: aging summary, outstanding revenue, payment trend lines. |
| **Cloud Sync Engine** | Optional Firebase Auth integration. Background delta queue pushes local mutations to Firestore without UI blocking. |

## App Flow
1. **Bootstrap:** App loads from zero-latency local ES bundles. IndexedDB initializes.
2. **Local Dashboard:** Metrics render instantly from local IDB stores via Zustand state slices.
3. **Creation Flow:** User creates Customer/Invoice → Zod validates payload → Save to IDB → Optimistic UI updates.
4. **Offline Queue:** Each local write appends mutation instruction to local `SyncQueue`.
5. **Background Sync (When Online):** Worker service drains `SyncQueue` → Pushes delta timestamps (`updatedAt`) to Cloud Firestore → Resolves conflicts via Last-Write-Wins.

## Success Criteria
- **Zero Latency:** Screen rendering & DB read operations < 16ms (local IDB source of truth).
- **Offline Resilience:** 100% core features function in complete disconnect (Airplane mode).
- **Bundle Efficiency:** Initial entry chunk < 10kB; heavy PDF libraries lazy-loaded strictly on demand.
- **Data Integrity:** Zero data corruption across offline-to-online state transitions via UUIDv4 primary keys.
- **Accessibility & UX:** Lighthouse Performance & Accessibility score = 100. Keyboard navigation fully supported.

## Business Requirements
- **Spark Plan Compatibility:** Cloud Sync engine must operate under Firebase free daily limits (50k reads / 20k writes) via batched queue draining.
- **Tauri Desktop Future-Proofing:** Zero direct filesystem or browser-locked API calls in business logic. Repository Pattern mandatory to enable direct native desktop wrapper deployment.
- **Zero Tech Debt:** Complete codebase type safety (TypeScript strict mode, zero `any` flags, Zod boundary checks).
