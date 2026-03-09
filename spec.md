# ERPVerse

## Current State
The application is a multi-tenant ERP platform with 9 ERP module pages (HR, Accounting, CRM, ProjectManagement, Inventory, Procurement, Manufacturing, Workflow, Reporting). The translation system uses 10 locale JSON files (tr, en, de, fr, es, ar, ru, zh, ja, pt) loaded via LanguageContext. Currently ALL 9 ERP module pages have zero internationalization — every UI string is hardcoded Turkish.

## Requested Changes (Diff)

### Add
- New translation namespaces in all 10 locale JSON files: `hr.*`, `accounting.*`, `crm.*`, `projects.*`, `inventory.*`, `procurement.*`, `manufacturing.*`, `workflow.*`
- Each namespace covers: page title/subtitle, stat card labels, tab labels, section headings, table headers, button labels, empty states, status badges, dialog titles, form labels/placeholders, toast messages

### Modify
- HRModulePage.tsx: add `useLanguage` hook, replace all hardcoded Turkish strings with `t()` calls
- AccountingModulePage.tsx: add `useLanguage` hook, replace all hardcoded Turkish strings with `t()` calls
- CRMModulePage.tsx: add `useLanguage` hook, replace all hardcoded Turkish strings with `t()` calls
- ProjectManagementModulePage.tsx: add `useLanguage` hook, replace all hardcoded Turkish strings with `t()` calls
- InventoryModulePage.tsx: add `useLanguage` hook, replace all hardcoded Turkish strings with `t()` calls
- ProcurementModulePage.tsx: add `useLanguage` hook, replace all hardcoded Turkish strings with `t()` calls
- ManufacturingModulePage.tsx: add `useLanguage` hook, replace all hardcoded Turkish strings with `t()` calls
- WorkflowModulePage.tsx: add `useLanguage` hook, replace all hardcoded Turkish strings with `t()` calls
- Static config arrays (DEPARTMENTS, LEAVE_TYPES, STAGES, TASK_STATUSES, etc.) defined outside components must be moved inside or converted to use `t()` in scope

### Remove
- All hardcoded Turkish text in ERP module pages

## Implementation Plan
1. Add new translation keys to all 10 locale JSON files simultaneously
2. Update each ERP module page to import `useLanguage` and use `t()` for every UI string
3. Move static config arrays inside component functions so `t()` is in scope
4. Validate and build
