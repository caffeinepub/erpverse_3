import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface InvoiceLineItem {
    description: string;
    quantity: bigint;
    unitPrice: bigint;
}
export interface FinancialSummary {
    invoiceCount: bigint;
    totalIncome: bigint;
    totalExpenses: bigint;
    paidInvoiceCount: bigint;
    netBalance: bigint;
}
export interface CompanyProfile {
    employeeCount: bigint;
    name: string;
    sector: string;
    email: string;
    foundingYear: bigint;
    taxNumber: string;
    address: string;
    authorizedPerson: string;
    phone: PhoneNumber;
}
export interface CommunicationLog {
    id: string;
    date: string;
    note: string;
    logType: string;
    customerId: string;
    companyId: CompanyId;
}
export interface ProjectTask {
    id: string;
    status: string;
    assignee?: Principal;
    title: string;
    dueDate: string;
    projectId: string;
    companyId: CompanyId;
}
export interface Invoice {
    id: string;
    status: string;
    lineItems: Array<InvoiceLineItem>;
    client: string;
    total: bigint;
    date: string;
    companyId: CompanyId;
}
export interface DashboardSummary {
    totalEmployees: bigint;
    openProjects: bigint;
    pendingInvoices: bigint;
    totalStaff: bigint;
    lowStockProducts: bigint;
    totalCustomers: bigint;
}
export interface Customer {
    id: string;
    contactInfo: string;
    customerCompanyName: string;
    name: string;
    companyId: CompanyId;
}
export interface Role {
    permissions: Array<string>;
    name: string;
    parentRole?: string;
}
export interface PhoneNumber {
    countryCode: string;
    number: string;
}
export interface Transaction {
    id: string;
    transactionType: string;
    date: string;
    description: string;
    category: string;
    amount: bigint;
    companyId: CompanyId;
}
export type EmployeeCode = string;
export interface LeaveRequest {
    id: string;
    status: string;
    endDate: string;
    employeeId: string;
    leaveType: string;
    startDate: string;
    companyId: CompanyId;
}
export interface SalaryInfo {
    id: string;
    employeeId: string;
    currency: string;
    baseSalary: bigint;
    companyId: CompanyId;
}
export type CompanyId = string;
export interface Staff {
    roleCode: bigint;
    principal: Principal;
    employeeCode: EmployeeCode;
    grantedModules: Array<string>;
    name: string;
    projectManager: string;
    memberships: Array<CompanyMembership>;
    companyId: CompanyId;
}
export interface EmployeeRecord {
    id: string;
    title: string;
    principal?: Principal;
    hireDate: string;
    name: string;
    department: string;
    companyId: CompanyId;
}
export interface SalesOpportunity {
    id: string;
    closeDate: string;
    stage: string;
    estimatedValue: bigint;
    customerId: string;
    companyId: CompanyId;
}
export interface CompanyMembership {
    roleCode: bigint;
    grantedModules: Array<string>;
    companyId: string;
}
export interface Company {
    id: CompanyId;
    employeeCount: bigint;
    managers: Array<Principal>;
    owner: Principal;
    name: string;
    sector: string;
    email: string;
    foundingYear: bigint;
    taxNumber: string;
    address: string;
    authorizedPerson: string;
    phone: PhoneNumber;
}
export interface Project {
    id: string;
    status: string;
    name: string;
    description: string;
    deadline: string;
    teamMembers: Array<Principal>;
    companyId: CompanyId;
}
export interface StockMovement {
    id: string;
    date: string;
    productId: string;
    movementType: string;
    quantity: bigint;
    reason: string;
    companyId: CompanyId;
}
export interface Product {
    id: string;
    sku: string;
    name: string;
    quantityOnHand: bigint;
    category: string;
    unitPrice: bigint;
    companyId: CompanyId;
}
export interface UserProfile {
    roleCode: bigint;
    employeeCode: string;
    name: string;
    projectManager: string;
    memberships: Array<CompanyMembership>;
    companyId: string;
}
export enum RoleAssignmentResult {
    alreadyAssigned = "alreadyAssigned",
    invalidCode = "invalidCode",
    invalidRole = "invalidRole",
    success = "success",
    insufficientPermissions = "insufficientPermissions"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCommunicationLog(companyId: CompanyId, log: CommunicationLog): Promise<CommunicationLog>;
    addCustomRole(companyId: string, role: Role): Promise<void>;
    /**
     * / ==========================
     * / CRM Module
     * / ==========================
     */
    addCustomer(companyId: CompanyId, customer: Customer): Promise<Customer>;
    /**
     * / ==========================
     * / HR Module
     * / ==========================
     */
    addEmployee(companyId: CompanyId, employee: EmployeeRecord): Promise<EmployeeRecord>;
    addInvoice(companyId: CompanyId, invoice: Invoice): Promise<Invoice>;
    addLeaveRequest(companyId: CompanyId, request: LeaveRequest): Promise<LeaveRequest>;
    /**
     * / ==========================
     * / Inventory Module
     * / ==========================
     */
    addProduct(companyId: CompanyId, product: Product): Promise<Product>;
    addSalaryInfo(companyId: CompanyId, salary: SalaryInfo): Promise<SalaryInfo>;
    addSalesOpportunity(companyId: CompanyId, opportunity: SalesOpportunity): Promise<SalesOpportunity>;
    addStaffToCompany(companyId: CompanyId, employeeCode: EmployeeCode, roleName: string): Promise<RoleAssignmentResult>;
    addStockMovement(companyId: CompanyId, movement: StockMovement): Promise<StockMovement>;
    /**
     * / ==========================
     * / Accounting Module
     * / ==========================
     */
    addTransaction(companyId: CompanyId, tx: Transaction): Promise<Transaction>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCompany(profile: CompanyProfile): Promise<Company>;
    /**
     * / ==========================
     * / Project Management Module
     * / ==========================
     */
    createProject(companyId: CompanyId, project: Project): Promise<Project>;
    createProjectTask(companyId: CompanyId, task: ProjectTask): Promise<ProjectTask>;
    findByName(name: string): Promise<Company | null>;
    findByOwner(owner: Principal): Promise<Company | null>;
    findByToken(token: string): Promise<Company | null>;
    getAccountingData(companyId: CompanyId): Promise<{
        invoices: Array<Invoice>;
        transactions: Array<Transaction>;
    }>;
    getCRMData(companyId: CompanyId): Promise<{
        logs: Array<CommunicationLog>;
        opportunities: Array<SalesOpportunity>;
        customers: Array<Customer>;
    }>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCompany(companyId: string): Promise<Company | null>;
    /**
     * / ==========================
     * / Dashboard Summary
     * / ==========================
     */
    getDashboardSummary(companyId: CompanyId): Promise<DashboardSummary>;
    getFinancialSummary(companyId: CompanyId): Promise<FinancialSummary>;
    getGrantedModules(companyId: CompanyId, staffPrincipal: Principal): Promise<Array<string>>;
    getHRData(companyId: CompanyId): Promise<{
        employees: Array<EmployeeRecord>;
        leaveRequests: Array<LeaveRequest>;
        salaries: Array<SalaryInfo>;
    }>;
    getInventoryData(companyId: CompanyId): Promise<{
        movements: Array<StockMovement>;
        products: Array<Product>;
    }>;
    getMyEmployeeCode(): Promise<string | null>;
    getProjectData(companyId: CompanyId): Promise<{
        tasks: Array<ProjectTask>;
        projects: Array<Project>;
    }>;
    getStaffForCompany(companyId: CompanyId): Promise<Array<Staff>>;
    getStaffName(principal: Principal): Promise<string | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    grantModuleAccess(companyId: CompanyId, staffPrincipal: Principal, moduleName: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isEmployeeInCompany(companyId: string): Promise<boolean>;
    isRegisteredAsCompany(): Promise<string | null>;
    listDefaultRoles(): Promise<Array<Role>>;
    listRolesForCompany(companyId: string): Promise<Array<Role>>;
    removeCustomRole(companyId: string, roleName: string): Promise<void>;
    removeCustomer(companyId: CompanyId, customerId: string): Promise<boolean>;
    removeEmployee(companyId: CompanyId, employeeId: string): Promise<boolean>;
    removeProduct(companyId: CompanyId, productId: string): Promise<boolean>;
    removeProject(companyId: CompanyId, projectId: string): Promise<boolean>;
    removeProjectTask(companyId: CompanyId, taskId: string): Promise<boolean>;
    removeStaffFromCompany(companyId: CompanyId, staffPrincipal: Principal): Promise<boolean>;
    removeTransaction(companyId: CompanyId, txId: string): Promise<boolean>;
    revokeModuleAccess(companyId: CompanyId, staffPrincipal: Principal, moduleName: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCompany(id: CompanyId, profile: CompanyProfile): Promise<Company>;
    updateCustomer(companyId: CompanyId, updatedCustomer: Customer): Promise<Customer>;
    updateEmployee(companyId: CompanyId, updatedEmployee: EmployeeRecord): Promise<EmployeeRecord>;
    updateInvoice(companyId: CompanyId, updatedInvoice: Invoice): Promise<Invoice>;
    updateLeaveRequest(companyId: CompanyId, updatedRequest: LeaveRequest): Promise<LeaveRequest>;
    updateProduct(companyId: CompanyId, updatedProduct: Product): Promise<Product>;
    updateProject(companyId: CompanyId, updatedProject: Project): Promise<Project>;
    updateProjectTask(companyId: CompanyId, updatedTask: ProjectTask): Promise<ProjectTask>;
    updateSalesOpportunity(companyId: CompanyId, updatedOpportunity: SalesOpportunity): Promise<SalesOpportunity>;
    updateStaffRole(companyId: CompanyId, staffPrincipal: Principal, newRoleName: string): Promise<RoleAssignmentResult>;
    updateTransaction(companyId: CompanyId, updatedTx: Transaction): Promise<Transaction>;
}
