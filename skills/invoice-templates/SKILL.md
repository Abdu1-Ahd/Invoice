---
name: Invoice Template Engine Rules
description: Enforces modular design. Invoice PDF and HTML template engine.
---

# Invoice Template Engine

## Why exist
User demand custom premium invoice design. Hardcode single layout unacceptable. Template engine must swap theme (Modern, Corporate, Medical) instant.

## Philosophy
Template pure "View" function. Take domain data (Invoice, Customer, Agency) return rendered UI. No business logic. No state manipulation.

## Rules
1. **Strict Interface:** All template implement exact same React Props interface (`InvoiceTemplateProps`).
2. **Dual Rendering:** Support render DOM (preview/web) and render PDF. Template use CSS/layout compatible `html2canvas` + `jsPDF` or `pdf-lib`.
3. **No Network Request:** Template assume offline. Logo pass as Base64 string. No external URL.

## Review Checklist
- [ ] New template adhere `InvoiceTemplateProps`?
- [ ] Work offline with Base64 asset?
- [ ] Free of state mutation? (pure function)
