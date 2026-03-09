# ERPVerse

## Current State

The app is a full-stack ERP platform with:
- 9 ERP module pages (HR, Accounting, CRM, Projects, Inventory, Procurement, Manufacturing, Workflow, Reporting)
- Multi-language context (`LanguageContext`) with 505 translation keys across 10 languages (tr, en, de, fr, es, ar, ru, zh, ja, pt)
- Translation function `t()` available via `useLanguage()` hook
- All 317 ERP translation keys are defined in all locale files

**Confirmed bugs (from grep):**
1. ALL 12 pages have 0 `t()` calls despite `useLanguage` being imported — every visible string is hardcoded Turkish
2. `StaffRegistrationPage.tsx` line 42: `companyId: "unassigned"` hardcoded in profile object (should be empty string or left to backend default)
3. Company owner with multiple companies goes to `staff-dashboard` via `onBack` — no dedicated company selection view

## Requested Changes (Diff)

### Add
- Company selection screen (`CompanySelectPage`) for owners/managers with multiple companies
- `t()` calls throughout all 12 pages replacing hardcoded Turkish strings

### Modify
- `HRModulePage.tsx`: replace all hardcoded Turkish strings with `t('erp.hr.*')` and `t('erp.common.*')` keys
- `AccountingModulePage.tsx`: replace with `t('erp.accounting.*')` keys
- `CRMModulePage.tsx`: replace with `t('erp.crm.*')` keys
- `ProjectManagementModulePage.tsx`: replace with `t('erp.projects.*')` keys
- `InventoryModulePage.tsx`: replace with `t('erp.inventory.*')` keys
- `ProcurementModulePage.tsx`: replace with `t('erp.procurement.*')` keys
- `ManufacturingModulePage.tsx`: replace with `t('erp.manufacturing.*')` keys
- `WorkflowModulePage.tsx`: replace with `t('erp.workflow.*')` keys
- `ReportingModulePage.tsx`: replace with `t('erp.reporting.*')` keys
- `StaffDashboard.tsx`: replace hardcoded strings with `t('staff.*')`, `t('dashboard.*')`, `t('common.*')` keys
- `LandingPage.tsx`: replace with `t('landing.*')` keys
- `StaffRegistrationPage.tsx`: fix `companyId: "unassigned"` → `companyId: ""`
- `App.tsx`: add company select view state, pass list of companies to select from

### Remove
- Hardcoded Turkish strings from all pages listed above

## Implementation Plan

1. For each ERP module page: add `const { t } = useLanguage()` where missing, then replace every visible hardcoded Turkish string with the matching `t('erp.<module>.<key>')` call. Use `t('erp.common.*')` for shared labels.
2. For LandingPage and StaffDashboard: replace hardcoded strings with existing `t()` keys.
3. Fix `StaffRegistrationPage`: change `companyId: "unassigned"` to `companyId: ""`.
4. In `App.tsx`: add a `"company-select"` view. When owner has multiple company IDs (from `registeredCompanyId` and memberships), show a selection screen before entering dashboard. For now, the `onBack` from company-dashboard for owners goes to `"company-select"` if multiple companies exist, else to `"landing"`.
5. Create `CompanySelectPage.tsx`: simple page listing company cards for selection.
6. Validate and build.
