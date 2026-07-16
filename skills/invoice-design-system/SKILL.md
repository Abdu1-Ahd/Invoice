---
name: Invoice Design System Rules
description: Enforces semantic tokens, UI philosophy, visual consistency. Stop UI decay.
---

# Design System Engineering

## Why exist
Hex picker colors bad. Random `p-[17px]` evil. UI degrade into mess. Skill ensures application visually cohesive and premium. Use engineered design system, not ad-hoc style.

## Philosophy
No hardcode color. No hardcode space. Use **Semantic Design Tokens**. Design system source of truth. UI cohesive everywhere.

## Rules

### 1. Semantic Tokens
Never use raw Tailwind color (`text-gray-500`, `bg-blue-600`). Use semantic tokens:
- `text-muted` not `text-gray-500`
- `bg-primary` not `bg-blue-600`
- `border-subtle` not `border-gray-200`
*(Tokens in `tailwind.config.js`. Defined `src/core/theme/global.css`.)*

### 2. Spacing & Typography Hierarchy
Rigid scale system. No invent new space (`p-[17px]`).
- Use Tailwind spacing (`p-2`, `p-4`, `p-6`).
- Strict typography hierarchy (`h1`, `h2`, `body`). Use `<Typography variant="h2">`. No random font-size utility.

### 3. Component Composition & Evolution
- Build large UI from small reusable atoms (`src/shared/components`). 
- Generic component need 10+ props for specific feature? **Stop**. Component too complex. Build feature-specific wrapper instead. Avoid bloat.

### 4. Accessibility (a11y)
Design system accessible default.
- Include `aria-label` for icon-only button.
- Focus rings visible (`focus-visible:ring`).
- High color contrast (WCAG AA).

### 5. Icons, Elevation & Radius
- Single consistent icon library (Lucide React).
- Consistent border-radius (`rounded-lg` for card, `rounded-md` for button).
- Strict elevation steps (Shadow) for depth. 

## Bad Practices
```javascript
// BAD: Ad-hoc styling, hardcoded colors, magic numbers
<div className="bg-gray-100 p-[15px] rounded-[10px] text-[#333]">
  <button className="bg-blue-500 text-white p-2">Submit</button>
</div>
```

## Good Practices
```javascript
// GOOD: Semantic tokens, strict scale, shared components
<Card className="p-6 bg-surface">
  <Typography variant="body" className="text-foreground">...</Typography>
  <Button variant="primary">Submit</Button>
</Card>
```

## Review Checklist
- [ ] Semantic tokens used? Raw hex/Tailwind colors rejected?
- [ ] UI rely exclusively on `src/shared/components` for primitives?
- [ ] Focus states and ARIA labels present?
