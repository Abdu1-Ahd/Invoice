# Invoice Management Application - Engineering Constitution

Welcome. Highly disciplined offline-first invoice management app.

This **Kernel of Engineering Operating System**. Define core philosophy. Read `skills/` for exact rules.

## 1. Project Philosophy

Professional software for marketing agency, freelancer, small business. Three pillars:

- **Offline-First Resilience:** App work perfect without internet. No backend server.
- **Future-Proof Extensibility:** System designed for Cloud Sync and Tauri Desktop future. No rewrite business logic later.
- **Uncompromising Quality:** Fast, premium, clean, maintainable. Explicit readable code beat magical abstraction.

## 2. Knowledge Sub-Systems (Operating Manual)

No write code blind. Read strict sub-systems:

- **[Architecture & FSD](skills/invoice-architecture/SKILL.md):** Folder rules. Layer isolation. Dependency graph.
- **[Storage & Data](skills/invoice-storage/SKILL.md):** Repository Pattern. IndexedDB. UUID. Cloud Sync ready.
- **[State Management](skills/invoice-state/SKILL.md):** Zustand slice. Selectors. Prevent global re-render.
- **[Components](skills/invoice-components/SKILL.md):** Separate Dumb/Shared UI from Smart/Feature logic.
- **[Design System](skills/invoice-design-system/SKILL.md):** Semantic token. Typography. Visual consistency.
- **[Services & Logic](skills/invoice-services/SKILL.md):** Pure business logic (PDF, Analytics). Decoupled from React.
- **[Abstraction Rules](skills/invoice-abstraction/SKILL.md):** WET vs DRY philosophy. Stop premature abstraction.
- **[Naming Philosophy](skills/invoice-naming/SKILL.md):** Naming conventions for hook, component, store.
- **[Performance](skills/invoice-performance/SKILL.md):** Render budget. Memoization. Lazy load.
- **[Engineering Review](skills/invoice-review/SKILL.md):** Ultimate checklist. Pass for "Done".
- **[Workflow](skills/invoice-workflow/SKILL.md):** Engineer operation rules. Tech debt refusal.

## 3. Core Architectural Paradigm

Strict follow **Feature-Sliced Design (FSD)**.
Codebase organized by *business domain*, not technical concern (`src/features/invoices`). 
**Golden Rule FSD:** Feature no depend on feature directly.

## 4. Documentation Strategy

Understand docs evolution (Architecture Decision Records)? Read **[Documentation Standards](docs/documentation-standards.md)**.

## 5. Long-Term Development Strategy

Roadmap: web app to synced desktop utility.
- **Phase 1 (Current):** Web-based. IndexedDB storage. Pure offline.
- **Phase 2:** Wrap Vite app in Tauri. Native OS integrate. File system access.
- **Phase 3:** Introduce Cloud Sync engine. Tap Repository Pattern. Sync local DB to backend. Use CRDTs/timestamp.

---

> **To AI Engineer:** Repository teach you think. Read skills. Enforce standards. No tech debt. Treat codebase as mature enterprise software.
