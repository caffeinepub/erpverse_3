# ERPVerse

## Current State
ERPVerse is a full ERP platform with 9 modules (HR, Accounting, CRM, Projects, Inventory, Procurement, Manufacturing, Workflow, Reporting), all connected to Motoko backend. Multi-language system exists (10 languages) with locale JSON files containing all translation keys. However ERP module pages use t() in only ~4-7% of their UI strings — the vast majority are hardcoded Turkish. Additionally: StaffRegistrationPage saves companyId as empty string causing routing issues; no dedicated company selection screen for multi-company owners; ModulePermissionsPage only has simple toggles.

## Requested Changes (Diff)

### Add
- Bulk assignment controls to ModulePermissionsPage ("Grant All" / "Revoke All" per row or per module column)
- Company selector screen/modal for users who own multiple companies

### Modify
- All 9 ERP module pages: replace every hardcoded Turkish string with t() calls using the already-existing locale keys (erp.hr.*, erp.accounting.*, erp.crm.*, erp.projects.*, erp.inventory.*, erp.procurement.*, erp.manufacturing.*, erp.workflow.*, erp.reporting.*). Also use erp.common.* for shared labels (add, edit, delete, save, cancel, close, search, filter, loading, noData, confirm, actions, status, notes, date, name, description, amount)
- StaffRegistrationPage: remove companyId field from the saved profile (backend handles company assignment separately); just omit companyId or send as empty string but ensure it doesn't break App.tsx routing
- App.tsx: when onBack is called from company-dashboard and user has multiple companies (check memberships array), show a company selection modal/view instead of going straight to staff-dashboard

### Remove
- Nothing

## Implementation Plan
1. Update all 9 ERP module pages to wrap every hardcoded Turkish label, button text, tab name, placeholder, toast message, table header, badge, empty state, and dialog title with t() using the correct key from erp.* namespace
2. Add erp.common.* keys usage for repeated labels across modules (Save, Cancel, Edit, Delete, Add, Search, Filter, Status, Date, Name, Description, Notes, Amount, Actions)
3. Improve ModulePermissionsPage: add "Grant All" button per staff row and "Revoke All" button; add per-column "Grant All" header button to give all staff access to a module at once
4. Fix routing in App.tsx to handle multi-company owner scenario on back navigation
5. Validate and build
