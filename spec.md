# ERPVerse – Unified Business Management Platform

## Current State

- Multi-tenant ERP platform with Internet Identity authentication
- Two login portals: Company Owner/Setup and Staff
- Backend: Motoko with full ERP modules (HR, Accounting, Project, Inventory, CRM) all backend-connected
- Frontend: React + TypeScript, open/light theme, multi-language (TR, EN, DE, FR, ES, AR, RU, ZH, JA, PT)
- Staff type holds single `companyId` — no multi-company membership
- Company roles are hardcoded defaults only — no custom role creation
- Staff Dashboard does not route to ERP module pages
- FinancialSummary type defined but never computed or displayed
- Project task assignee shown as Principal ID, not name
- Dashboard overview lacks aggregated ERP statistics
- Internet Identity redirect sometimes loses portalMode from sessionStorage causing login loop

## Requested Changes (Diff)

### Add
- Multi-company membership for Staff: a single person can belong to multiple companies with different roles (replace `companyId: Text` + `roleCode: Nat` with `memberships: [{ companyId, roleCode, grantedModules }]` in backend and new query functions)
- Custom role management: Company Owner/Manager can add and delete custom roles per company (backend: `companyRoles` map, `addCustomRole`, `removeCustomRole`, `listCompanyRoles` functions)
- Staff Dashboard: company selector showing all companies the staff belongs to, then ERP module navigation based on granted modules
- Financial Summary computation: `getFinancialSummary(companyId)` query returning totalIncome, totalExpenses, netBalance, invoiceCount, paidInvoiceCount
- Staff name lookup: `getStaffName(principal)` query to display names instead of Principal IDs in project tasks
- Dashboard overview stats: total employees (HR), open projects, low-stock products, pending invoices, total CRM customers

### Modify
- `Staff` type: add `memberships` array field; keep `companyId` and `roleCode` as derived/compat fields for backward compat
- `addStaffToCompany`: update to add membership entry instead of overwriting companyId
- `removeStaffFromCompany`: remove specific membership, not set companyId="unassigned"
- `getStaffForCompany`: use memberships array for lookup
- `isCallerCompanyMember` / `getCallerCompanyRole`: use memberships array
- `isRegisteredAsCompany`: unchanged
- App.tsx login flow: make portalMode persistence more robust — store before calling login(), read immediately after II returns
- StaffDashboard: show company list with Enter button, then inside each company show ERP module tiles based on grantedModules
- AccountingModulePage: add FinancialSummary panel at top using new query
- ProjectManagementModulePage: resolve assignee Principal to staff name using getStaffName
- CompanyOwnerDashboard overview: add ERP summary cards

### Remove
- Nothing removed

## Implementation Plan

1. **Backend (Motoko)**:
   - Add `CompanyMembership` type: `{ companyId: Text; roleCode: Nat; grantedModules: [Text] }`
   - Extend `Staff` with `memberships: [CompanyMembership]` (keep `companyId`/`roleCode` for compatibility, derived from first membership)
   - Add `companyRoles` map: `Map<CompanyId, [Role]>`
   - Add `addCustomRole(companyId, role)`, `removeCustomRole(companyId, roleName)`, `listCompanyRoles(companyId)` functions
   - Update `addStaffToCompany` to push to memberships array
   - Update `removeStaffFromCompany` to filter memberships
   - Update `getStaffForCompany` to use memberships
   - Update `isCallerCompanyMember` / `getCallerCompanyRole` to check memberships
   - Add `getFinancialSummary(companyId)` query
   - Add `getStaffName(principal)` query
   - Add `getDashboardSummary(companyId)` returning HR/project/inventory/CRM stats

2. **Frontend**:
   - Update App.tsx: store portalMode before login(), improved sessionStorage reliability
   - Update StaffDashboard: multi-company view with ERP module tiles per company
   - Update CompanyOwnerDashboard overview: add ERP stats cards
   - Add CustomRoleManager component to staff management view
   - Update AccountingModulePage: FinancialSummary panel
   - Update ProjectManagementModulePage: staff name resolution
