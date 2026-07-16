# Documentation Standards

This repository treats documentation as a living, engineering artifact. Obsolete documentation is worse than no documentation. 

To maintain a clean workspace and preserve long-term engineering knowledge, follow this strict documentation structure and update cycle.

## Knowledge Hierarchy

Every piece of documentation has exactly one obvious home. Do not duplicate information across files.

### 1. `GEMINI.md` (The Core Constitution)
- **Responsibility:** Defines the high-level philosophy, non-negotiable rules, and architectural paradigm of the app.
- **Audience:** All engineers (Human and AI).
- **When to update:** Only when the fundamental architecture or business philosophy changes (e.g., migrating from IndexedDB to a Cloud Backend).

### 2. `/skills` (AI & Engineering Rulebook)
- **Responsibility:** Contains modular rule sets (skills) detailing *how* to write code for specific domains (state, architecture, design system).
- **Audience:** AI Agents (loaded automatically) and Human Engineers.
- **When to update:** When new engineering standards are introduced or when frequent PR review feedback indicates a missing automated rule.

### 3. `/docs` (Product & Architecture Documentation)
- **Responsibility:** System design, feature specifications, API contracts, and Architecture Decision Records (ADRs).
- **Audience:** Product Managers, Software Architects, and Engineers.
- **When to update:** When a new major feature is planned, or a significant architectural decision is made.

### 4. `README.md` (Onboarding)
- **Responsibility:** High-level overview of the app, installation instructions, and basic run commands.
- **Audience:** New developers setting up the project for the first time.
- **When to update:** When the build system, environment variables, or run commands change.

## Architecture Decision Records (ADR)

We use a lightweight ADR system to permanently preserve the *context* behind engineering decisions. Years from now, engineers should not have to guess why we chose IndexedDB over LocalStorage.

**Where they live:** `/docs/adr/`
**Format:** `YYYY-MM-DD-short-title.md`

### ADR Template
Whenever introducing a major architectural shift (e.g., Adding Cloud Sync, Changing State Management), create an ADR detailing:
- **Context:** The environment and constraints at the time.
- **Problem:** What needs to be solved.
- **Options Considered:** What alternatives were evaluated.
- **Decision:** What was chosen.
- **Trade-offs:** What we sacrificed to make this choice.
- **Consequences:** How this impacts the rest of the system.

## Documentation Maintenance Rules
1. **Document Ownership:** The engineer writing a feature is responsible for updating the corresponding documentation in the same PR.
2. **Code as Truth:** Prefer self-documenting code (good variable names, strict Zod schemas, TypeScript types) over inline code comments.
3. **When NOT to Document:** Do not write documentation explaining *what* a React component does if reading the component's name and props makes it obvious. Only document the *why*.
