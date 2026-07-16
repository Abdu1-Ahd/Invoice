---
name: Invoice Performance Philosophy
description: Defines strategy for fast app. Rendering philosophy. Expensive computation rules.
---

# Performance Philosophy

## Why exist
Professional offline app must feel instantaneous. 2 second calculation bad. Scroll stutter bad. Premium feel destroyed.

## Philosophy
Performance architectural principle, not afterthought. No optimize blindly. Design naturally fast system. Add complex memoization only when profiling prove bottleneck.

## Rules

### 1. Measure Before Optimizing
No wrap every function `useCallback`. No wrap every component `React.memo`. Add memory overhead. Slow app down. Use only for heavy child props or fix infinite loop.

### 2. State Update Philosophy
- Prefer composition over prop drill or global state.
- Component re-render frequent (text input)? Isolate state local. No hoist to parent or Zustand if cause sibling re-render.

### 3. Large List Rendering
- Never render flat map 1,000+ items direct to DOM. 
- List grow beyond 100? Must implement **Virtualization** (`@tanstack/react-virtual`).

### 4. Expensive Computations
- Math fast. Create 10,000 object slow. 
- Aggregate report (Total Revenue)? Calculate in Web Worker or memoize `useMemo`. No recalculate every keystroke.
- Better: Storage layer handle aggregation if IndexedDB wrapper support query.

### 5. Bundle Size & Lazy Loading
- Keep initial bundle tiny. 
- Heavy dependency (`pdf-lib`, `recharts`) MUST lazy-load. 
- Routes lazy-load (`React.lazy()`). User no download massive PDF code for dashboard.

## Review Checklist
- [ ] Heavy library lazy loaded?
- [ ] `useMemo` use appropriate for heavy math?
- [ ] Long list virtualized?
