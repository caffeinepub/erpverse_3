import { Building2, CheckCheck, Copy, Loader2, User } from "lucide-react";
import React, { useState } from "react";
import CompanyMembershipCard from "../components/CompanyMembershipCard";
import Header from "../components/Header";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useGetCallerUserProfile,
  useGetCompany,
  useGetMyEmployeeCode,
} from "../hooks/useQueries";

interface StaffDashboardProps {
  onEnterCompany?: (companyId: string) => void;
}

function getRoleName(roleCode: bigint, t: (key: string) => string): string {
  const code = Number(roleCode);
  if (code === 1) return t("roles.companyOwner");
  if (code === 2) return t("roles.companyManager");
  if (code === 3) return t("roles.companyAdministrator");
  if (code === 4) return t("roles.companyStaff");
  return t("roles.unknown");
}

const MODULE_LABELS: Record<string, string> = {
  hr: "İnsan Kaynakları",
  accounting: "Muhasebe",
  projects: "Proje Yönetimi",
  inventory: "Stok/Envanter",
  crm: "CRM",
  purchasing: "Satın Alma",
  production: "Üretim",
  tasks: "Görev Yönetimi",
};

const MODULE_COLORS: Record<
  string,
  { bg: string; color: string; border: string }
> = {
  hr: {
    bg: "oklch(0.93 0.04 280)",
    color: "oklch(0.35 0.18 280)",
    border: "oklch(0.82 0.1 280)",
  },
  accounting: {
    bg: "oklch(0.92 0.06 145)",
    color: "oklch(0.38 0.15 145)",
    border: "oklch(0.8 0.1 145)",
  },
  projects: {
    bg: "oklch(0.94 0.05 220)",
    color: "oklch(0.38 0.18 220)",
    border: "oklch(0.82 0.1 220)",
  },
  inventory: {
    bg: "oklch(0.94 0.06 65)",
    color: "oklch(0.42 0.16 50)",
    border: "oklch(0.84 0.1 65)",
  },
  crm: {
    bg: "oklch(0.94 0.04 330)",
    color: "oklch(0.42 0.18 330)",
    border: "oklch(0.84 0.1 330)",
  },
  purchasing: {
    bg: "oklch(0.94 0.05 190)",
    color: "oklch(0.38 0.18 190)",
    border: "oklch(0.82 0.1 190)",
  },
  production: {
    bg: "oklch(0.94 0.04 25)",
    color: "oklch(0.45 0.18 25)",
    border: "oklch(0.84 0.1 25)",
  },
  tasks: {
    bg: "oklch(0.93 0.03 300)",
    color: "oklch(0.38 0.16 300)",
    border: "oklch(0.82 0.09 300)",
  },
};

interface StaffCompanyCardProps {
  companyId: string;
  roleCode: bigint;
  grantedModules: Array<string>;
  onEnter: () => void;
}

function StaffCompanyCard({
  companyId,
  roleCode,
  grantedModules,
  onEnter,
}: StaffCompanyCardProps) {
  const { t } = useLanguage();
  const { data: company, isLoading } = useGetCompany(companyId);

  if (isLoading) {
    return (
      <div
        className="rounded-xl p-5 flex items-center gap-3"
        style={{
          backgroundColor: "oklch(1 0 0)",
          border: "1px solid oklch(0.88 0.01 270)",
        }}
      >
        <Loader2
          className="h-5 w-5 animate-spin"
          style={{ color: "oklch(0.55 0.01 270)" }}
        />
        <span className="text-sm" style={{ color: "oklch(0.5 0.01 270)" }}>
          {t("common.loading")}
        </span>
      </div>
    );
  }

  if (!company) return null;

  const isOwnerOrManager = Number(roleCode) === 1 || Number(roleCode) === 2;
  const hasFullAccess = isOwnerOrManager && grantedModules.length === 0;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: "oklch(1 0 0)",
        border: "1px solid oklch(0.88 0.01 270)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <CompanyMembershipCard
        companyName={company.name}
        companyId={company.id}
        roleName={getRoleName(roleCode, t)}
        onEnter={onEnter}
      />
      {/* Module badges */}
      <div
        className="px-4 pb-3 pt-1"
        style={{ borderTop: "1px solid oklch(0.93 0.005 270)" }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: "oklch(0.55 0.01 270)" }}
        >
          Erişim
        </p>
        <div className="flex flex-wrap gap-1.5">
          {hasFullAccess ? (
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: "oklch(0.92 0.06 145)",
                color: "oklch(0.38 0.15 145)",
                border: "1px solid oklch(0.8 0.1 145)",
              }}
            >
              ✓ Tam Erişim
            </span>
          ) : grantedModules.length > 0 ? (
            grantedModules.map((mod) => {
              const colors = MODULE_COLORS[mod] ?? {
                bg: "oklch(0.93 0.04 280)",
                color: "oklch(0.35 0.18 280)",
                border: "oklch(0.82 0.1 280)",
              };
              return (
                <span
                  key={mod}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: colors.bg,
                    color: colors.color,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {MODULE_LABELS[mod] ?? mod}
                </span>
              );
            })
          ) : (
            <span className="text-xs" style={{ color: "oklch(0.6 0.01 270)" }}>
              Modül atanmamış
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StaffDashboard({
  onEnterCompany,
}: StaffDashboardProps) {
  const { t } = useLanguage();
  const { data: profile, isLoading: profileLoading } =
    useGetCallerUserProfile();
  const { data: employeeCode } = useGetMyEmployeeCode();
  const [activeTab, setActiveTab] = useState<"companies" | "profile">(
    "companies",
  );
  const [codeCopied, setCodeCopied] = useState(false);

  const handleCopyCode = async () => {
    if (!employeeCode) return;
    try {
      await navigator.clipboard.writeText(employeeCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      setCodeCopied(false);
    }
  };

  // Support multiple company memberships
  const memberships = profile?.memberships ?? [];
  const hasMultipleMemberships = memberships.length > 1;

  // Determine companies to show: prefer memberships array, fallback to legacy companyId
  const hasCompany =
    memberships.length > 0 ||
    (profile?.companyId &&
      profile.companyId !== "unassigned" &&
      profile.companyId !== "");

  if (profileLoading) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: "oklch(0.975 0.005 270)" }}
      >
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div
            className="flex items-center gap-3"
            style={{ color: "oklch(0.5 0.01 270)" }}
          >
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t("common.loading")}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "oklch(0.975 0.005 270)" }}
    >
      <Header userName={profile?.name} />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Welcome */}
          <div className="mb-8">
            <h1
              className="text-2xl font-bold mb-1"
              style={{
                fontFamily: "Bricolage Grotesque, sans-serif",
                color: "oklch(0.12 0.012 270)",
              }}
            >
              {t("dashboard.staff.title")}
            </h1>
            <p className="text-sm" style={{ color: "oklch(0.5 0.01 270)" }}>
              {t("dashboard.staff.welcome")}, {profile?.name || ""}
            </p>
          </div>

          {/* Tabs */}
          <div
            className="flex gap-1 p-1 mb-6 w-fit rounded-xl"
            style={{
              backgroundColor: "oklch(0.93 0.008 270)",
              border: "1px solid oklch(0.88 0.01 270)",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("companies")}
              data-ocid="staff.companies.tab"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={
                activeTab === "companies"
                  ? {
                      backgroundColor: "oklch(1 0 0)",
                      color: "oklch(0.12 0.012 270)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      border: "1px solid oklch(0.88 0.01 270)",
                    }
                  : { color: "oklch(0.5 0.01 270)" }
              }
            >
              <Building2 className="h-4 w-4" />
              {t("dashboard.staff.myCompanies")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              data-ocid="staff.profile.tab"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={
                activeTab === "profile"
                  ? {
                      backgroundColor: "oklch(1 0 0)",
                      color: "oklch(0.12 0.012 270)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      border: "1px solid oklch(0.88 0.01 270)",
                    }
                  : { color: "oklch(0.5 0.01 270)" }
              }
            >
              <User className="h-4 w-4" />
              {t("dashboard.staff.myProfile")}
            </button>
          </div>

          {/* Companies Tab */}
          {activeTab === "companies" && (
            <div className="flex flex-col gap-4">
              {hasCompany ? (
                <>
                  {/* Multiple memberships support */}
                  {memberships.length > 0 ? (
                    <>
                      {hasMultipleMemberships && (
                        <p
                          className="text-xs font-medium uppercase tracking-wider"
                          style={{ color: "oklch(0.5 0.01 270)" }}
                        >
                          {memberships.length} şirkette çalışıyorsunuz
                        </p>
                      )}
                      {memberships.map((membership) => (
                        <StaffCompanyCard
                          key={membership.companyId}
                          companyId={membership.companyId}
                          roleCode={membership.roleCode}
                          grantedModules={membership.grantedModules}
                          onEnter={() => onEnterCompany?.(membership.companyId)}
                        />
                      ))}
                    </>
                  ) : (
                    /* Fallback: legacy single companyId */
                    <StaffCompanyCard
                      companyId={profile!.companyId}
                      roleCode={profile!.roleCode}
                      grantedModules={[]}
                      onEnter={() => onEnterCompany?.(profile!.companyId)}
                    />
                  )}
                </>
              ) : (
                <div
                  className="rounded-xl p-10 flex flex-col items-center text-center gap-4"
                  style={{
                    backgroundColor: "oklch(1 0 0)",
                    border: "1px solid oklch(0.88 0.01 270)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                  data-ocid="staff.no_company.empty_state"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: "oklch(0.93 0.025 280)" }}
                  >
                    <Building2
                      className="h-8 w-8"
                      style={{ color: "oklch(0.45 0.22 280)" }}
                    />
                  </div>
                  <div>
                    <h3
                      className="font-bold mb-2"
                      style={{
                        fontFamily: "Bricolage Grotesque, sans-serif",
                        color: "oklch(0.12 0.012 270)",
                      }}
                    >
                      {t("dashboard.staff.noCompanies")}
                    </h3>
                    <p
                      className="text-sm max-w-sm"
                      style={{ color: "oklch(0.5 0.01 270)" }}
                    >
                      {t("dashboard.staff.noCompaniesDesc")}
                    </p>
                  </div>

                  {/* Employee code */}
                  {employeeCode && (
                    <div
                      className="mt-2 w-full max-w-sm rounded-xl p-4"
                      style={{
                        backgroundColor: "oklch(0.95 0.02 280)",
                        border: "1px solid oklch(0.85 0.07 280)",
                      }}
                    >
                      <p
                        className="text-xs mb-2 font-semibold uppercase tracking-wider"
                        style={{ color: "oklch(0.45 0.12 280)" }}
                      >
                        {t("dashboard.staff.myCode")}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className="flex-1 font-mono text-lg font-bold tracking-[0.25em]"
                          style={{ color: "oklch(0.35 0.2 280)" }}
                        >
                          {employeeCode}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          data-ocid="staff.copy_code.button"
                          className="p-2 rounded-lg transition-all"
                          style={{
                            backgroundColor: "oklch(0.88 0.07 280)",
                            color: "oklch(0.35 0.18 280)",
                          }}
                        >
                          {codeCopied ? (
                            <CheckCheck className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="flex flex-col gap-4">
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  backgroundColor: "oklch(1 0 0)",
                  border: "1px solid oklch(0.88 0.01 270)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                {/* Profile header */}
                <div
                  className="flex items-center gap-4 p-6"
                  style={{
                    borderBottom: "1px solid oklch(0.88 0.01 270)",
                    background:
                      "linear-gradient(135deg, oklch(0.93 0.025 280), oklch(0.95 0.015 300))",
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.45 0.22 280), oklch(0.5 0.2 310))",
                    }}
                  >
                    <span
                      className="text-2xl font-bold"
                      style={{
                        fontFamily: "Bricolage Grotesque, sans-serif",
                        color: "oklch(1 0 0)",
                      }}
                    >
                      {profile?.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div>
                    <h2
                      className="font-bold text-lg"
                      style={{
                        fontFamily: "Bricolage Grotesque, sans-serif",
                        color: "oklch(0.12 0.012 270)",
                      }}
                    >
                      {profile?.name || "—"}
                    </h2>
                    {profile?.projectManager && (
                      <p
                        className="text-sm"
                        style={{ color: "oklch(0.45 0.1 280)" }}
                      >
                        {profile.projectManager}
                      </p>
                    )}
                  </div>
                </div>

                {/* Profile details */}
                <div className="p-6 flex flex-col gap-5">
                  {/* Employee Code */}
                  <div>
                    <p
                      className="text-xs uppercase tracking-wider mb-2 font-semibold"
                      style={{ color: "oklch(0.5 0.01 270)" }}
                    >
                      {t("dashboard.staff.myCode")}
                    </p>
                    <div
                      className="flex items-center gap-3 rounded-lg px-4 py-3"
                      style={{
                        backgroundColor: "oklch(0.95 0.02 280)",
                        border: "1px solid oklch(0.85 0.07 280)",
                      }}
                    >
                      <span
                        className="flex-1 font-mono text-xl font-bold tracking-[0.3em]"
                        style={{ color: "oklch(0.35 0.2 280)" }}
                      >
                        {employeeCode || "—"}
                      </span>
                      {employeeCode && (
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          data-ocid="staff.profile.copy_code.button"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
                          style={{
                            backgroundColor: "oklch(0.88 0.07 280)",
                            color: "oklch(0.35 0.18 280)",
                          }}
                        >
                          {codeCopied ? (
                            <>
                              <CheckCheck className="h-3.5 w-3.5" />
                              {t("staffRegistration.codeCopied")}
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              {t("staffRegistration.copyBtn")}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <p
                      className="text-xs mt-2"
                      style={{ color: "oklch(0.6 0.01 270)" }}
                    >
                      {t("staffRegistration.codeDesc")}
                    </p>
                  </div>

                  {/* Current company & role */}
                  {hasCompany && (
                    <div>
                      <p
                        className="text-xs uppercase tracking-wider mb-2 font-semibold"
                        style={{ color: "oklch(0.5 0.01 270)" }}
                      >
                        {t("dashboard.staff.role")}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className="px-3 py-1.5 rounded-full text-sm font-semibold"
                          style={{
                            backgroundColor: "oklch(0.93 0.04 280)",
                            color: "oklch(0.35 0.18 280)",
                            border: "1px solid oklch(0.82 0.1 280)",
                          }}
                        >
                          {getRoleName(profile!.roleCode, t)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        className="py-4 px-6 text-xs flex items-center justify-between shrink-0"
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
