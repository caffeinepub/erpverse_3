import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PhoneNumber {
    countryCode: string;
    number: string;
}
export type EmployeeCode = string;
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
export type CompanyId = string;
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
export interface Staff {
    roleCode: bigint;
    principal: Principal;
    employeeCode: EmployeeCode;
    name: string;
    projectManager: string;
    companyId: CompanyId;
}
export interface UserProfile {
    roleCode: bigint;
    employeeCode: string;
    name: string;
    projectManager: string;
    companyId: string;
}
export interface Role {
    permissions: Array<string>;
    name: string;
    parentRole?: string;
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
    addStaffToCompany(companyId: CompanyId, employeeCode: EmployeeCode, roleName: string): Promise<RoleAssignmentResult>;
    adminAssignRole(user: Principal, role: UserRole): Promise<void>;
    adminListAllCompanies(): Promise<Array<Company>>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCompany(profile: CompanyProfile): Promise<Company>;
    findByName(name: string): Promise<Company | null>;
    findByOwner(owner: Principal): Promise<Company | null>;
    findByToken(token: string): Promise<Company | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCompany(companyId: string): Promise<Company | null>;
    getMyEmployeeCode(): Promise<string | null>;
    getStaffForCompany(companyId: CompanyId): Promise<Array<Staff>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isEmployeeInCompany(companyId: string): Promise<boolean>;
    isRegisteredAsCompany(): Promise<string | null>;
    listDefaultRoles(): Promise<Array<Role>>;
    listRolesForCompany(companyId: string): Promise<Array<Role>>;
    removeStaffFromCompany(companyId: CompanyId, staffPrincipal: Principal): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCompany(id: CompanyId, profile: CompanyProfile): Promise<Company>;
    updateRole(companyId: string, role: Role): Promise<void>;
    updateStaffRole(companyId: CompanyId, staffPrincipal: Principal, newRoleName: string): Promise<RoleAssignmentResult>;
}
