import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, CompanyProfile, Company, Staff, Role, RoleAssignmentResult } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
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
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['employeeCode'] });
    },
  });
}

export function useGetMyEmployeeCode() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ['employeeCode'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMyEmployeeCode();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ─── Company ─────────────────────────────────────────────────────────────────

export function useIsRegisteredAsCompany() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<string | null>({
    queryKey: ['isRegisteredAsCompany'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
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
    queryKey: ['company', companyId],
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
      if (!actor) throw new Error('Actor not available');
      return actor.createCompany(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isRegisteredAsCompany'] });
      queryClient.invalidateQueries({ queryKey: ['company'] });
    },
  });
}

export function useUpdateCompany() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, profile }: { id: string; profile: CompanyProfile }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCompany(id, profile);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['company', variables.id] });
    },
  });
}

// ─── Staff Management ─────────────────────────────────────────────────────────

export function useGetStaffForCompany(companyId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Staff[]>({
    queryKey: ['staffForCompany', companyId],
    queryFn: async () => {
      if (!actor || !companyId) return [];
      return actor.getStaffForCompany(companyId);
    },
    enabled: !!actor && !actorFetching && !!companyId,
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
      if (!actor) throw new Error('Actor not available');
      return actor.addStaffToCompany(companyId, employeeCode, roleName);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staffForCompany', variables.companyId] });
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
      if (!actor) throw new Error('Actor not available');
      return actor.removeStaffFromCompany(companyId, staffPrincipal);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staffForCompany', variables.companyId] });
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
      if (!actor) throw new Error('Actor not available');
      return actor.updateStaffRole(companyId, staffPrincipal, newRoleName);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staffForCompany', variables.companyId] });
    },
  });
}

// ─── Roles ────────────────────────────────────────────────────────────────────

export function useListDefaultRoles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Role[]>({
    queryKey: ['defaultRoles'],
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
    queryKey: ['rolesForCompany', companyId],
    queryFn: async () => {
      if (!actor || !companyId) return [];
      return actor.listRolesForCompany(companyId);
    },
    enabled: !!actor && !actorFetching && !!companyId,
  });
}
