# Complete Codebase Mapping & Architectural Reusability Audit (Map.md)

Terse tabular mapping of current application codebase under `src/`. Identifies precise layer, technical responsibility, and reusability status.

| File Path | Layer / Folder | Technical Purpose & Responsibility | Supports Centralization & Reusability? |
|---|---|---|---|
| **`src/main.tsx`** | Root Entry | React app bootstrapper & DOM mount script. | **No** – Application execution root. |
| **`src/index.css`** | Root Styling | Tailwind v4 CSS engine importer & global utility styles. | **Yes** – Centralizes base CSS framework configuration. |
| **`src/vite-env.d.ts`** | Types Config | Vite TypeScript declarations & global env mappings. | **Yes** – Centralizes global compilation environment types. |
| **`src/app/Router.tsx`** | App Layer | Client-side routing topology; code-splits features via `React.lazy` + Suspense. | **Yes** – Central routing integration hub for all features. |
| **`src/core/auth/auth.service.ts`** | Core Infra | Firebase Modular Auth wrapper (login, OAuth, logout procedures). | **Yes** – Central abstraction isolating auth engine from components. |
| **`src/core/firebase/firebase.ts`** | Core Infra | Initializer & connection provider for Firebase v12 application app instance. | **Yes** – Central singleton supplying Firebase credentials and handlers. |
| **`src/core/storage/db.ts`** | Core Storage | Asynchronous IndexedDB configuration (`idb`) defining local schema stores. | **Yes** – Central localized data source of truth. |
| **`src/core/storage/customer.repository.ts`** | Core Storage | Customer repository abstraction implementing CRUD operations to IndexedDB. | **Yes** – Decouples UI & state slices from physical DB driver. |
| **`src/core/storage/invoice.repository.ts`** | Core Storage | Invoice repository handling IDB persistence & queuing mutations. | **Yes** – Reusable across any feature requiring invoice persistence. |
| **`src/core/storage/payment.repository.ts`** | Core Storage | Payment repository for transaction ledgers in IndexedDB. | **Yes** – Reusable abstraction layer for transaction mutations. |
| **`src/core/storage/settings.repository.ts`** | Core Storage | Singleton agency configurations & logo persistence repository. | **Yes** – Centralized configuration storage access provider. |
| **`src/core/storage/syncQueue.repository.ts`** | Core Storage | Offline mutation tracking repository managing pending network write operations. | **Yes** – Central queuing pipeline for decentralized background sync. |
| **`src/core/sync/cloudSync.service.ts`** | Core Sync | Background engine draining `syncQueue` delta timestamps to Cloud Firestore. | **Yes** – Reusable background worker synchronization engine. |
| **`src/core/theme/tokens.ts`** | Core Theme | Centralized semantic design colors & spacing system tokens. | **Yes** – Mandatory single source of truth for UI appearance constants. |
| **`src/core/utils/currency.ts`** | Core Utils | Domain-agnostic currency & financial floating math numeric string formatters. | **Yes** – Highly reusable utility invoked across builders & reports. |
| **`src/domain/customer.ts`** | Domain | Zod runtime schema & TypeScript interface defining valid Customer entity. | **Yes** – Centralized data type contract shared by UI, DB, and network. |
| **`src/domain/invoice.ts`** | Domain | Zod schema & TS interfaces for Invoice and InvoiceItem structures. | **Yes** – Central validation contract preventing malformed billing records. |
| **`src/domain/payment.ts`** | Domain | Zod runtime schema & TS interfaces for financial Payment entries. | **Yes** – Central ledger record structural definition. |
| **`src/domain/settings.ts`** | Domain | Zod validation schemas for agency branding & system defaults. | **Yes** – Single validation source for application preferences. |
| **`src/domain/sync.ts`** | Domain | Schema contract defining offline sync queue mutation payloads. | **Yes** – Shared contract between local repository & cloud worker. |
| **`src/features/auth/AuthPage.tsx`** | Feature (Auth) | Authentication UI view (Login / Register / Google OAuth flow). | **No** – Feature-scoped visual layout view. |
| **`src/features/auth/store/auth.store.ts`** | Feature (Auth) | Zustand state slice tracking user credentials & token lifecycle. | **Yes** – Reusable state hook consumed by sync workers & route guards. |
| **`src/features/customers/CustomersPage.tsx`** | Feature (Customers) | Customer management landing page container & route handler. | **No** – Feature-specific top-level page component. |
| **`src/features/customers/CustomerList.tsx`** | Feature (Customers) | Virtualized tabular collection view representing saved client directories. | **No** – Feature UI component bound to customer domain. |
| **`src/features/customers/CustomerEditor.tsx`** | Feature (Customers) | Reactive form component (React Hook Form) for creating/editing clients. | **No** – Feature-scoped interactive form controller. |
| **`src/features/customers/store/customer.store.ts`** | Feature (Customers) | Zustand slice orchestrating customer repository calls and cached entities. | **Yes** – Centralized reactive store accessed by customer selectors & builders. |
| **`src/features/dashboard/DashboardPage.tsx`** | Feature (Dashboard) | Analytics dashboard presenting revenue aging summaries & fast action buttons. | **No** – Dedicated reporting landing view. |
| **`src/features/invoice-templates/StandardTemplate.tsx`** | Feature (Templates) | Default visual layout structure rendering clean invoice document output. | **Yes** – Modular design template reusable across print, preview, and PDF exporters. |
| **`src/features/invoices/InvoicesPage.tsx`** | Feature (Invoices) | Top-level routing wrapper for invoicing dashboard tabs and editors. | **No** – Feature landing page container. |
| **`src/features/invoices/InvoiceList.tsx`** | Feature (Invoices) | Filterable status list (Draft/Sent/Paid/Overdue) utilizing virtualized DOM. | **No** – Feature-scoped collection component. |
| **`src/features/invoices/InvoiceBuilder.tsx`** | Feature (Invoices) | Comprehensive reactive invoice creator & line item mathematical editor. | **No** – Complex domain-specific form component. |
| **`src/features/invoices/InvoiceDetails.tsx`** | Feature (Invoices) | Interactive document inspection screen with action controls (PDF/Send/Paid). | **No** – Dedicated view for single invoice lifecycle management. |
| **`src/features/invoices/store/invoice.store.ts`** | Feature (Invoices) | Zustand state slice coordinating invoice persistence repository and list mutations. | **Yes** – Core reactive billing store consumed across dashboard and report views. |
| **`src/features/invoices/utils/calculations.ts`** | Feature (Invoices) | Pure mathematical calculation functions for discounts, taxes, and grand totals. | **Yes** – Highly testable centralized business arithmetic utility. |
| **`src/features/invoices/utils/pdfGenerator.ts`** | Feature (Invoices) | Dynamic client-side document compiler importing jsPDF & html2canvas on demand. | **Yes** – Reusable PDF extraction compiler invoked by preview screens. |
| **`src/features/reports/ReportsPage.tsx`** | Feature (Reports) | High-level analytical view presenting financial charts and payment timelines. | **No** – Dedicated BI visual layout page. |
| **`src/features/settings/SettingsPage.tsx`** | Feature (Settings) | Agency configuration form managing branding logos and default taxation terms. | **No** – Dedicated configuration view. |
| **`src/features/settings/store/settings.store.ts`** | Feature (Settings) | Zustand store managing persistence and retrieval of application-wide preferences. | **Yes** – Global reactive configuration store accessed by templates & builders. |
| **`src/features/sync/useSyncWorker.ts`** | Feature (Sync) | React custom hook subscribing to browser online events and executing background drain. | **Yes** – Encapsulated sync orchestration logic mountable in app root. |
| **`src/features/sync/store/sync.store.ts`** | Feature (Sync) | Zustand state tracking queue status, remaining pending mutations, and sync errors. | **Yes** – Reactive operational feedback store consumed by UI status indicators. |
| **`src/features/sync/utils/syncTrigger.ts`** | Feature (Sync) | Debounced signal emitter initiating immediate sync worker execution. | **Yes** – Reusable event utility triggering cloud synchronization updates. |
| **`src/shared/components/Button.tsx`** | Shared (UI) | Accessible interactive button primitive with consistent focus & variant styles. | **Yes** – Universal atomic design UI primitive. |
| **`src/shared/components/CurrencySelect.tsx`** | Shared (UI) | Specialized currency selection dropdown component formatted with financial labels. | **Yes** – Reusable form selector component across billing features. |
| **`src/shared/components/ErrorBoundary.tsx`** | Shared (UI) | Top-level React fallback barrier preventing application crashes from unhandled errors. | **Yes** – Central defensive wrapping infrastructure for robust reliability. |
| **`src/shared/components/Input.tsx`** | Shared (UI) | Standardized textual & numeric form input element with error highlighting. | **Yes** – Universal atomic design UI input primitive. |
| **`src/shared/components/Label.tsx`** | Shared (UI) | Accessible semantic label component linked to interactive form inputs. | **Yes** – Universal semantic typography primitive for forms. |
| **`src/shared/components/Layout.tsx`** | Shared (Layout) | Root responsive visual structure providing collapsible desktop sidebar & mobile tabs. | **Yes** – Core unified shell wrapping all feature views. |
| **`src/shared/components/Select.tsx`** | Shared (UI) | Generic customizable HTML dropdown select control element. | **Yes** – Reusable atomic design UI dropdown primitive. |
| **`src/shared/components/SyncStatusIndicator.tsx`** | Shared (UI) | Subtle persistent visual widget displaying live offline / syncing connection status. | **Yes** – Reusable telemetry component embedded in Layout header. |
| **`src/shared/components/Typography.tsx`** | Shared (UI) | Typographic text component enforcing font hierarchy from token rules. | **Yes** – Universal text rendering primitive enforcing visual style guides. |
| **`src/shared/hooks/useKeyboardShortcut.ts`** | Shared (Hooks) | Generic React hook capturing hotkeys (CMD+S, ESC) for quick workflow execution. | **Yes** – Highly reusable event interceptor enabling keyboard-first UX. |
| **`src/shared/utils/cn.ts`** | Shared (Utils) | Tailwind className dynamic evaluation & conflict resolution merger (`clsx` + `tw-merge`). | **Yes** – Essential utility invoked by virtually every styled UI component. |
