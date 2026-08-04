# Technical Requirements Document (TRD) - Ledgerly

## System Architecture Overview
- **Core Paradigm:** Offline-First Feature-Sliced Design (FSD).
- **Data Flow:** UI → Zustand Slices → Abstract Repository Interface → IndexedDB (Source of Truth) → Sync Queue → Cloud Firestore.
- **Resilience Strategy:** Zero network blockage. Local writes complete instantly under 16ms. Background service resolves delta sync upon online network event.
- **Domain Decoupling:** Business features isolated under `src/features/*`. Cross-feature direct module importation forbidden.

## Frontend Responsibilities
- **Optimistic UI:** Render screen mutations immediately on user execution before database storage confirmation.
- **State Segmentation:** Maintain decentralized Zustand stores per business domain (`auth`, `customer`, `invoice`, `settings`, `sync`). No monolithic global store.
- **Transient Forms:** React Hook Form manages reactive typing cycles; Zod enforces strict boundary validation before repository persistence.
- **Document Rendering:** Construct DOM layouts and generate client-side PDF binaries dynamically via canvas extraction without server assistance.

## Backend Responsibilities
- **Zero Mandatory Startup Engine:** App operates completely decoupled from server hardware.
- **Cloud Backup Role:** Remote Firestore database functions strictly as secondary replica for disaster recovery and cross-device syncing.
- **Authentication Credentials:** Firebase Auth validates tokens via OIDC / OAuth providers and broadcasts state transitions to local web runtime.

## Database Schema Proposal
All persistent entities require immutable UUIDv4 identifiers and timestamp tracking for deterministic synchronization and soft delete capabilities:
- **`Customer`**: `id`, `name`, `email`, `phone`, `address`, `notes`, `createdAt`, `updatedAt`, `deletedAt`
- **`Invoice`**: `id`, `customerId`, `invoiceNumber`, `status` (`Draft`|`Sent`|`Paid`|`Overdue`), `issueDate`, `dueDate`, `subtotal`, `discountAmount`, `taxableAmount`, `taxRate`, `taxAmount`, `totalAmount`, `notes`, `terms`, `billingAddress`, `paymentMethod`, `latePenalty`, `currency`, `discount` (`{ type: 'percentage'|'fixed', value }`), `billingCycle`, `createdAt`, `updatedAt`, `deletedAt`
- **`InvoiceItem`**: `id`, `invoiceId`, `description`, `subDescription`, `quantity`, `unitPrice`, `total`, `createdAt`, `updatedAt`, `deletedAt`
- **`Payment`**: `id`, `invoiceId`, `amount`, `method` (`Cash`|`Bank Transfer`|`Credit Card`|`PayPal`|`Other`), `reference`, `notes`, `date`, `createdAt`, `updatedAt`, `deletedAt`
- **`Settings`**: `id` (`singleton`), `userId`, `agencyName`, `logoBase64`, `defaultTaxRate`, `defaultTerms`, `currency`, `createdAt`, `updatedAt`
- **`SyncQueue`**: `id`, `entityType` (`customer`|`invoice`|`invoiceItem`|`payment`|`settings`), `entityId`, `operation` (`CREATE`|`UPDATE`|`DELETE`), `payload`, `status` (`PENDING`|`SYNCING`|`ERROR`), `createdAt`

## API Structure
- **Repository Interface Contract:** Standardized CRUD abstractions across all repositories (`ICustomerRepository`, `IInvoiceRepository`, etc.) with asynchronous promise returns.
- **Sync Mutation Payload Contract:**
  ```json
  {
    "id": "uuid-v4-string",
    "entityType": "invoice",
    "entityId": "target-uuid-string",
    "operation": "CREATE | UPDATE | DELETE",
    "payload": { "attribute": "modified_value", "updatedAt": 1754318400000 },
    "status": "PENDING"
  }
  ```
- **Conflict Resolution Protocol:** Last-Write-Wins (LWW) evaluation matching local `updatedAt` timestamp against Firestore document timestamp.

## Authentication Strategy
- **Identity Provider:** Firebase Authentication (Modular ES Engine).
- **Supported Methods:** Email/Password Authentication + Google OpenID Connect (OAuth 2.0).
- **Session Persistence:** Local Browser Storage via Firebase Auth SDK tokens; Zustand auth slice syncs user identity UUID to enable cloud synchronization capability.

## Third-Party Dependencies & Bundle Constraints
- **Strict Tree-Shaking:** Import ES submodules explicitly (`firebase/firestore`, `lucide-react/icons`).
- **Lazy Load Heavy Engines:** `jspdf` and `html2canvas` excluded from primary initial chunk; downloaded strictly upon `exportPDF()` tool invocation.
- **Zero Legacy Bloat:** Prohibit heavy utility frameworks (no Lodash/Moment.js). Native browser ES built-in APIs mandatory.

## Progressive Web Application (PWA) Technical Requirements
- **Web App Manifest Standards:** Standardized `manifest.json` at root scope (`/`) with `display: "standalone"`, 10 custom icons (72px to 512px, maskable, Apple touch), theme color `#6366f1`, background `#0f0f13`, and shortcuts for `/invoices` and `/customers`.
- **Custom Service Worker Constraints:** Hand-crafted `sw.js` located in `public/` providing 0 kB Workbox bundle overhead. Scope strictly locked to `/`.
- **Cache Strategy Enforcement:**
  - Cache-First for static shell (`/`) and Vite hashed bundles (`ledgerly-shell-v1`, `ledgerly-static-v1`, `ledgerly-images-v1`).
  - Stale-While-Revalidate for Google Fonts (`ledgerly-fonts-v1`).
  - Network-First for dynamic runtime resources (`ledgerly-runtime-v1`).
  - Security Exclusion: Zero caching of Firebase auth tokens or Firestore document queries.
- **Update Protocol & User Consent:** Service worker lifecycle listens to `updatefound` via `sw.registration.ts` and emits `ledgerly:sw-update-ready` event. `SKIP_WAITING` executed strictly on user consent through `PWAUpdateBanner.tsx`.
- **Cross-Platform PWA Support:** Native install support on Chrome/Edge/Android via `beforeinstallprompt` interception (`usePWAInstall.ts`); manual iOS Safari guidance banner (`PWAInstallBanner.tsx`).

## Scalability Considerations
- **DOM Virtualization:** Any tabular list or collection exceeding 50 entries must utilize `@tanstack/react-virtual` to restrict DOM node inflation.
- **Spark Plan Cost Governance:** Batch cloud synchronization operations to guarantee daily read/write volume stays well below Firebase free tier thresholds (50k reads / 20k writes).
- **Memory Footprint:** IndexedDB binary asset storage (Base64 logos/templates) capped and read directly from disk via repository abstraction to prevent JavaScript heap saturation.
