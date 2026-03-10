import type { Staff } from "@/backend";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useGetStaffForCompany,
  useGrantModuleAccess,
  useRevokeModuleAccess,
} from "@/hooks/useQueries";
import { CheckCircle, Loader2, Shield } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";

interface ModulePermissionsPageProps {
  companyId: string;
}

const ERP_MODULES = [
  { name: "HR", labelKey: "erp.hr.title" },
  { name: "Accounting", labelKey: "erp.accounting.title" },
  { name: "Projects", labelKey: "erp.projects.title" },
  { name: "Inventory", labelKey: "erp.inventory.title" },
  { name: "CRM", labelKey: "erp.crm.title" },
  { name: "Procurement", labelKey: "erp.procurement.title" },
  { name: "Manufacturing", labelKey: "erp.manufacturing.title" },
  { name: "Workflow", labelKey: "erp.workflow.title" },
  { name: "Reporting", labelKey: "erp.reporting.title" },
];

function getRoleLabel(roleCode: number, t: (key: string) => string): string {
  switch (roleCode) {
    case 1:
      return t("roles.companyOwner");
    case 2:
      return t("roles.companyManager");
    case 3:
      return t("roles.companyAdministrator");
    default:
      return t("roles.companyStaff");
  }
}

export default function ModulePermissionsPage({
  companyId,
}: ModulePermissionsPageProps) {
  const { t } = useLanguage();
  const { data: staffList, isLoading } = useGetStaffForCompany(companyId);
  const grantMutation = useGrantModuleAccess();
  const revokeMutation = useRevokeModuleAccess();

  // Track pending toggles
  const [pendingToggles, setPendingToggles] = useState<Set<string>>(new Set());

  const handleToggle = async (
    staff: Staff,
    moduleName: string,
    currentlyGranted: boolean,
  ) => {
    const key = `${staff.principal.toString()}-${moduleName}`;
    if (pendingToggles.has(key)) return;

    setPendingToggles((prev) => new Set(prev).add(key));

    try {
      if (currentlyGranted) {
        await revokeMutation.mutateAsync({
          companyId,
          staffPrincipal: staff.principal,
          moduleName,
        });
        toast.success(
          `${moduleName} ${t("erp.modulePermissions.accessRevoked")}`,
        );
      } else {
        await grantMutation.mutateAsync({
          companyId,
          staffPrincipal: staff.principal,
          moduleName,
        });
        toast.success(
          `${moduleName} ${t("erp.modulePermissions.accessGranted")}`,
        );
      }
    } catch {
      toast.error(t("erp.modulePermissions.operationFailed"));
    } finally {
      setPendingToggles((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const handleGrantAll = async (staff: Staff) => {
    for (const m of ERP_MODULES) {
      if (!staff.grantedModules.includes(m.name)) {
        const key = `${staff.principal.toString()}-${m.name}`;
        setPendingToggles((prev) => new Set(prev).add(key));
        try {
          await grantMutation.mutateAsync({
            companyId,
            staffPrincipal: staff.principal,
            moduleName: m.name,
          });
        } catch {
          // continue
        } finally {
          setPendingToggles((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        }
      }
    }
    toast.success(`${t("erp.modulePermissions.grantAll")} ✓`);
  };

  const handleRevokeAll = async (staff: Staff) => {
    for (const m of ERP_MODULES) {
      if (staff.grantedModules.includes(m.name)) {
        const key = `${staff.principal.toString()}-${m.name}`;
        setPendingToggles((prev) => new Set(prev).add(key));
        try {
          await revokeMutation.mutateAsync({
            companyId,
            staffPrincipal: staff.principal,
            moduleName: m.name,
          });
        } catch {
          // continue
        } finally {
          setPendingToggles((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        }
      }
    }
    toast.success(`${t("erp.modulePermissions.revokeAll")} ✓`);
  };

  const handleGrantColumn = async (moduleName: string) => {
    for (const staff of managedStaff) {
      if (!staff.grantedModules.includes(moduleName)) {
        const key = `${staff.principal.toString()}-${moduleName}`;
        setPendingToggles((prev) => new Set(prev).add(key));
        try {
          await grantMutation.mutateAsync({
            companyId,
            staffPrincipal: staff.principal,
            moduleName,
          });
        } catch {
          // continue
        } finally {
          setPendingToggles((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        }
      }
    }
    toast.success(`${t("erp.modulePermissions.grantColumn")} ✓`);
  };

  // Filter out owners and managers (they always have full access)
  const managedStaff = (staffList || []).filter((s) => Number(s.roleCode) >= 3);
  const privilegedStaff = (staffList || []).filter(
    (s) => Number(s.roleCode) < 3,
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          {t("erp.modulePermissions.title")}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t("erp.modulePermissions.subtitle")}
        </p>
      </div>

      {/* Privileged staff notice */}
      {privilegedStaff.length > 0 && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-indigo-700 font-medium mb-2">
              {t("erp.modulePermissions.fullAccessTitle")}
            </p>
            <div className="flex flex-wrap gap-2">
              {privilegedStaff.map((s) => (
                <div
                  key={s.principal.toString()}
                  className="flex items-center gap-1.5 px-2 py-1 bg-white border border-indigo-200 rounded-full"
                >
                  <CheckCircle className="w-3 h-3 text-indigo-600" />
                  <span className="text-xs font-medium text-gray-800">
                    {s.name}
                  </span>
                  <Badge className="text-xs h-4 px-1 bg-indigo-100 text-indigo-700 border border-indigo-200">
                    {getRoleLabel(Number(s.roleCode), t)}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-indigo-500 mt-2">
              {t("erp.modulePermissions.fullAccessNote")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Staff permissions table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("erp.modulePermissions.staffPermissions")}</CardTitle>
          <CardDescription>
            {t("erp.modulePermissions.staffPermissionsDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : managedStaff.length === 0 ? (
            <div
              className="text-center py-8 text-muted-foreground"
              data-ocid="permissions.empty_state"
            >
              <Shield className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{t("erp.modulePermissions.noStaff")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground w-48">
                      {t("dashboard.owner.staffName")}
                    </th>
                    {ERP_MODULES.map((m) => (
                      <th
                        key={m.name}
                        className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground min-w-[100px]"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span>{t(m.labelKey)}</span>
                          <button
                            type="button"
                            onClick={() => handleGrantColumn(m.name)}
                            className="text-xs px-1.5 py-0.5 rounded font-medium transition-colors"
                            style={{
                              backgroundColor: "oklch(0.93 0.04 280)",
                              color: "oklch(0.35 0.18 280)",
                              border: "1px solid oklch(0.82 0.1 280)",
                            }}
                            title={t("erp.modulePermissions.grantColumn")}
                            data-ocid={`permissions.${m.name.toLowerCase()}.grant_all.button`}
                          >
                            ↓{t("erp.modulePermissions.grantColumn")}
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {managedStaff.map((staff) => (
                    <tr
                      key={staff.principal.toString()}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium text-sm">{staff.name}</p>
                          <Badge variant="secondary" className="text-xs mt-0.5">
                            {getRoleLabel(Number(staff.roleCode), t)}
                          </Badge>
                          <div className="flex gap-1 mt-1.5">
                            <button
                              type="button"
                              onClick={() => handleGrantAll(staff)}
                              className="text-xs px-2 py-0.5 rounded font-medium transition-colors"
                              style={{
                                backgroundColor: "oklch(0.93 0.04 145)",
                                color: "oklch(0.35 0.15 145)",
                                border: "1px solid oklch(0.8 0.1 145)",
                              }}
                              title={t("erp.modulePermissions.grantAll")}
                              data-ocid="permissions.grant_all.button"
                            >
                              +{t("erp.modulePermissions.grantAll")}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRevokeAll(staff)}
                              className="text-xs px-2 py-0.5 rounded font-medium transition-colors"
                              style={{
                                backgroundColor: "oklch(0.95 0.04 25)",
                                color: "oklch(0.42 0.16 25)",
                                border: "1px solid oklch(0.85 0.1 25)",
                              }}
                              title={t("erp.modulePermissions.revokeAll")}
                              data-ocid="permissions.revoke_all.button"
                            >
                              -{t("erp.modulePermissions.revokeAll")}
                            </button>
                          </div>
                        </div>
                      </td>
                      {ERP_MODULES.map((m) => {
                        const granted = staff.grantedModules.includes(m.name);
                        const key = `${staff.principal.toString()}-${m.name}`;
                        const isPending = pendingToggles.has(key);
                        return (
                          <td key={m.name} className="py-3 px-2 text-center">
                            {isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
                            ) : (
                              <Switch
                                checked={granted}
                                onCheckedChange={() =>
                                  handleToggle(staff, m.name, granted)
                                }
                                className="mx-auto"
                                data-ocid={`permissions.${m.name.toLowerCase()}.switch`}
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
