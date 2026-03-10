import { Button } from "@/components/ui/button";
import { Building2, ChevronRight, Loader2, LogOut } from "lucide-react";
import React from "react";
import Header from "../components/Header";
import { useLanguage } from "../contexts/LanguageContext";
import { useGetCallerUserProfile, useGetCompany } from "../hooks/useQueries";

interface CompanyCardProps {
  companyId: string;
  roleCode: bigint;
  grantedModules: string[];
  onSelect: (companyId: string) => void;
}

function CompanyCard({ companyId, roleCode, onSelect }: CompanyCardProps) {
  const { t } = useLanguage();
  const { data: company, isLoading } = useGetCompany(companyId);

  const roleLabel = () => {
    const code = Number(roleCode);
    if (code === 1) return t("roles.owner") || "Owner";
    if (code === 2) return t("roles.manager") || "Manager";
    if (code === 3) return t("roles.admin") || "Administrator";
    return t("roles.staff") || "Staff";
  };

  return (
    <div
      className="rounded-2xl p-6 flex items-center gap-5 transition-all duration-200 group cursor-pointer"
      style={{
        backgroundColor: "oklch(1 0 0)",
        border: "1.5px solid oklch(0.88 0.01 270)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "oklch(0.7 0.15 280)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 6px 24px rgba(0,0,0,0.10)";
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "oklch(0.88 0.01 270)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 2px 8px rgba(0,0,0,0.06)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Icon */}
      <div
        className="p-4 rounded-2xl flex-shrink-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.45 0.22 280), oklch(0.5 0.2 310))",
        }}
      >
        <Building2 className="h-8 w-8" style={{ color: "oklch(1 0 0)" }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2
              className="h-4 w-4 animate-spin"
              style={{ color: "oklch(0.55 0.01 270)" }}
            />
            <span
              style={{ color: "oklch(0.55 0.01 270)", fontSize: "0.875rem" }}
            >
              Loading...
            </span>
          </div>
        ) : (
          <>
            <h3
              className="font-bold text-lg truncate"
              style={{
                fontFamily: "Bricolage Grotesque, sans-serif",
                color: "oklch(0.12 0.012 270)",
              }}
            >
              {company?.name || companyId}
            </h3>
            <p
              className="text-sm mt-0.5"
              style={{ color: "oklch(0.55 0.01 270)" }}
            >
              {company?.sector && (
                <span className="mr-2">{company.sector}</span>
              )}
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: "oklch(0.92 0.04 280)",
                  color: "oklch(0.35 0.18 280)",
                  border: "1px solid oklch(0.82 0.1 280)",
                }}
              >
                {roleLabel()}
              </span>
            </p>
          </>
        )}
      </div>

      {/* Enter button */}
      <Button
        data-ocid="company-select.enter.button"
        onClick={() => onSelect(companyId)}
        className="flex-shrink-0 gap-2"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.45 0.22 280), oklch(0.5 0.2 310))",
          color: "oklch(1 0 0)",
          border: "none",
          boxShadow: "0 2px 10px oklch(0.45 0.22 280 / 0.3)",
        }}
      >
        {t("dashboard.staff.enterCompany") || "Enter"}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface CompanySelectPageProps {
  onSelectCompany: (companyId: string) => void;
  onLogout?: () => void;
}

export default function CompanySelectPage({
  onSelectCompany,
  onLogout,
}: CompanySelectPageProps) {
  const { t } = useLanguage();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();

  const memberships = userProfile?.memberships ?? [];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "oklch(0.97 0.003 270)" }}
    >
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Page header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{
              background: "oklch(0.92 0.04 280)",
              color: "oklch(0.35 0.18 280)",
              border: "1px solid oklch(0.82 0.1 280)",
            }}
          >
            <Building2 className="h-4 w-4" />
            {t("app.name") || "ERPVerse"}
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{
              fontFamily: "Bricolage Grotesque, sans-serif",
              color: "oklch(0.12 0.012 270)",
            }}
          >
            {t("dashboard.staff.companies") || "Your Companies"}
          </h1>
          <p style={{ color: "oklch(0.45 0.01 270)" }}>
            {t("dashboard.staff.selectCompanyHint") ||
              "Select a company to enter"}
          </p>
        </div>

        {/* Company cards */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2
              className="h-8 w-8 animate-spin"
              style={{ color: "oklch(0.55 0.15 280)" }}
            />
          </div>
        ) : memberships.length === 0 ? (
          <div
            data-ocid="company-select.empty_state"
            className="rounded-2xl p-10 text-center"
            style={{
              backgroundColor: "oklch(1 0 0)",
              border: "1.5px dashed oklch(0.85 0.01 270)",
            }}
          >
            <Building2
              className="h-10 w-10 mx-auto mb-3"
              style={{ color: "oklch(0.75 0.01 270)" }}
            />
            <p style={{ color: "oklch(0.55 0.01 270)" }}>
              {t("erp.modulePermissions.noStaff") || "No companies found"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4" data-ocid="company-select.list">
            {memberships.map((membership, idx) => (
              <div
                key={membership.companyId}
                data-ocid={`company-select.item.${idx + 1}`}
              >
                <CompanyCard
                  companyId={membership.companyId}
                  roleCode={membership.roleCode}
                  grantedModules={membership.grantedModules}
                  onSelect={onSelectCompany}
                />
              </div>
            ))}
          </div>
        )}

        {/* Logout */}
        {onLogout && (
          <div className="flex justify-center mt-8">
            <Button
              variant="ghost"
              onClick={onLogout}
              data-ocid="company-select.logout.button"
              className="gap-2"
              style={{ color: "oklch(0.55 0.01 270)" }}
            >
              <LogOut className="h-4 w-4" />
              {t("nav.logout") || "Logout"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
