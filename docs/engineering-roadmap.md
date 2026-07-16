# Engineering Roadmap

This document outlines the strategic evolution of the Invoice Management Application. The architecture defined in `GEMINI.md` and the `skills/` directory was specifically designed to make these transitions as frictionless as possible.

## Phase 1: Pure Offline Web App (Current)
- **Goal:** Deliver a fast, premium experience entirely in the browser.
- **Storage:** IndexedDB via Repository Pattern.
- **Limitations:** Data is tied to the specific browser profile. No cross-device usage.

## Phase 2: Native Desktop Support (Tauri Integration)
- **Goal:** Provide a native OS experience with file system access for saving PDFs directly, rather than relying on browser downloads.
- **Engineering Changes:**
  - Introduce Tauri wrappers in the build step.
  - Create a new `TauriStorageRepository` that implements the same interfaces as the `IndexedDBRepository`, but writes to a local SQLite file on the user's hard drive for permanent persistence.
  - *Note:* Because we used the Repository Pattern, the UI and Zustand stores will require **zero changes**.

## Phase 3: Cloud Synchronization
- **Goal:** Allow marketing agencies to sync invoices across multiple devices seamlessly.
- **Engineering Changes:**
  - Introduce an authentication layer (e.g., Supabase / Firebase).
  - Implement a Sync Engine that diffs the `updatedAt` timestamps of local IndexedDB records against the Cloud database.
  - Resolve conflicts using the UUIDs established in Phase 1.
  - *Note:* Because all entities are already tagged with UUIDs and timestamps, there is no need for a massive database migration.

## Phase 4: Module Expansion
- **Goal:** Expand from purely invoicing to full business management (Inventory, Estimates, Expenses).
- **Engineering Changes:**
  - Create new folders under `src/features` (e.g., `src/features/inventory`).
  - *Note:* Because of Feature-Sliced Design (FSD), adding these massive new modules will not bloat or break the existing Invoicing features.
