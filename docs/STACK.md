# Ledgerly - Application Tech Stack

Terse technical specification of application stack. Tabular presentation.

## Core Runtime & Build

| Technology | Version | Purpose & Technical Role |
|---|---|---|
| **React** | `19.2.7` | UI library. Stable Concurrent Mode + Suspense enabled. Zero class components. |
| **Vite** | `8.1.1` | ES module bundler & dev server. Lightning-fast Hot Module Replacement (HMR). |
| **TypeScript** | `7.0.2` | Strict type safety. Eliminates runtime type bugs. Strict compilation targets (`tsc --noEmit`). |

## Styling & Design System

| Technology | Version | Purpose & Technical Role |
|---|---|---|
| **Tailwind CSS** | `4.3.3` | Utility-first styling engine (`@import "tailwindcss";`). Zero hardcoded colors. |
| **@tailwindcss/vite** | `4.3.3` | Dedicated Vite plugin for Tailwind v4 compilation. |
| **Lucide React** | `1.24.0` | SVG vector iconography tree-shook per component import. |
| **Framer Motion** | `12.42.2` | Declarative micro-animations & layout transitions. |
| **clsx + tailwind-merge** | `2.1.1` / `3.6.0` | Dynamic className resolution & conflict free override utility (`cn`). |

## State & Data Persistence

| Technology | Version | Purpose & Technical Role |
|---|---|---|
| **Zustand** | `5.0.14` | Decentralized atomic state management. Feature-sliced slices. Zero global re-renders. |
| **IDB** | `8.0.3` | Promise-based IndexedDB wrapper. Offline-first local database. True source of truth. |
| **UUID** | `14.0.1` | Universal unique identifier (v4) generation for decentralized conflict-free synchronization. |
| **React Hook Form** | `7.81.0` | Transient performant reactive form management with minimal re-render cycles. |
| **Zod** | `4.4.3` | Runtime domain validation schema engine. Enforced at form & persistence boundaries. |

## Cloud Synchronization & Backend Service

| Technology | Version | Purpose & Technical Role |
|---|---|---|
| **Firebase Modular SDK** | `12.16.0` | Cloud authentication & Firestore DB integration. |
| **Firebase Auth** | `v12` | Email/Password & Google OAuth credentials management. |
| **Cloud Firestore** | `v12` | Remote backup & synchronization target. Strictly Spark Plan compliant (low read/write footprint). |

## Rendering & Document Engine

| Technology | Version | Purpose & Technical Role |
|---|---|---|
| **jsPDF** | `4.2.1` | Client-side PDF generation engine. Lazy-loaded on export execution. |
| **html2canvas** | `1.4.1` | DOM-to-canvas rendering for pixel-perfect invoice PDF output. Lazy-loaded. |
| **@tanstack/react-virtual** | `3.14.6` | Virtualized DOM rendering for massive customer & invoice collections. |
| **React Router DOM** | `7.18.1` | Client-side routing with route-based code splitting (`React.lazy`). |

## Code Quality & Dev Instrumentation

| Technology | Version | Purpose & Technical Role |
|---|---|---|
| **ESLint** | `10.6.0` | Codebase static AST linting with React hooks/refresh rules. |
| **@vitejs/plugin-react** | `6.0.3` | Vite Fast Refresh integration. |
| **Globals** | `17.7.0` | Modern global environment identifiers for ESLint flat configs. |
