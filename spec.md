# ERPVerse – Unified Business Management Platform

## Current State

ERPVerse is a multi-tenant ERP platform built on ICP with Motoko backend and React/TypeScript frontend.

Existing modules (backend + frontend):
- Authentication: Internet Identity, company registration, staff registration with 12-char unique employee code
- Company Management: multi-tenant isolation, company profile CRUD
- Role & Permission System: Owner → Manager → Administrator → Staff hierarchy, custom role support, module-level access control
- HR Module: employee records, leave requests, salary info
- Accounting Module: transactions, invoices, financial summary
- Project Management Module: projects, tasks, Kanban board
- Inventory Module: products, stock movements, low-stock badges
- CRM Module: customers, sales opportunities, communication logs, pipeline view
- Dashboard Summary: aggregated stats from all modules
- Multi-language support: Turkish, English, German, French, Spanish, Arabic (RTL), Russian, Chinese, Japanese, Portuguese

## Requested Changes (Diff)

### Add

1. **Satın Alma & Tedarik (Purchase & Procurement) Module**
   - Backend types: `PurchaseOrder` (id, companyId, supplier, items:[{description,quantity,unitPrice}], total, status, orderDate, expectedDelivery), `Supplier` (id, companyId, name, contactInfo, category)
   - Backend functions: addSupplier, updateSupplier, removeSupplier, addPurchaseOrder, updatePurchaseOrder, removePurchaseOrder, getProcurementData
   - Frontend page: ProcurementModulePage.tsx — supplier list + purchase order list, CRUD dialogs, status badges (pending/approved/delivered/cancelled)
   - Module access key: "Procurement"

2. **Üretim Yönetimi (Manufacturing) Module**
   - Backend types: `WorkOrder` (id, companyId, productName, quantity, status, startDate, endDate, assignedTeam:[Principal]), `BOM` / Bill of Materials item (id, companyId, workOrderId, materialName, quantityNeeded)
   - Backend functions: createWorkOrder, updateWorkOrder, removeWorkOrder, addBOMItem, getBOMForWorkOrder, getManufacturingData
   - Frontend page: ManufacturingModulePage.tsx — work orders list with status, BOM viewer per work order, CRUD dialogs
   - Module access key: "Manufacturing"

3. **Görev & İş Akışı Yönetimi (Task & Workflow) Module**
   - Backend types: `WorkflowTask` (id, companyId, title, description, assignee:?Principal, priority, status, dueDate, tags:[Text]), `Workflow` (id, companyId, name, description, taskIds:[Text])
   - Backend functions: createWorkflowTask, updateWorkflowTask, removeWorkflowTask, createWorkflow, updateWorkflow, removeWorkflow, getWorkflowData
   - Frontend page: WorkflowModulePage.tsx — Kanban-style board (Backlog/Todo/In Progress/Done), task cards with priority badge, CRUD dialogs
   - Module access key: "Workflow"

4. **Raporlama & Analitik (Reporting & Analytics) Module**
   - No new backend types; uses getDashboardSummary + getFinancialSummary + getHRData + getCRMData + getInventoryData + getProjectData
   - Frontend page: ReportingModulePage.tsx — visual charts (bar, line, pie using recharts/simple SVG), sections: Financial Overview, HR Summary, Project Status, Inventory Alerts, CRM Pipeline summary
   - Module access key: "Reporting"

5. **DashboardSummary extension**
   - Add `totalWorkOrders: Nat`, `pendingPurchaseOrders: Nat` to backend DashboardSummary type and getDashboardSummary function

6. **Navigation & Module Registry**
   - Add 4 new module entries to CompanyOwnerDashboard and StaffDashboard module lists
   - Grant module access flow supports new module keys

### Modify

- `DashboardSummary` type: add 2 new fields
- `getDashboardSummary` function: count work orders and pending purchase orders
- Module list constants in frontend (wherever modules are listed/filtered): add Procurement, Manufacturing, Workflow, Reporting
- Translation files (all 10 languages): add module names and common labels for new modules

### Remove

Nothing removed.

## Implementation Plan

1. Extend `main.mo` with:
   - New types: Supplier, PurchaseOrder, WorkOrder, BOMItem, WorkflowTask, Workflow
   - New state maps: suppliers, purchaseOrders, workOrders, bomItems, workflowTasks, workflows
   - New CRUD functions for each module (access-gated with module key)
   - Extend DashboardSummary + getDashboardSummary

2. Add 4 new frontend pages:
   - ProcurementModulePage.tsx
   - ManufacturingModulePage.tsx
   - WorkflowModulePage.tsx
   - ReportingModulePage.tsx

3. Register new pages in App.tsx routing
4. Add module entries to dashboard navigation in CompanyOwnerDashboard.tsx and StaffDashboard.tsx
5. Add translations for new modules in all locale files
6. Validate (typecheck + lint + build) and fix any errors
