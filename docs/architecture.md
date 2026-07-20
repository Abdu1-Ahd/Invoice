# Invoice Management Application - Architecture Document

## Overview

The Invoice Management Application is designed as a modern, high-performance, completely offline-first tool tailored for marketing agencies, freelancers, and small businesses. The initial release relies entirely on local storage, with zero backend dependency.

However, a key business requirement is that the architecture must allow for seamless integration of cloud synchronization and native desktop support (via Tauri) in the future, without requiring major rewrites of the application logic.

## Core Architectural Principles

1. **Feature-Sliced Design (FSD):** The application is organized around business features rather than technical concerns. This isolation ensures that as new modules are added (Inventory, Expenses, etc.), they don't break existing features.
2. **Repository Pattern for Storage:** UI components and state managers must NEVER interact directly with the underlying storage layer (e.g., no `localStorage.setItem`). All data persistence goes through abstract Repositories.
3. **Decoupled State Management:** Avoid a monolithic global store. State is segmented by feature domain to prevent performance bottlenecks.
4. **Offline First & Sync-Ready:** All entities must use UUIDs (v4) or CUIDs as primary keys to prevent conflicts during future cloud syncing. Entities should also track timestamps (`createdAt`, `updatedAt`, `deletedAt`).

## Folder Structure

The project strictly follows this directory layout:

### `src/app`
Contains global application wrappers.
- `providers.tsx`
- `router.tsx`
- `App.tsx`

### `src/core`
Contains pure architectural infrastructure, unaware of any specific business logic.
- `core/storage`: Repository interfaces and the IndexedDB implementations.
- `core/theme`: Semantic styling tokens (`tokens.ts`) and theme providers. **No hardcoded colors allowed.**
- `core/utils`: Generic, domain-agnostic utilities (e.g., date wrappers, UUID generators, currency formatters).

### `src/domain`
The source of truth for all data structures in the app.
- Contains Zod schemas and TypeScript interfaces for `Customer`, `Invoice`, `Payment`, etc.
- Ensures validation is unified across forms and storage.

### `src/features`
The primary development area. Each folder here represents an isolated business domain.
- **`dashboard`**: Analytics and summary views.
- **`customers`**: Customer database, CRUD views, and history tracking.
- **`invoices`**: The invoice generator, list views, and PDF generation logic.
- **`payments`**: Payment recording and outstanding balance tracking.
- **`reports`**: Deep analytics and trend graphs.
- **`settings`**: Agency branding (logo, name) and app configuration.
- **`templates`**: React components representing printable/exportable invoice designs.

Inside each feature folder, you may find:
- `/components`: UI components specific to this feature.
- `/stores`: Zustand stores managing this feature's state.
- `/hooks`: Custom React hooks containing feature logic.
- `/utils`: Utilities specific to this domain.

### `src/shared`
Highly reusable code that spans across multiple features.
- `shared/components`: Dumb UI elements (Button, Input, Modal).
- `shared/hooks`: Generic React hooks (e.g., `useMediaQuery`).
- `shared/layouts`: Structural page layouts (e.g., `DashboardLayout`).

## Data Persistence Strategy

**Primary Engine: IndexedDB**
We cannot use `localStorage` for the primary database. Base64 encoded logos and a high volume of invoices will exceed the ~5MB quota and cause synchronous blocking on the main thread.
- Use a wrapper like `localforage` or raw `idb` to manage IndexedDB interactions asynchronously.
- The Repositories in `src/core/storage` will interact with IndexedDB and return strongly typed domain objects.

## Template Engine

Invoice templates must be highly modular. A single `TemplateRenderer` component will accept domain data (Invoice + Customer + Agency) and dynamically load the selected template design from `src/features/templates`. This allows adding new themes (Minimal, Corporate, Medical) simply by dropping in a new component file that implements a common interface.

## Rules of Engagement (DO NOT BREAK)

- **No Global Spaghetti:** A component in `features/customers` cannot directly import a store or component from `features/invoices`. If they need to communicate, it must be done through shared abstractions or via the `src/app` integration layer.
- **No Direct Storage Access:** Never use `localStorage` or `IndexedDB` APIs directly in a React component or a Zustand store. Always inject or import a Repository.
- **No Sequential IDs:** Never generate IDs like `1, 2, 3`. Always use UUID v4.
- **Strict Validation:** All data entering the storage layer must be validated against the `src/domain` Zod schemas.
- **Strict Theme System:** The application uses semantic design tokens (`Primary`, `Surface`, `Border`, `Danger`, etc.). Hardcoding colors (e.g., `text-gray-900`) is strictly prohibited. All visual values must originate from the centralized `src/core/theme/tokens.ts` and Tailwind CSS variables.

---
*Document designed for long-term scalability and maintainability.*
