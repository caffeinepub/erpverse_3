import { cn } from "@/lib/utils";
import {
  BarChart2,
  Building2,
  ChevronRight,
  DollarSign,
  Factory,
  FolderKanban,
  Handshake,
  LayoutDashboard,
  Package,
  Settings,
  Shield,
  ShoppingCart,
  Users,
  Workflow,
} from "lucide-react";
import type React from "react";

// Keep SidebarView exported for any legacy imports
export type SidebarView =
  | "overview"
  | "staff"
  | "roles"
  | "settings"
  | "permissions"
  | "hr"
  | "accounting"
  | "projects"
  | "inventory"
  | "crm"
  | "procurement"
  | "manufacturing"
  | "workflow"
  | "reporting";

export interface SidebarProps {
  activeView: SidebarView;
  onNavigate: (view: SidebarView) => void;
  userRoleCode: number;
  grantedModules: string[];
  companyName?: string;
  /** @deprecated use onNavigate */
  onViewChange?: (view: SidebarView) => void;
  isOwner?: boolean;
}

const ERP_MODULES = [
  {
    view: "hr" as SidebarView,
    label: "İnsan Kaynakları",
    icon: Users,
    moduleName: "HR",
    accent: "oklch(0.45 0.22 280)",
    accentBg: "oklch(0.93 0.04 280)",
  },
  {
    view: "accounting" as SidebarView,
    label: "Muhasebe",
    icon: DollarSign,
    moduleName: "Accounting",
    accent: "oklch(0.5 0.16 155)",
    accentBg: "oklch(0.93 0.05 145)",
  },
  {
    view: "projects" as SidebarView,
    label: "Proje Yönetimi",
    icon: FolderKanban,
    moduleName: "ProjectManagement",
    accent: "oklch(0.52 0.16 230)",
    accentBg: "oklch(0.92 0.05 220)",
  },
  {
    view: "inventory" as SidebarView,
    label: "Stok/Envanter",
    icon: Package,
    moduleName: "Inventory",
    accent: "oklch(0.6 0.17 50)",
    accentBg: "oklch(0.94 0.06 65)",
  },
  {
    view: "crm" as SidebarView,
    label: "CRM",
    icon: Handshake,
    moduleName: "CRM",
    accent: "oklch(0.56 0.18 330)",
    accentBg: "oklch(0.94 0.04 320)",
  },
  {
    view: "procurement" as SidebarView,
    label: "Satın Alma",
    icon: ShoppingCart,
    moduleName: "Procurement",
    accent: "oklch(0.45 0.18 190)",
    accentBg: "oklch(0.93 0.04 190)",
  },
  {
    view: "manufacturing" as SidebarView,
    label: "Üretim",
    icon: Factory,
    moduleName: "Manufacturing",
    accent: "oklch(0.5 0.18 25)",
    accentBg: "oklch(0.94 0.04 25)",
  },
  {
    view: "workflow" as SidebarView,
    label: "İş Akışları",
    icon: Workflow,
    moduleName: "Workflow",
    accent: "oklch(0.45 0.18 300)",
    accentBg: "oklch(0.93 0.04 300)",
  },
  {
    view: "reporting" as SidebarView,
    label: "Raporlama",
    icon: BarChart2,
    moduleName: "Reporting",
    accent: "oklch(0.42 0.15 145)",
    accentBg: "oklch(0.92 0.04 145)",
  },
];

const isOwnerOrManager = (roleCode: number) => roleCode === 1 || roleCode === 2;

export default function DashboardSidebar({
  activeView,
  onNavigate,
  onViewChange,
  userRoleCode,
  grantedModules,
  companyName,
  isOwner,
}: SidebarProps) {
  const handleNavigate = (view: SidebarView) => {
    onNavigate?.(view);
    onViewChange?.(view);
  };

  const canManage =
    isOwner !== undefined ? isOwner : isOwnerOrManager(userRoleCode);

  const canAccessModule = (moduleName: string) => {
    if (isOwnerOrManager(userRoleCode) || isOwner) return true;
    return grantedModules.includes(moduleName);
  };

  const navItem = (
    view: SidebarView,
    label: string,
    Icon: React.ElementType,
    disabled = false,
    iconStyle?: React.CSSProperties,
  ) => {
    const isActive = activeView === view;
    return (
      <button
        type="button"
        key={view}
        onClick={() => !disabled && handleNavigate(view)}
        disabled={disabled}
        data-ocid={`sidebar.${view}.link`}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative group",
          isActive
            ? "text-primary font-semibold nav-item-active"
            : disabled
              ? "text-muted-foreground/40 cursor-not-allowed"
              : "text-sidebar-foreground hover:text-foreground",
        )}
        style={
          isActive
            ? {
                backgroundColor: "oklch(0.93 0.025 280)",
                color: "oklch(0.35 0.18 280)",
              }
            : disabled
              ? {}
              : undefined
        }
      >
        {/* Hover bg via CSS */}
        {!isActive && !disabled && (
          <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-sidebar-accent" />
        )}
        <Icon
          className={cn(
            "w-4 h-4 shrink-0 transition-colors relative z-10",
            isActive
              ? ""
              : disabled
                ? "opacity-30"
                : "text-muted-foreground group-hover:text-foreground",
          )}
          style={isActive && iconStyle ? iconStyle : undefined}
        />
        <span className="truncate flex-1 text-left relative z-10">{label}</span>
        {isActive && (
          <ChevronRight
            className="w-3 h-3 ml-auto shrink-0 relative z-10"
            style={{ color: "oklch(0.45 0.22 280)" }}
          />
        )}
      </button>
    );
  };

  return (
    <aside
      className="w-64 shrink-0 flex flex-col h-full"
      style={{
        backgroundColor: "oklch(0.975 0.01 270)",
        borderRight: "1px solid oklch(0.88 0.01 270)",
      }}
    >
      {/* Header — company identity */}
      <div
        className="p-4 flex items-center gap-3"
        style={{ borderBottom: "1px solid oklch(0.88 0.01 270)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
          style={{ background: "oklch(0.45 0.22 280)" }}
        >
          <Building2 className="w-4 h-4" style={{ color: "oklch(1 0 0)" }} />
        </div>
        <div className="min-w-0">
          <p
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "oklch(0.55 0.12 280)" }}
          >
            Şirket Paneli
          </p>
          {companyName && (
            <p
              className="text-sm font-bold truncate leading-tight mt-0.5"
              style={{ color: "oklch(0.15 0.015 270)" }}
            >
              {companyName}
            </p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {/* Core section */}
        <div className="mb-2">
          <div className="flex items-center gap-1.5 px-3 mb-2 mt-1">
            <p
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "oklch(0.6 0.08 280)" }}
            >
              Genel
            </p>
          </div>
          {navItem("overview", "Genel Bakış", LayoutDashboard)}
          {canManage && navItem("staff", "Personel", Users)}
          {canManage && navItem("permissions", "Modül İzinleri", Shield)}
        </div>

        {/* Divider */}
        <div
          className="mx-3 my-3"
          style={{ borderTop: "1px solid oklch(0.88 0.01 270)" }}
        />

        {/* ERP Modules section */}
        <div>
          <div className="flex items-center gap-1.5 px-3 mb-2 mt-1">
            <p
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "oklch(0.6 0.08 280)" }}
            >
              ERP Modülleri
            </p>
          </div>
          {ERP_MODULES.map((item) => {
            const accessible = canAccessModule(item.moduleName);
            return navItem(item.view, item.label, item.icon, !accessible, {
              color: item.accent,
            });
          })}
        </div>
      </nav>

      {/* Footer */}
      <div
        className="p-2"
        style={{ borderTop: "1px solid oklch(0.88 0.01 270)" }}
      >
        {navItem("settings", "Ayarlar", Settings)}
      </div>
    </aside>
  );
}
