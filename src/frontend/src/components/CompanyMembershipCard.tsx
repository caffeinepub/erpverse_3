import { Building2, ChevronRight, Shield } from "lucide-react";
import type React from "react";
import { useLanguage } from "../contexts/LanguageContext";

interface CompanyMembershipCardProps {
  companyName: string;
  companyId: string;
  roleName: string;
  onEnter: () => void;
}

function getRoleBadgeStyle(roleName: string): React.CSSProperties {
  if (roleName.includes("Owner") || roleName.includes("Sahibi"))
    return {
      backgroundColor: "oklch(0.92 0.04 280)",
      color: "oklch(0.35 0.18 280)",
      border: "1px solid oklch(0.82 0.1 280)",
    };
  if (roleName.includes("Manager") || roleName.includes("Yönetici"))
    return {
      backgroundColor: "oklch(0.92 0.05 220)",
      color: "oklch(0.38 0.16 220)",
      border: "1px solid oklch(0.8 0.1 220)",
    };
  if (roleName.includes("Administrator") || roleName.includes("İdareci"))
    return {
      backgroundColor: "oklch(0.93 0.04 310)",
      color: "oklch(0.4 0.18 310)",
      border: "1px solid oklch(0.82 0.1 310)",
    };
  return {
    backgroundColor: "oklch(0.94 0.005 270)",
    color: "oklch(0.4 0.01 270)",
    border: "1px solid oklch(0.86 0.008 270)",
  };
}

export default function CompanyMembershipCard({
  companyName,
  companyId,
  roleName,
  onEnter,
}: CompanyMembershipCardProps) {
  const { t } = useLanguage();
  const badgeStyle = getRoleBadgeStyle(roleName);

  return (
    <div
      className="rounded-xl p-5 flex items-center gap-4 transition-all duration-200 group"
      style={{
        backgroundColor: "oklch(1 0 0)",
        border: "1px solid oklch(0.88 0.01 270)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "oklch(0.7 0.15 280)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 4px 16px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "oklch(0.88 0.01 270)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 1px 4px rgba(0,0,0,0.05)";
      }}
    >
      <div
        className="p-3 rounded-xl flex-shrink-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.45 0.22 280), oklch(0.5 0.2 310))",
        }}
      >
        <Building2 className="h-6 w-6" style={{ color: "oklch(1 0 0)" }} />
      </div>

      <div className="flex-1 min-w-0">
        <h3
          className="font-bold text-base truncate"
          style={{
            fontFamily: "Bricolage Grotesque, sans-serif",
            color: "oklch(0.12 0.012 270)",
          }}
        >
          {companyName}
        </h3>
        <p className="text-xs mt-0.5" style={{ color: "oklch(0.55 0.01 270)" }}>
          {companyId}
        </p>
        <div className="mt-2">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={badgeStyle}
          >
            <Shield className="h-3 w-3" />
            {roleName}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onEnter}
        data-ocid="company.enter_company.button"
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex-shrink-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.45 0.22 280), oklch(0.5 0.2 310))",
          color: "oklch(1 0 0)",
          boxShadow: "0 2px 8px oklch(0.45 0.22 280 / 0.3)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = "1";
        }}
      >
        {t("dashboard.staff.enterCompany")}
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
