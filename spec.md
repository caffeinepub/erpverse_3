# ERPVerse – Unified Business Management Platform

## Current State
Multi-tenant ERP platform on ICP. Internet Identity authentication, company registration, hierarchical role system (Owner → Manager → Administrator → Staff), multi-company staff membership, and 9 ERP modules (HR, Accounting, Projects, Inventory, CRM, Procurement, Manufacturing, Workflow, Reporting).

Backend fully implements HR, Accounting, Projects, Inventory, and CRM. Dashboard summary (`getDashboardSummary`) is backend-driven.

Procurement, Manufacturing, and Workflow modules exist only in the frontend and use `localStorage` — no backend types or functions exist for them.

## Requested Changes (Diff)

### Add
- Backend: `Supplier`, `PurchaseOrder`, `WorkOrder`, `BOMItem`, `WorkflowTask`, `WorkflowBoard` types in main.mo
- Backend: CRUD functions for Procurement (`addSupplier`, `updateSupplier`, `removeSupplier`, `addPurchaseOrder`, `updatePurchaseOrder`, `getProcurementData`)
- Backend: CRUD functions for Manufacturing (`addWorkOrder`, `updateWorkOrder`, `removeWorkOrder`, `addBOMItem`, `updateBOMItem`, `getManufacturingData`)
- Backend: CRUD functions for Workflow (`addWorkflowTask`, `updateWorkflowTask`, `removeWorkflowTask`, `getWorkflowData`)
- Frontend: Notification bell in Header — shows badge count for low stock (<10 qty), pending invoices, and overdue projects; dropdown panel lists them
- Frontend: i18n keys for all ERP module pages (HR, Accounting, CRM, Projects, Inventory, Procurement, Manufacturing, Workflow, Reporting) in LanguageContext

### Modify
- Backend: `getDashboardSummary` already exists and is correct — no change needed
- Frontend: `StaffDashboard` — fix `MODULE_LABELS` keys to use uppercase to match backend `grantedModules` values (`HR`, `Accounting`, `Projects`, `Inventory`, `CRM`, `Procurement`, `Manufacturing`, `Workflow`, `Reporting`)
- Frontend: `StaffDashboard` — `StaffCompanyCard` use `membership.roleCode` correctly when passing to `onEnterCompany`
- Frontend: `CompanySetupPage` — phone field split into `countryCode` + `number` sub-fields so it matches backend `PhoneNumber` type
- Frontend: `ProcurementModulePage` — replace all `localStorage` calls with backend `getProcurementData` / `addSupplier` / `addPurchaseOrder` etc.
- Frontend: `ManufacturingModulePage` — replace all `localStorage` calls with backend `getManufacturingData` / `addWorkOrder` / `addBOMItem` etc.
- Frontend: `WorkflowModulePage` — replace all `localStorage` calls with backend `getWorkflowData` / `addWorkflowTask` / `updateWorkflowTask` etc.
- Frontend: `ReportingModulePage` — pull real data from `getDashboardSummary`, `getFinancialSummary`, `getHRData`, `getInventoryData`, `getCRMData`, `getProjectData` hooks

### Remove
- Frontend: All `localStorage.getItem/setItem` calls in Procurement, Manufacturing, Workflow module pages

## Implementation Plan
1. Extend `main.mo` with Procurement, Manufacturing, Workflow types and CRUD functions
2. Fix `MODULE_LABELS` key casing in `StaffDashboard`
3. Fix phone field in `CompanySetupPage` (split into countryCode + number)
4. Wire `ProcurementModulePage` to backend hooks
5. Wire `ManufacturingModulePage` to backend hooks
6. Wire `WorkflowModulePage` to backend hooks
7. Wire `ReportingModulePage` to real backend data hooks
8. Add notification bell to `Header` component using `getDashboardSummary`
9. Add i18n keys for all ERP module labels in `LanguageContext`
