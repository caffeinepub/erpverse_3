import type { Principal } from "@dfinity/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CommunicationLog,
  Company,
  CompanyProfile,
  Customer,
  DashboardSummary,
  EmployeeRecord,
  FinancialSummary,
  Invoice,
  LeaveRequest,
  Product,
  Project,
  ProjectTask,
  Role,
  RoleAssignmentResult,
  SalaryInfo,
  SalesOpportunity,
  Staff,
  StockMovement,
  Transaction,
  UserProfile,
} from "../backend";
import { useActor } from "./useActor";

// ===========================
// User Profile Hooks
// ===========================
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["employeeCode"] });
    },
  });
}

export function useGetMyEmployeeCode() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ["employeeCode"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getMyEmployeeCode();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ===========================
// Company Hooks
// ===========================
export function useIsRegisteredAsCompany() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<string | null>({
    queryKey: ["isRegisteredAsCompany"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.isRegisteredAsCompany();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetCompany(companyId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Company | null>({
    queryKey: ["company", companyId],
    queryFn: async () => {
      if (!actor || !companyId) return null;
      return actor.getCompany(companyId);
    },
    enabled: !!actor && !actorFetching && !!companyId,
  });
}

export function useCreateCompany() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: CompanyProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createCompany(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isRegisteredAsCompany"] });
      queryClient.invalidateQueries({ queryKey: ["company"] });
    },
  });
}

export function useUpdateCompany() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      profile,
    }: { id: string; profile: CompanyProfile }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateCompany(id, profile);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["company", variables.id] });
    },
  });
}

// ===========================
// Staff Hooks
// ===========================
export function useGetStaffForCompany(companyId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Staff[], Error>({
    queryKey: ["staffForCompany", companyId],
    queryFn: async () => {
      if (!actor || !companyId) return [];
      try {
        return await actor.getStaffForCompany(companyId);
      } catch (err) {
        throw err instanceof Error ? err : new Error(String(err));
      }
    },
    enabled: !!actor && !actorFetching && !!companyId,
    retry: false,
  });
}

export function useAddStaffToCompany() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      employeeCode,
      roleName,
    }: {
      companyId: string;
      employeeCode: string;
      roleName: string;
    }): Promise<RoleAssignmentResult> => {
      if (!actor) throw new Error("Actor not available");
      return actor.addStaffToCompany(companyId, employeeCode, roleName);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["staffForCompany", variables.companyId],
      });
    },
  });
}

export function useRemoveStaffFromCompany() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      staffPrincipal,
    }: {
      companyId: string;
      staffPrincipal: Principal;
    }): Promise<boolean> => {
      if (!actor) throw new Error("Actor not available");
      return actor.removeStaffFromCompany(companyId, staffPrincipal);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["staffForCompany", variables.companyId],
      });
    },
  });
}

export function useUpdateStaffRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      staffPrincipal,
      newRoleName,
    }: {
      companyId: string;
      staffPrincipal: Principal;
      newRoleName: string;
    }): Promise<RoleAssignmentResult> => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateStaffRole(companyId, staffPrincipal, newRoleName);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["staffForCompany", variables.companyId],
      });
    },
  });
}

// ===========================
// Roles Hooks
// ===========================
export function useListDefaultRoles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Role[]>({
    queryKey: ["defaultRoles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listDefaultRoles();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useListRolesForCompany(companyId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Role[]>({
    queryKey: ["rolesForCompany", companyId],
    queryFn: async () => {
      if (!actor || !companyId) return [];
      return actor.listRolesForCompany(companyId);
    },
    enabled: !!actor && !actorFetching && !!companyId,
  });
}

// ===========================
// Module Access Hooks
// ===========================
export function useGetGrantedModules(
  companyId: string | null,
  staffPrincipal: Principal | null,
) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ["grantedModules", companyId, staffPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !companyId || !staffPrincipal) return [];
      return actor.getGrantedModules(companyId, staffPrincipal);
    },
    enabled: !!actor && !actorFetching && !!companyId && !!staffPrincipal,
    retry: false,
  });
}

export function useGrantModuleAccess() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      staffPrincipal,
      moduleName,
    }: {
      companyId: string;
      staffPrincipal: Principal;
      moduleName: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.grantModuleAccess(companyId, staffPrincipal, moduleName);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "grantedModules",
          variables.companyId,
          variables.staffPrincipal.toString(),
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["staffForCompany", variables.companyId],
      });
    },
  });
}

export function useRevokeModuleAccess() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      staffPrincipal,
      moduleName,
    }: {
      companyId: string;
      staffPrincipal: Principal;
      moduleName: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.revokeModuleAccess(companyId, staffPrincipal, moduleName);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "grantedModules",
          variables.companyId,
          variables.staffPrincipal.toString(),
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["staffForCompany", variables.companyId],
      });
    },
  });
}

// ===========================
// HR Module Hooks
// ===========================
export function useGetHRData(companyId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{
    employees: EmployeeRecord[];
    leaveRequests: LeaveRequest[];
    salaries: SalaryInfo[];
  }>({
    queryKey: ["hrData", companyId],
    queryFn: async () => {
      if (!actor || !companyId)
        return { employees: [], leaveRequests: [], salaries: [] };
      return actor.getHRData(companyId);
    },
    enabled: !!actor && !actorFetching && !!companyId,
  });
}

export function useAddEmployee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      employee,
    }: { companyId: string; employee: EmployeeRecord }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addEmployee(companyId, employee);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["hrData", variables.companyId],
      });
    },
  });
}

export function useUpdateEmployee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      employee,
    }: { companyId: string; employee: EmployeeRecord }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateEmployee(companyId, employee);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["hrData", variables.companyId],
      });
    },
  });
}

export function useRemoveEmployee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      employeeId,
    }: { companyId: string; employeeId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removeEmployee(companyId, employeeId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["hrData", variables.companyId],
      });
    },
  });
}

export function useAddLeaveRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      request,
    }: { companyId: string; request: LeaveRequest }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addLeaveRequest(companyId, request);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["hrData", variables.companyId],
      });
    },
  });
}

export function useUpdateLeaveRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      request,
    }: { companyId: string; request: LeaveRequest }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateLeaveRequest(companyId, request);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["hrData", variables.companyId],
      });
    },
  });
}

export function useAddSalaryInfo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      salary,
    }: { companyId: string; salary: SalaryInfo }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addSalaryInfo(companyId, salary);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["hrData", variables.companyId],
      });
    },
  });
}

// ===========================
// Accounting Module Hooks
// ===========================
export function useGetAccountingData(companyId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{ invoices: Invoice[]; transactions: Transaction[] }>({
    queryKey: ["accountingData", companyId],
    queryFn: async () => {
      if (!actor || !companyId) return { invoices: [], transactions: [] };
      return actor.getAccountingData(companyId);
    },
    enabled: !!actor && !actorFetching && !!companyId,
  });
}

export function useAddTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      tx,
    }: { companyId: string; tx: Transaction }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addTransaction(companyId, tx);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["accountingData", variables.companyId],
      });
    },
  });
}

export function useUpdateTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      tx,
    }: { companyId: string; tx: Transaction }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateTransaction(companyId, tx);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["accountingData", variables.companyId],
      });
    },
  });
}

export function useRemoveTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      txId,
    }: { companyId: string; txId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removeTransaction(companyId, txId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["accountingData", variables.companyId],
      });
    },
  });
}

export function useAddInvoice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      invoice,
    }: { companyId: string; invoice: Invoice }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addInvoice(companyId, invoice);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["accountingData", variables.companyId],
      });
    },
  });
}

export function useUpdateInvoice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      invoice,
    }: { companyId: string; invoice: Invoice }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateInvoice(companyId, invoice);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["accountingData", variables.companyId],
      });
    },
  });
}

// ===========================
// Project Management Hooks
// ===========================
export function useGetProjectData(companyId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{ projects: Project[]; tasks: ProjectTask[] }>({
    queryKey: ["projectData", companyId],
    queryFn: async () => {
      if (!actor || !companyId) return { projects: [], tasks: [] };
      return actor.getProjectData(companyId);
    },
    enabled: !!actor && !actorFetching && !!companyId,
  });
}

export function useCreateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      project,
    }: { companyId: string; project: Project }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createProject(companyId, project);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["projectData", variables.companyId],
      });
    },
  });
}

export function useUpdateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      project,
    }: { companyId: string; project: Project }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateProject(companyId, project);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["projectData", variables.companyId],
      });
    },
  });
}

export function useRemoveProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      projectId,
    }: { companyId: string; projectId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removeProject(companyId, projectId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["projectData", variables.companyId],
      });
    },
  });
}

export function useCreateProjectTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      task,
    }: { companyId: string; task: ProjectTask }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createProjectTask(companyId, task);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["projectData", variables.companyId],
      });
    },
  });
}

export function useUpdateProjectTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      task,
    }: { companyId: string; task: ProjectTask }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateProjectTask(companyId, task);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["projectData", variables.companyId],
      });
    },
  });
}

export function useRemoveProjectTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      taskId,
    }: { companyId: string; taskId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removeProjectTask(companyId, taskId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["projectData", variables.companyId],
      });
    },
  });
}

// ===========================
// Inventory Module Hooks
// ===========================
export function useGetInventoryData(companyId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{ products: Product[]; movements: StockMovement[] }>({
    queryKey: ["inventoryData", companyId],
    queryFn: async () => {
      if (!actor || !companyId) return { products: [], movements: [] };
      return actor.getInventoryData(companyId);
    },
    enabled: !!actor && !actorFetching && !!companyId,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      product,
    }: { companyId: string; product: Product }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addProduct(companyId, product);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["inventoryData", variables.companyId],
      });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      product,
    }: { companyId: string; product: Product }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateProduct(companyId, product);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["inventoryData", variables.companyId],
      });
    },
  });
}

export function useRemoveProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      productId,
    }: { companyId: string; productId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removeProduct(companyId, productId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["inventoryData", variables.companyId],
      });
    },
  });
}

export function useAddStockMovement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      movement,
    }: { companyId: string; movement: StockMovement }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addStockMovement(companyId, movement);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["inventoryData", variables.companyId],
      });
    },
  });
}

// ===========================
// CRM Module Hooks
// ===========================
export function useGetCRMData(companyId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{
    customers: Customer[];
    opportunities: SalesOpportunity[];
    logs: CommunicationLog[];
  }>({
    queryKey: ["crmData", companyId],
    queryFn: async () => {
      if (!actor || !companyId)
        return { customers: [], opportunities: [], logs: [] };
      return actor.getCRMData(companyId);
    },
    enabled: !!actor && !actorFetching && !!companyId,
  });
}

export function useAddCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      customer,
    }: { companyId: string; customer: Customer }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addCustomer(companyId, customer);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["crmData", variables.companyId],
      });
    },
  });
}

export function useUpdateCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      customer,
    }: { companyId: string; customer: Customer }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateCustomer(companyId, customer);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["crmData", variables.companyId],
      });
    },
  });
}

export function useRemoveCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      customerId,
    }: { companyId: string; customerId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removeCustomer(companyId, customerId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["crmData", variables.companyId],
      });
    },
  });
}

export function useAddSalesOpportunity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      opportunity,
    }: { companyId: string; opportunity: SalesOpportunity }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addSalesOpportunity(companyId, opportunity);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["crmData", variables.companyId],
      });
    },
  });
}

export function useUpdateSalesOpportunity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      opportunity,
    }: { companyId: string; opportunity: SalesOpportunity }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateSalesOpportunity(companyId, opportunity);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["crmData", variables.companyId],
      });
    },
  });
}

export function useAddCommunicationLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      log,
    }: { companyId: string; log: CommunicationLog }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addCommunicationLog(companyId, log);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["crmData", variables.companyId],
      });
    },
  });
}

// ===========================
// Dashboard Summary Hooks
// ===========================
export function useGetDashboardSummary(companyId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DashboardSummary | null>({
    queryKey: ["dashboardSummary", companyId],
    queryFn: async () => {
      if (!actor || !companyId) return null;
      return actor.getDashboardSummary(companyId);
    },
    enabled: !!actor && !actorFetching && !!companyId,
  });
}

export function useGetFinancialSummary(companyId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FinancialSummary | null>({
    queryKey: ["financialSummary", companyId],
    queryFn: async () => {
      if (!actor || !companyId) return null;
      return actor.getFinancialSummary(companyId);
    },
    enabled: !!actor && !actorFetching && !!companyId,
  });
}

export function useGetStaffName(principal: Principal | null | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ["staffName", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getStaffName(principal);
    },
    enabled: !!actor && !actorFetching && !!principal,
    staleTime: 5 * 60 * 1000, // 5 minutes - names don't change often
  });
}

// ===========================
// Custom Role Hooks
// ===========================
export function useAddCustomRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      role,
    }: { companyId: string; role: Role }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addCustomRole(companyId, role);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["rolesForCompany", variables.companyId],
      });
    },
  });
}

export function useRemoveCustomRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      roleName,
    }: { companyId: string; roleName: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removeCustomRole(companyId, roleName);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["rolesForCompany", variables.companyId],
      });
    },
  });
}
