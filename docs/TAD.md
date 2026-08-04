# Technical Architecture Document (TAD) - Ledgerly

## Tech Stack
- **Frontend & Routing:** React 19, Vite 8, TypeScript 7, React Router DOM 7.
- **Styling Engine:** Tailwind CSS v4, Lucide Icons, Framer Motion.
- **State & Data Formats:** Zustand 5 (decoupled slices), React Hook Form, Zod 4.
- **Storage & Cloud:** IndexedDB (`idb` v8), Firebase Modular v12 (Auth + Firestore Spark Plan).
- **Document Engine:** jsPDF 4, html2canvas 1, `@tanstack/react-virtual` 3.

## File and Folder Structure (Feature-Sliced Design - FSD)
Strict separation by business domain. Features never directly import from other features.
```
src/
├── app/          # Core global integration: Router, Application wrapper, Context Providers
├── core/         # Pure domain-agnostic infrastructure: storage engines, sync worker, theme tokens, auth service
├── domain/       # Source of truth data contracts: TypeScript interfaces & Zod validation schemas
├── features/     # Isolated business capabilities: auth, customers, dashboard, invoices, payments, reports, settings, sync, templates
└── shared/       # Reusable cross-feature primitives: dumb UI blocks (Button, Input, Select), shared layouts, generic hooks
```

## Database Schema (IndexedDB & Firestore Parallel Contracts)
All entities keyed by immutable `UUIDv4`. Timestamps track state & support Last-Write-Wins synchronization.

| Entity Store | Primary Key | Key Fields & Types | Lifecycle Constraints |
|---|---|---|---|
| **`customers`** | `id` (string) | `name`, `email`, `phone`, `address`, `notes` (strings) | Mandatory: `createdAt`, `updatedAt`, `deletedAt` (soft delete) |
| **`invoices`** | `id` (string) | `customerId`, `invoiceNumber`, `status` (`enum`), `issueDate`, `dueDate`, `billingCycle`, `currency`, `discount`, `subtotal`, `taxRate`, `taxAmount`, `totalAmount`, `notes`, `terms` | Mandatory: `createdAt`, `updatedAt`, `deletedAt` |
| **`payments`** | `id` (string) | `invoiceId`, `amount` (number), `paymentDate`, `paymentMethod`, `notes` | Mandatory: `createdAt`, `updatedAt`, `deletedAt` |
| **`settings`** | `id` (singleton)| `userId`, `agencyName`, `logoBase64`, `defaultTaxRate`, `defaultTerms`, `currency` | Mandatory: `createdAt`, `updatedAt` |
| **`syncQueue`** | `id` (string) | `entityType`, `entityId`, `operation` (`CREATE`\|`UPDATE`\|`DELETE`), `payload`, `status` (`PENDING`\|`FAILED`) | Temporary queue; flushed upon network connectivity |

## Authentication and Roles
- **Auth Service:** Managed via Firebase Modular SDK v12 (`src/core/auth/auth.service.ts`). Supports Email/Password + Google OAuth.
- **State Integration:** Auth state synced to `useAuthStore` (`src/features/auth/store/auth.store.ts`).
- **Role Isolation:** Single-tenant model per user account. All cloud Firestore operations scoped strictly to `userId`.
- **Security Rules:** Firestore rule enforce identity locking: `allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;`.

## API and Integration Spec
Zero REST/GraphQL server dependencies. Integration communication follows offline-first mutation protocol:
1. **Repository Pattern Boundary:** Application interacts exclusively via generic interface (`src/core/storage/*.repository.ts`).
2. **Local Mutation Processing:** Write op modifies IndexedDB instantly -> pushes instruction task to `syncQueue` object store.
3. **Cloud Sync Service:** Background polling/online listener (`src/core/sync/cloudSync.service.ts`) picks pending records -> transmits batch to Firestore -> removes queue items on ACK.

## Environment Configuration
Managed via Vite public environment variables in `.env`:
```ini
VITE_FIREBASE_API_KEY="AIo..."
VITE_FIREBASE_AUTH_DOMAIN="ledgerly-os.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="ledgerly-os"
VITE_FIREBASE_STORAGE_BUCKET="ledgerly-os.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"
```

## Deployment Strategy
- **Web App Production Build:** Vite bundle compilation (`npm run build`) generates static tree-shook HTML/JS/CSS assets inside `dist/`. Deployable to any CDN / Firebase Hosting (Free Tier).
- **Bundle Chunk Architecture:** Automated code split across `vendor-react`, `vendor-firebase`, `vendor-pdf`, and `vendor-icons` chunks to prevent network bottlenecks.
- **Tauri Native Desktop Support:** Zero codebase logic changes required for Phase 2 desktop app launch; simply wrap Vite distribution output inside Tauri WebView binary and replace storage repository with local SQLite driver.
