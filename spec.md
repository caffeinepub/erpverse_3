# ERPVerse

## Current State

ERPVerse is a full-stack multi-tenant ERP platform built on ICP with Motoko backend and React/TypeScript frontend. It supports 10 languages (TR default, EN, DE, FR, ES, AR, RU, ZH, JA, PT). The platform has 9 ERP modules: HR, Accounting, CRM, Projects, Inventory, Procurement, Manufacturing, Workflow, Reporting.

All modules are backend-connected. The locale files (`tr.json`, `en.json`, etc.) have translation keys for the shell UI (nav, landing, dashboard, sidebar) but NOT for ERP module page content. The 9 ERP module pages (~9300 lines total) use hardcoded Turkish strings and do NOT import or use `useLanguage`/`t()`.

## Requested Changes (Diff)

### Add
- `erp` section in all 10 locale files (tr, en, de, fr, es, ar, ru, zh, ja, pt) with ERP module content translations: common ERP actions, HR terms, Accounting terms, CRM terms, Project terms, Inventory terms, Procurement terms, Manufacturing terms, Workflow terms, Reporting terms
- `useLanguage` import and usage in all 9 ERP module pages

### Modify
- All 9 ERP module pages: import `useLanguage`, add `const { t } = useLanguage()`, replace hardcoded Turkish labels/headings/tabs/buttons with `t()` calls using the new `erp.*` keys
- Locale files: add `erp` section with all module-specific translations

### Remove
- Hardcoded Turkish strings in ERP module page headings, tab labels, button text, table headers, form labels, status labels, and dialog titles

## Implementation Plan

1. Add `erp` translation section to all 10 locale files with comprehensive ERP module content keys
2. Update `HRModulePage.tsx`: add `useLanguage`, replace hardcoded strings with `t('erp.hr.*')` and `t('erp.common.*')`
3. Update `AccountingModulePage.tsx`: same pattern
4. Update `CRMModulePage.tsx`: same pattern
5. Update `ProjectManagementModulePage.tsx`: same pattern
6. Update `InventoryModulePage.tsx`: same pattern
7. Update `ProcurementModulePage.tsx`: same pattern
8. Update `ManufacturingModulePage.tsx`: same pattern
9. Update `WorkflowModulePage.tsx`: same pattern
10. Update `ReportingModulePage.tsx`: same pattern
