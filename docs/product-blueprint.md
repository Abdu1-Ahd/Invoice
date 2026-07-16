# Invoice Management Application - Product Blueprint

This document is the definitive product blueprint for the application. Every feature, architecture decision, and UX choice must align with the principles defined here.

---

## 1. Complete Product Architecture

The application is built on a strictly layered, offline-first architecture.

*   **UI Layer:** React, Tailwind CSS, Lucide Icons, Framer Motion (for subtle interactions).
*   **State Management:** Zustand (sliced by feature). Form state is transient (React Hook Form).
*   **Repository Layer:** Pure TypeScript interfaces abstracting all data access.
*   **Local Database (Source of Truth):** IndexedDB (via `localforage` or `idb`).
*   **Sync Engine:** A background process that reads a local mutation queue and synchronizes with the remote database.
*   **Remote Database (Backup/Sync):** Firebase Firestore (Spark Plan compatible).
*   **Authentication:** Firebase Auth.

---

## 2. Complete Screen Map

### Authentication
*   **Welcome:** Product landing/overview for unauthenticated users.
*   **Login / Register:** Email/Password and Google OAuth.
*   **Forgot Password:** Password reset flow.

### Core Application
*   **Dashboard:** High-level metrics, outstanding revenue, recent activity, quick-create actions.
*   **Customers:**
    *   List View (Searchable, filterable).
    *   Customer Details (History, associated invoices, metrics).
    *   Create / Edit Customer (Modal or full page depending on complexity).
*   **Invoices:**
    *   List View (Status tabs: Draft, Sent, Paid, Overdue).
    *   Invoice Details (Web preview of the invoice with actions to Download PDF, Send, Mark Paid).
    *   Create / Edit Invoice (Interactive builder).
*   **Recurring Invoices:**
    *   List View.
    *   Schedule Details & Editor.
*   **Payments:**
    *   List View (Ledger of all received payments).
    *   Record Payment (Manual entry against an invoice).
*   **Reports:**
    *   Visual charts (Revenue over time, Aging summary).
*   **Settings:**
    *   Profile (User info).
    *   Agency Details (Logo, default terms, tax rates).
    *   Backup & Sync (Connection status, manual sync triggers).
*   **System States:**
    *   404 Not Found.
    *   Global Loading States.
    *   Empty States (Contextual per page).
    *   Error Boundaries (Graceful recovery).

---

## 3. Navigation Flow

*   **Desktop:** A fixed left sidebar containing main navigation (Dashboard, Invoices, Customers, Reports, Settings).
*   **Mobile:** A bottom tab bar for core features (Home, Invoices, Customers), with a "More" menu for Settings/Reports.
*   **Nested Routing:** Contextual sub-pages (e.g., `/invoices/create`) replace the main view but maintain navigation access. Editors will feature a top action bar (e.g., [Cancel] [Save Draft] [Send]).

---

## 4. UX Philosophy

The application must feel polished, minimal, and lightning-fast. Every interaction has a purpose.
*   **Keyboard First:** CMD+S to save, ESC to close modals, auto-focusing the most critical input on screen load.
*   **Forgiving:** Emphasize "Undo" over "Are you sure?" confirmation modals for destructive actions (where feasible).
*   **Smart Defaults:** Remember the last used tax rate, default due dates (e.g., Net 30).
*   **Offline Transparency:** The app should never block the user if offline. A subtle indicator should show "Working offline. Changes will sync when reconnected."
*   **No Technical Jargon:** Error messages must be actionable ("We couldn't save this invoice. Please check your connection or try again.") instead of ("Error 500: Failed to fetch").

---

## 5. UI Philosophy

Visuals communicate trust and professionalism.
*   **Aesthetics:** Minimal, soft, modern.
*   **Spacing & Structure:** Generous whitespace. Information should never feel cramped.
*   **Shapes:** Rounded corners for a friendly, modern feel (e.g., `rounded-xl` for cards, `rounded-lg` for buttons).
*   **Typography:** Highly readable sans-serif (e.g., Inter or standard system fonts). Strong hierarchy (`h1` vs `body`).
*   **Color Palette:** Semantic colors (Background, Surface, Primary, Muted, Danger, Success). High contrast for accessibility. Subtle shadows for elevation depth.

---

## 6. Empty-State Designs

Empty states are opportunities to educate and motivate. Never show a blank screen.
*   **Customers:** Soft illustration of an empty contact book. *"Let's add your first customer."* -> [Add Customer] or [Import CSV].
*   **Invoices:** Illustration of a blank canvas. *"Time to get paid."* -> [Create Invoice].
*   **Dashboard:** *"Welcome to your new workspace. Create an invoice to see your metrics come alive."*
*   **Trash/Archive:** *"It's clean in here."*

---

## 7. Micro-Interaction Strategy

Motion improves clarity; it should never distract.
*   **Page Transitions:** Subtle fade-in (`opacity-0` to `opacity-100`) and slight slide-up (`translate-y-2` to `translate-y-0`).
*   **Buttons:** Active states scale down slightly (`scale-95`), hover states scale up slightly (`scale-[1.02]`) with soft transitions.
*   **Loading:** Use Skeleton loaders that mimic the final content shape instead of full-screen spinners.
*   **Success Feedback:** Toast notifications with a subtle slide-in animation.
*   **Delight:** Subtle confetti animation *only* when marking the user's very first invoice as Paid.
*   **Optimistic UI:** When a user likes, deletes, or saves, the UI updates instantly before the background DB confirms.

---

## 8. Offline-First Architecture

**MANDATORY FLOW:**
`UI -> Zustand -> Repository -> IndexedDB -> Sync Engine -> Firestore`

*   **IndexedDB is the Source of Truth.** The UI never waits for Firestore.
*   When a user creates an invoice, it is written to IndexedDB. The UI updates instantly.
*   A record is added to a local `SyncQueue`.
*   A background process reads the `SyncQueue` and pushes to Firestore silently.

---

## 9. Synchronization Architecture

Designed for unreliable internet and multi-device usage.
*   **Sync Queue:** A dedicated IndexedDB store tracking pending mutations (CREATE, UPDATE, DELETE).
*   **Versioning/Timestamps:** Every entity has an `updatedAt` timestamp.
*   **Conflict Resolution:** Last-Write-Wins based on the `updatedAt` timestamp.
*   **Soft Deletes:** Deleting a record sets `deletedAt: Timestamp`. It is not removed from the DB until synced.
*   **Network Detection:** The app listens to `window.addEventListener('online')` to flush the queue.
*   **Background Sync:** Uses Service Workers (if supported) or periodic polling when the app is open.

---

## 10. Performance Strategy

*   **Instant Load:** Code splitting and lazy loading for heavy routes (`React.lazy`).
*   **Heavy Libraries:** `pdf-lib` or `html2canvas` are huge. They are ONLY downloaded when the user actually tries to generate a PDF.
*   **Virtualization:** Any list that can exceed 100 items (Customers, Invoices) uses `@tanstack/react-virtual`.
*   **Render Optimization:** Strict adherence to Zustand selectors. No global re-renders.

---

## 11. Data Model Design

All models use UUID v4.

*   **Customer:** `id`, `name`, `email`, `phone`, `address`, `notes`, `createdAt`, `updatedAt`, `deletedAt`
*   **Invoice:** `id`, `customerId`, `invoiceNumber`, `status` (Draft, Sent, Paid, Overdue), `issueDate`, `dueDate`, `subtotal`, `taxAmount`, `totalAmount`, `notes`, `terms`, `createdAt`, `updatedAt`, `deletedAt`
*   **InvoiceItem:** `id`, `invoiceId`, `description`, `quantity`, `unitPrice`, `total`, `createdAt`, `updatedAt`, `deletedAt`
*   **Payment:** `id`, `invoiceId`, `amount`, `paymentDate`, `paymentMethod`, `notes`, `createdAt`, `updatedAt`, `deletedAt`
*   **Settings:** `id` (singleton), `userId`, `agencyName`, `logoBase64`, `defaultTaxRate`, `defaultTerms`, `currency`, `createdAt`, `updatedAt`
*   **SyncQueue:** `id`, `entityType`, `entityId`, `operation` (CREATE/UPDATE/DELETE), `payload`, `status` (PENDING, FAILED), `createdAt`

---

## 12. Implementation Roadmap

Do not build everything at once. Build in isolated, testable milestones.
1.  **Milestone 1: Core Foundation** (Routing, UI Theme, IndexedDB setup).
2.  **Milestone 2: Offline CRM** (Customer CRUD).
3.  **Milestone 3: Offline Invoicing** (Invoice Builder, Items, Calculations).
4.  **Milestone 4: PDF Generation** (Template engine, Base64 logos, PDF export).
5.  **Milestone 5: Dashboard & Analytics** (Reports, Payments).
6.  **Milestone 6: Firebase Auth & Cloud Sync** (Firestore integration, Sync Engine).
7.  **Milestone 7: Polish & Production** (Performance audits, accessibility, final UX passes).

---

## 13. Firebase Spark-Compatible Architecture

*   **Auth:** Google and Email/Password (Free).
*   **Firestore:** Used ONLY as a synchronization layer, not a querying engine.
    *   To stay under the 50k reads/20k writes daily free limit, the sync engine batches updates.
    *   Queries are minimal because data is queried locally from IndexedDB.
*   **Hosting:** Firebase Hosting (Free tier).

---

## 14. Complete Manual Setup Guide

*Refer to `docs/setup-guide.md` for the comprehensive developer onboarding guide.*

---

## 15. Documentation Structure

*   `docs/product-blueprint.md` (This document - The what and why)
*   `docs/setup-guide.md` (How to run the project)
*   `docs/documentation-standards.md` (How to document decisions)
*   `skills/` (The Engineering OS - How to write the code)

---

## 16. Production Readiness Checklist

Before public launch, the application must pass:
- [ ] **Offline Resilience:** App works flawlessly in Airplane mode; queue syncs on reconnect.
- [ ] **Data Integrity:** Sync conflicts resolve correctly using `updatedAt` timestamps.
- [ ] **Performance:** Lighthouse score > 90. Large lists virtualized.
- [ ] **Accessibility:** Lighthouse score 100. Keyboard navigable, high contrast.
- [ ] **Security:** Firestore security rules strictly limit reads/writes to `request.auth.uid == resource.data.userId`.
- [ ] **Zero Tech Debt:** No `any` types, strict Zod validation at all boundaries, zero architectural violations.
