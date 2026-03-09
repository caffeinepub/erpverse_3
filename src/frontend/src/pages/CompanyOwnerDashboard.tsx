import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import type { Principal } from "@icp-sdk/core/principal";
import {
  AlertCircle,
  BookOpen,
  Boxes,
  Building2,
  Contact,
  FolderKanban,
  LayoutDashboard,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { RoleAssignmentResult } from "../backend";
import type { Staff } from "../backend";
import CompanyInfoCard from "../components/CompanyInfoCard";
import DashboardSidebar, {
  type SidebarView,
} from "../components/DashboardSidebar";
import Header from "../components/Header";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useAddCustomRole,
  useAddStaffToCompany,
  useGetCompany,
  useGetDashboardSummary,
  useGetStaffForCompany,
  useListRolesForCompany,
  useRemoveCustomRole,
  useRemoveStaffFromCompany,
  useUpdateStaffRole,
} from "../hooks/useQueries";
import {
  useGrantModuleAccess,
  useRevokeModuleAccess,
} from "../hooks/useQueries";

import AccountingModulePage from "./AccountingModulePage";
import CRMModulePage from "./CRMModulePage";
// ERP Module Pages
import HRModulePage from "./HRModulePage";
import InventoryModulePage from "./InventoryModulePage";
import ManufacturingModulePage from "./ManufacturingModulePage";
import ProcurementModulePage from "./ProcurementModulePage";
import ProjectManagementModulePage from "./ProjectManagementModulePage";
import ReportingModulePage from "./ReportingModulePage";
import WorkflowModulePage from "./WorkflowModulePage";

interface CompanyOwnerDashboardProps {
  companyId: string;
  userName?: string;
  userRoleCode?: bigint;
  /** Pre-determined granted modules (for staff-module-view) */
  grantedModules?: string[];
}

const ERP_MODULES = [
  { name: "HR", label: "İnsan Kaynakları" },
  { name: "Accounting", label: "Muhasebe" },
  { name: "ProjectManagement", label: "Proje Yönetimi" },
  { name: "Inventory", label: "Stok/Envanter" },
  { name: "CRM", label: "CRM" },
  { name: "Procurement", label: "Satın Alma" },
  { name: "Manufacturing", label: "Üretim" },
  { name: "Workflow", label: "İş Akışları" },
  { name: "Reporting", label: "Raporlama" },
];

function getRoleName(roleCode: bigint): string {
  const code = Number(roleCode);
  if (code === 1) return "Company Owner";
  if (code === 2) return "Company Manager";
  if (code === 3) return "Company Administrator";
  if (code === 4) return "Company Staff";
  return "Unknown";
}

function getRoleDisplayName(
  roleName: string,
  t: (key: string) => string,
): string {
  if (roleName === "Company Owner") return t("roles.companyOwner");
  if (roleName === "Company Manager") return t("roles.companyManager");
  if (roleName === "Company Administrator")
    return t("roles.companyAdministrator");
  if (roleName === "Company Staff") return t("roles.companyStaff");
  return roleName;
}

function isOwnerRole(roleCode: bigint | undefined): boolean {
  if (roleCode === undefined) return true;
  return Number(roleCode) === 1;
}

function canManageStaff(roleCode: bigint | undefined): boolean {
  if (roleCode === undefined) return true;
  const code = Number(roleCode);
  return code === 1 || code === 2;
}

// ─── Module Permissions Sub-Component ────────────────────────────────────────
function ModulePermissionsView({
  companyId,
  staffList,
  staffLoading,
}: {
  companyId: string;
  staffList: Staff[];
  staffLoading: boolean;
}) {
  const grantMutation = useGrantModuleAccess();
  const revokeMutation = useRevokeModuleAccess();
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
        toast.success(`${moduleName} erişimi kaldırıldı`);
      } else {
        await grantMutation.mutateAsync({
          companyId,
          staffPrincipal: staff.principal,
          moduleName,
        });
        toast.success(`${moduleName} erişimi verildi`);
      }
    } catch {
      toast.error("İşlem başarısız oldu");
    } finally {
      setPendingToggles((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const managedStaff = staffList.filter((s) => Number(s.roleCode) >= 3);
  const privilegedStaff = staffList.filter((s) => Number(s.roleCode) < 3);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Modül İzinleri
        </h1>
        <p className="text-muted-foreground text-sm">
          Personelin hangi ERP modüllerine erişebileceğini yönetin
        </p>
      </div>

      {privilegedStaff.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <p className="text-sm text-indigo-700 font-medium mb-2">
            Tam Erişimli Kullanıcılar
          </p>
          <div className="flex flex-wrap gap-2">
            {privilegedStaff.map((s) => (
              <div
                key={s.principal.toString()}
                className="flex items-center gap-1.5 px-2 py-1 bg-white border border-indigo-200 rounded-full"
              >
                <Shield className="w-3 h-3 text-indigo-600" />
                <span className="text-xs font-medium text-gray-800">
                  {s.name}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-indigo-500 mt-2">
            Şirket Sahibi ve Yöneticiler tüm modüllere otomatik olarak
            erişebilir.
          </p>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-display font-semibold text-foreground">
            Personel Modül Erişimleri
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Her personel için modül erişimlerini açıp kapatın
          </p>
        </div>
        {staffLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : managedStaff.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Shield className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">İzin yönetilecek personel bulunamadı</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-48">
                    Personel
                  </th>
                  {ERP_MODULES.map((m) => (
                    <th
                      key={m.name}
                      className="text-center py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[110px]"
                    >
                      {m.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {managedStaff.map((staff) => (
                  <tr
                    key={staff.principal.toString()}
                    className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-primary font-semibold text-xs">
                            {staff.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{staff.name}</p>
                          <Badge
                            variant="outline"
                            className="text-xs h-4 px-1 mt-0.5"
                          >
                            {getRoleName(staff.roleCode)}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    {ERP_MODULES.map((m) => {
                      const granted = staff.grantedModules.includes(m.name);
                      const key = `${staff.principal.toString()}-${m.name}`;
                      const isPending = pendingToggles.has(key);
                      return (
                        <td key={m.name} className="py-3 px-3 text-center">
                          {isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
                          ) : (
                            <Switch
                              checked={granted}
                              onCheckedChange={() =>
                                handleToggle(staff, m.name, granted)
                              }
                              className="mx-auto"
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
      </div>
    </div>
  );
}

// ─── Settings Sub-Component ───────────────────────────────────────────────────
function SettingsView({
  company,
  isOwner,
}: {
  company: NonNullable<ReturnType<typeof useGetCompany>["data"]>;
  isOwner: boolean;
}) {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Ayarlar
        </h1>
        <p className="text-muted-foreground text-sm">
          Şirket ayarları ve yapılandırma
        </p>
      </div>
      <CompanyInfoCard
        company={company}
        companyId={company.id}
        isOwner={isOwner}
      />
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function CompanyOwnerDashboard({
  companyId,
  userName,
  userRoleCode,
  grantedModules: propGrantedModules,
}: CompanyOwnerDashboardProps) {
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState<SidebarView>("overview");
  const [addCode, setAddCode] = useState("");
  const [addRole, setAddRole] = useState("Company Staff");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [removingPrincipal, setRemovingPrincipal] = useState<string | null>(
    null,
  );
  const [updatingPrincipal, setUpdatingPrincipal] = useState<string | null>(
    null,
  );
  const [updateRoleValue, setUpdateRoleValue] = useState("");

  const isOwner = isOwnerRole(userRoleCode);
  const isManager = !isOwner && canManageStaff(userRoleCode);
  const roleCodeNum = userRoleCode !== undefined ? Number(userRoleCode) : 1;

  const { data: company, isLoading: companyLoading } = useGetCompany(companyId);
  const {
    data: staffList = [],
    isLoading: staffLoading,
    isError: staffError,
    error: staffErrorObj,
    refetch: refetchStaff,
  } = useGetStaffForCompany(companyId);
  const { data: roles = [] } = useListRolesForCompany(companyId);
  const { data: dashboardSummary, isLoading: dashboardLoading } =
    useGetDashboardSummary(companyId);
  const addStaff = useAddStaffToCompany();
  const removeStaff = useRemoveStaffFromCompany();
  const updateRole = useUpdateStaffRole();
  const addCustomRole = useAddCustomRole();
  const removeCustomRole = useRemoveCustomRole();

  const [newRoleName, setNewRoleName] = useState("");
  const [addingRole, setAddingRole] = useState(false);

  // Derive granted modules for current user from staffList (for sidebar)
  // If propGrantedModules is provided (staff-module-view), use it; otherwise empty (sidebar checks role)
  const currentUserGrantedModules: string[] = propGrantedModules ?? [];

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");
    if (!addCode.trim() || addCode.trim().length !== 12) {
      setAddError("Geçerli bir 12 haneli personel kodu girin");
      return;
    }
    try {
      const result = await addStaff.mutateAsync({
        companyId,
        employeeCode: addCode.trim(),
        roleName: addRole,
      });
      if (result === RoleAssignmentResult.success) {
        setAddSuccess(t("common.success"));
        setAddCode("");
        refetchStaff();
      } else if (result === RoleAssignmentResult.invalidCode) {
        setAddError("Geçersiz personel kodu");
      } else if (result === RoleAssignmentResult.alreadyAssigned) {
        setAddError("Bu personel zaten şirkete ekli");
      } else if (result === RoleAssignmentResult.insufficientPermissions) {
        setAddError("Bu rolü atamak için yetkiniz yok");
      } else {
        setAddError(t("common.error"));
      }
    } catch (err) {
      setAddError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleRemoveStaff = async (principal: Principal) => {
    setRemovingPrincipal(principal.toString());
    try {
      await removeStaff.mutateAsync({ companyId, staffPrincipal: principal });
      refetchStaff();
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingPrincipal(null);
    }
  };

  const handleUpdateRole = async (staff: Staff) => {
    if (!updateRoleValue) return;
    setUpdatingPrincipal(staff.principal.toString());
    try {
      await updateRole.mutateAsync({
        companyId,
        staffPrincipal: staff.principal,
        newRoleName: updateRoleValue,
      });
      setUpdatingPrincipal(null);
      setUpdateRoleValue("");
      refetchStaff();
    } catch (err) {
      console.error(err);
      setUpdatingPrincipal(null);
    }
  };

  const handleAddCustomRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    setAddingRole(true);
    try {
      await addCustomRole.mutateAsync({
        companyId,
        role: {
          name: newRoleName.trim(),
          permissions: [],
          parentRole: "Company Staff",
        },
      });
      toast.success("Özel rol eklendi");
      setNewRoleName("");
    } catch {
      toast.error("Rol eklenemedi");
    } finally {
      setAddingRole(false);
    }
  };

  const handleRemoveCustomRole = async (roleName: string) => {
    try {
      await removeCustomRole.mutateAsync({ companyId, roleName });
      toast.success("Rol silindi");
    } catch {
      toast.error("Rol silinemedi");
    }
  };

  const DEFAULT_ROLE_NAMES = [
    "Company Owner",
    "Company Manager",
    "Company Administrator",
    "Company Staff",
  ];

  const customRoles = roles.filter((r) => !DEFAULT_ROLE_NAMES.includes(r.name));

  const assignableRoles = (() => {
    const allRoles =
      roles.length > 0
        ? roles.map((r) => r.name)
        : ["Company Manager", "Company Administrator", "Company Staff"];
    if (isOwner) return allRoles.filter((r) => r !== "Company Owner");
    return allRoles.filter(
      (r) => r === "Company Administrator" || r === "Company Staff",
    );
  })();

  const availableRoles =
    roles.length > 0
      ? roles.map((r) => r.name)
      : ["Company Manager", "Company Administrator", "Company Staff"];

  if (companyLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header userName={userName} companyId={companyId} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t("common.loading")}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header userName={userName} companyId={companyId} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t("common.error")}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header userName={userName} companyId={companyId} />

      <div
        className="flex flex-1 overflow-hidden"
        style={{ height: "calc(100vh - 64px)" }}
      >
        {/* Sidebar */}
        <DashboardSidebar
          companyName={company.name}
          activeView={activeView}
          onNavigate={setActiveView}
          userRoleCode={roleCodeNum}
          grantedModules={currentUserGrantedModules}
          isOwner={isOwner}
        />

        {/* Main content */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ backgroundColor: "oklch(0.975 0.005 270)" }}
        >
          {/* ── Overview ── */}
          {activeView === "overview" && (
            <div className="p-6 lg:p-8 max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">
                  {t("dashboard.owner.overview")}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {t("dashboard.owner.welcome")},{" "}
                  {userName || company.authorizedPerson}
                  {isManager && (
                    <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 border border-indigo-200 rounded-full text-xs text-indigo-700 font-medium">
                      <Shield className="h-3 w-3" />
                      {t("roles.companyManager")}
                    </span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: Users,
                    label: t("dashboard.owner.totalStaff"),
                    value: staffList.length.toString(),
                    iconBg: "oklch(0.93 0.04 280)",
                    iconColor: "oklch(0.45 0.22 280)",
                    accent: "oklch(0.45 0.22 280)",
                    borderAccent: "oklch(0.45 0.22 280)",
                  },
                  {
                    icon: Shield,
                    label: t("dashboard.owner.activeRoles"),
                    value: availableRoles.length.toString(),
                    iconBg: "oklch(0.94 0.06 65)",
                    iconColor: "oklch(0.5 0.16 55)",
                    accent: "oklch(0.5 0.16 55)",
                    borderAccent: "oklch(0.65 0.16 50)",
                  },
                  {
                    icon: LayoutDashboard,
                    label: t("dashboard.owner.sector"),
                    value: company.sector,
                    iconBg: "oklch(0.92 0.06 145)",
                    iconColor: "oklch(0.42 0.16 145)",
                    accent: "oklch(0.42 0.16 145)",
                    borderAccent: "oklch(0.5 0.16 145)",
                  },
                ].map((card, i) => (
                  <div
                    key={card.label}
                    className={`rounded-xl p-5 ${i === 2 ? "col-span-2 sm:col-span-1" : ""}`}
                    style={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.88 0.01 270)",
                      borderTop: `3px solid ${card.borderAccent}`,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="p-1.5 rounded-lg"
                        style={{ backgroundColor: card.iconBg }}
                      >
                        <card.icon
                          className="h-4 w-4"
                          style={{ color: card.iconColor }}
                        />
                      </div>
                      <span
                        className="text-xs uppercase tracking-wider font-semibold"
                        style={{ color: "oklch(0.55 0.01 270)" }}
                      >
                        {card.label}
                      </span>
                    </div>
                    <p
                      className="font-bold truncate"
                      style={{
                        fontFamily: "Bricolage Grotesque, sans-serif",
                        fontSize: card.value.length > 8 ? "1.1rem" : "1.875rem",
                        color: card.accent,
                      }}
                    >
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* ERP Summary Stats */}
              <div>
                <h2
                  className="font-semibold text-sm uppercase tracking-wider mb-3"
                  style={{ color: "oklch(0.5 0.01 270)" }}
                >
                  ERP Özeti
                </h2>
                {dashboardLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      {
                        icon: Users,
                        label: "HR Çalışan",
                        value: dashboardSummary
                          ? Number(dashboardSummary.totalEmployees)
                          : 0,
                        iconBg: "oklch(0.92 0.04 220)",
                        iconColor: "oklch(0.42 0.18 220)",
                        accent: "oklch(0.42 0.18 220)",
                      },
                      {
                        icon: FolderKanban,
                        label: "Açık Projeler",
                        value: dashboardSummary
                          ? Number(dashboardSummary.openProjects)
                          : 0,
                        iconBg: "oklch(0.93 0.04 280)",
                        iconColor: "oklch(0.45 0.22 280)",
                        accent: "oklch(0.45 0.22 280)",
                      },
                      {
                        icon: Boxes,
                        label: "Düşük Stok",
                        value: dashboardSummary
                          ? Number(dashboardSummary.lowStockProducts)
                          : 0,
                        iconBg: "oklch(0.94 0.06 35)",
                        iconColor: "oklch(0.5 0.18 35)",
                        accent: "oklch(0.5 0.18 35)",
                      },
                      {
                        icon: BookOpen,
                        label: "Bekl. Fatura",
                        value: dashboardSummary
                          ? Number(dashboardSummary.pendingInvoices)
                          : 0,
                        iconBg: "oklch(0.94 0.06 75)",
                        iconColor: "oklch(0.45 0.14 75)",
                        accent: "oklch(0.45 0.14 75)",
                      },
                      {
                        icon: Contact,
                        label: "Müşteriler",
                        value: dashboardSummary
                          ? Number(dashboardSummary.totalCustomers)
                          : 0,
                        iconBg: "oklch(0.92 0.06 145)",
                        iconColor: "oklch(0.42 0.16 145)",
                        accent: "oklch(0.42 0.16 145)",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl p-4 flex flex-col gap-2"
                        style={{
                          backgroundColor: "oklch(1 0 0)",
                          border: "1px solid oklch(0.88 0.01 270)",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                        }}
                      >
                        <div
                          className="p-1.5 rounded-lg w-fit"
                          style={{ backgroundColor: stat.iconBg }}
                        >
                          <stat.icon
                            className="h-3.5 w-3.5"
                            style={{ color: stat.iconColor }}
                          />
                        </div>
                        <p
                          className="text-xl font-bold leading-none"
                          style={{
                            fontFamily: "Bricolage Grotesque, sans-serif",
                            color: stat.accent,
                          }}
                        >
                          {stat.value}
                        </p>
                        <p
                          className="text-xs leading-tight"
                          style={{ color: "oklch(0.55 0.01 270)" }}
                        >
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <CompanyInfoCard
                company={company}
                companyId={companyId}
                isOwner={isOwner}
              />
            </div>
          )}

          {/* ── Staff Management ── */}
          {activeView === "staff" && (
            <div className="p-6 lg:p-8 max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">
                  {t("dashboard.owner.staffManagement")}
                </h1>
                {isManager && (
                  <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    {t("roles.companyManager")} — Yönetici ve altındaki
                    personeli görüntüleyebilirsiniz
                  </p>
                )}
              </div>

              {/* Add Staff Form */}
              {canManageStaff(userRoleCode) && (
                <div
                  className="rounded-xl p-6"
                  style={{
                    backgroundColor: "oklch(1 0 0)",
                    border: "1px solid oklch(0.88 0.01 270)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  <h2 className="font-display font-semibold text-foreground mb-1">
                    {t("dashboard.owner.addStaffTitle")}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4">
                    {t("dashboard.owner.addStaffDesc")}
                  </p>
                  <form
                    onSubmit={handleAddStaff}
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <div className="flex-1">
                      <input
                        type="text"
                        value={addCode}
                        onChange={(e) => {
                          setAddCode(e.target.value.toUpperCase());
                          setAddError("");
                          setAddSuccess("");
                        }}
                        placeholder={t(
                          "dashboard.owner.employeeCodePlaceholder",
                        )}
                        maxLength={12}
                        className="w-full bg-white border border-border rounded-lg px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                      />
                    </div>
                    <select
                      value={addRole}
                      onChange={(e) => setAddRole(e.target.value)}
                      className="bg-white border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {assignableRoles.map((r) => (
                        <option key={r} value={r}>
                          {getRoleDisplayName(r, t)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={addStaff.isPending}
                      data-ocid="staff.add_button"
                      className="flex items-center gap-2 px-5 py-2.5 brand-gradient text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-60 whitespace-nowrap shadow-sm"
                    >
                      {addStaff.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {addStaff.isPending
                        ? t("dashboard.owner.adding")
                        : t("dashboard.owner.addBtn")}
                    </button>
                  </form>
                  {addError && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {addError}
                    </div>
                  )}
                  {addSuccess && (
                    <div className="mt-3 text-sm text-primary">
                      {addSuccess}
                    </div>
                  )}
                </div>
              )}

              {/* Custom Roles Section (owner only) */}
              {isOwner && (
                <div
                  className="rounded-xl p-6"
                  style={{
                    backgroundColor: "oklch(1 0 0)",
                    border: "1px solid oklch(0.88 0.01 270)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  <h2 className="font-display font-semibold text-foreground mb-1">
                    Özel Roller
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4">
                    Şirkete özel yeni roller ekleyin veya kaldırın
                  </p>

                  {/* Default roles */}
                  <div className="mb-4">
                    <p
                      className="text-xs uppercase tracking-wider font-semibold mb-2"
                      style={{ color: "oklch(0.55 0.01 270)" }}
                    >
                      Varsayılan Roller
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {DEFAULT_ROLE_NAMES.map((rn) => (
                        <span
                          key={rn}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                          style={{
                            backgroundColor: "oklch(0.94 0.015 270)",
                            color: "oklch(0.4 0.01 270)",
                            border: "1px solid oklch(0.86 0.008 270)",
                          }}
                        >
                          <Lock className="h-3 w-3" />
                          {getRoleDisplayName(rn, t)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Custom roles list */}
                  {customRoles.length > 0 && (
                    <div className="mb-4">
                      <p
                        className="text-xs uppercase tracking-wider font-semibold mb-2"
                        style={{ color: "oklch(0.55 0.01 270)" }}
                      >
                        Özel Roller ({customRoles.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {customRoles.map((role) => (
                          <span
                            key={role.name}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                            style={{
                              backgroundColor: "oklch(0.93 0.04 280)",
                              color: "oklch(0.35 0.18 280)",
                              border: "1px solid oklch(0.82 0.08 280)",
                            }}
                          >
                            {role.name}
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomRole(role.name)}
                              data-ocid="roles.custom.delete_button.1"
                              className="ml-0.5 hover:text-destructive transition-colors"
                              title="Rolü sil"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add custom role form */}
                  <form onSubmit={handleAddCustomRole} className="flex gap-2">
                    <Input
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      placeholder="Yeni rol adı..."
                      className="flex-1 h-9 text-sm"
                      data-ocid="roles.custom.input"
                      style={{
                        backgroundColor: "oklch(1 0 0)",
                        borderColor: "oklch(0.88 0.01 270)",
                        color: "oklch(0.12 0.012 270)",
                      }}
                    />
                    <button
                      type="submit"
                      disabled={addingRole || !newRoleName.trim()}
                      data-ocid="roles.custom.primary_button"
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg disabled:opacity-50 transition-all whitespace-nowrap"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.45 0.22 280), oklch(0.5 0.2 310))",
                        color: "oklch(1 0 0)",
                      }}
                    >
                      {addingRole ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                      Ekle
                    </button>
                  </form>
                </div>
              )}

              {/* Staff List */}
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  backgroundColor: "oklch(1 0 0)",
                  border: "1px solid oklch(0.88 0.01 270)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <h2 className="font-display font-semibold text-foreground">
                    {t("dashboard.owner.staffList")}
                  </h2>
                  <button
                    type="button"
                    onClick={() => refetchStaff()}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-all"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>

                {staffLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : staffError ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-destructive mb-1">
                        Personel listesi yüklenemedi
                      </p>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        {(staffErrorObj as Error)?.message?.includes(
                          "Unauthorized",
                        )
                          ? "Bu listeyi görüntüleme yetkiniz bulunmuyor."
                          : "Bir hata oluştu. Lütfen tekrar deneyin."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => refetchStaff()}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-secondary transition-all"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Tekrar Dene
                    </button>
                  </div>
                ) : staffList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Users className="h-10 w-10 mb-3 opacity-30" />
                    <p className="text-sm">{t("dashboard.owner.noStaff")}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {staffList.map((staff) => {
                      const roleName = getRoleName(staff.roleCode);
                      const isUpdating =
                        updatingPrincipal === staff.principal.toString();
                      const isRemoving =
                        removingPrincipal === staff.principal.toString();

                      return (
                        <div
                          key={staff.principal.toString()}
                          className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-all"
                        >
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-semibold text-sm">
                              {staff.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">
                              {staff.name}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {staff.employeeCode}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isUpdating ? (
                              <div className="flex items-center gap-2">
                                <select
                                  value={updateRoleValue}
                                  onChange={(e) =>
                                    setUpdateRoleValue(e.target.value)
                                  }
                                  className="bg-white border border-border rounded-md px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                >
                                  <option value="">
                                    {t("dashboard.owner.rolePlaceholder")}
                                  </option>
                                  {assignableRoles.map((r) => (
                                    <option key={r} value={r}>
                                      {getRoleDisplayName(r, t)}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateRole(staff)}
                                  disabled={!updateRoleValue}
                                  className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-md disabled:opacity-50"
                                >
                                  {t("common.save")}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUpdatingPrincipal(null);
                                    setUpdateRoleValue("");
                                  }}
                                  className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded-md"
                                >
                                  {t("common.cancel")}
                                </button>
                              </div>
                            ) : (
                              <>
                                <span
                                  className="text-xs px-2 py-1 rounded-md font-semibold"
                                  style={{
                                    backgroundColor: "oklch(0.93 0.025 280)",
                                    color: "oklch(0.35 0.18 280)",
                                    border: "1px solid oklch(0.82 0.08 280)",
                                  }}
                                >
                                  {getRoleDisplayName(roleName, t)}
                                </span>
                                {canManageStaff(userRoleCode) && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setUpdatingPrincipal(
                                          staff.principal.toString(),
                                        );
                                        setUpdateRoleValue("");
                                      }}
                                      className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-all"
                                      title={t("dashboard.owner.updateRole")}
                                    >
                                      <Shield className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveStaff(staff.principal)
                                      }
                                      disabled={isRemoving}
                                      className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition-all disabled:opacity-50"
                                      title={t("dashboard.owner.removeBtn")}
                                    >
                                      {isRemoving ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-3.5 w-3.5" />
                                      )}
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Module Permissions ── */}
          {activeView === "permissions" && (
            <div className="p-6 lg:p-8">
              <ModulePermissionsView
                companyId={companyId}
                staffList={staffList}
                staffLoading={staffLoading}
              />
            </div>
          )}

          {/* ── Settings ── */}
          {activeView === "settings" && (
            <div className="p-6 lg:p-8">
              <SettingsView company={company} isOwner={isOwner} />
            </div>
          )}

          {/* ── ERP Modules ── */}
          {activeView === "hr" && (
            <HRModulePage
              companyId={companyId}
              isOwnerOrManager={canManageStaff(userRoleCode)}
            />
          )}
          {activeView === "accounting" && (
            <AccountingModulePage companyId={companyId} />
          )}
          {activeView === "projects" && (
            <ProjectManagementModulePage companyId={companyId} />
          )}
          {activeView === "inventory" && (
            <InventoryModulePage companyId={companyId} />
          )}
          {activeView === "crm" && <CRMModulePage companyId={companyId} />}
          {activeView === "procurement" && (
            <ProcurementModulePage companyId={companyId} />
          )}
          {activeView === "manufacturing" && (
            <ManufacturingModulePage companyId={companyId} />
          )}
          {activeView === "workflow" && (
            <WorkflowModulePage companyId={companyId} />
          )}
          {activeView === "reporting" && (
            <ReportingModulePage companyId={companyId} />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer
        className="py-3 px-6 text-xs flex items-center justify-between shrink-0"
        style={{
          borderTop: "1px solid oklch(0.88 0.01 270)",
          backgroundColor: "oklch(1 0 0)",
          color: "oklch(0.5 0.01 270)",
        }}
      >
        <span>
          © {new Date().getFullYear()} ERPVerse. {t("footer.rights")}.
        </span>
      </footer>
    </div>
  );
}
