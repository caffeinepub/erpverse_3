import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart2,
  BookOpen,
  Boxes,
  Contact,
  FolderKanban,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  useGetCRMData,
  useGetDashboardSummary,
  useGetFinancialSummary,
  useGetHRData,
  useGetInventoryData,
  useGetProjectData,
} from "../hooks/useQueries";

interface ReportingModulePageProps {
  companyId: string;
}

// ─── Simple Bar Chart (CSS/SVG based, no recharts) ───────────────────────────
function BarChart({
  data,
  maxValue,
  color,
  label,
}: {
  data: { label: string; value: number }[];
  maxValue: number;
  color: string;
  label: string;
}) {
  const { t } = useLanguage();
  if (maxValue === 0) {
    return (
      <div
        className="flex items-center justify-center h-24 text-sm"
        style={{ color: "oklch(0.6 0.01 270)" }}
      >
        {t("erp.reporting.noData")}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: "oklch(0.55 0.01 270)" }}
      >
        {label}
      </p>
      <div className="flex items-end gap-2 h-24">
        {data.map((item) => {
          const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          return (
            <div
              key={item.label}
              className="flex flex-col items-center flex-1 gap-1"
            >
              <span
                className="text-[10px] font-mono"
                style={{ color: "oklch(0.45 0.01 270)" }}
              >
                {item.value.toLocaleString("tr-TR")}
              </span>
              <div className="w-full flex items-end" style={{ height: "60px" }}>
                <div
                  className="w-full rounded-t transition-all duration-500"
                  style={{
                    height: `${Math.max(height, item.value > 0 ? 4 : 0)}%`,
                    backgroundColor: color,
                    minHeight: item.value > 0 ? "4px" : "0",
                  }}
                />
              </div>
              <span
                className="text-[9px] text-center truncate w-full"
                style={{ color: "oklch(0.6 0.01 270)" }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
  accent,
  loading,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  accent: string;
  loading?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3"
      style={{
        backgroundColor: "oklch(1 0 0)",
        border: "1px solid oklch(0.88 0.01 270)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg" style={{ backgroundColor: iconBg }}>
          <Icon className="h-4 w-4" style={{ color: iconColor }} />
        </div>
        <span
          className="text-xs uppercase tracking-wider font-semibold"
          style={{ color: "oklch(0.55 0.01 270)" }}
        >
          {label}
        </span>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <p
          className="text-3xl font-bold leading-none"
          style={{
            fontFamily: "Bricolage Grotesque, sans-serif",
            color: accent,
          }}
        >
          {value}
        </p>
      )}
      {sub && (
        <p className="text-xs" style={{ color: "oklch(0.6 0.01 270)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── React import ─────────────────────────────────────────────────────────────
import type React from "react";
import { useLanguage } from "../contexts/LanguageContext";

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReportingModulePage({
  companyId,
}: ReportingModulePageProps) {
  const { t } = useLanguage();
  const { data: summary, isLoading: summaryLoading } =
    useGetDashboardSummary(companyId);
  const { data: financial, isLoading: financialLoading } =
    useGetFinancialSummary(companyId);
  const { data: hrData, isLoading: hrLoading } = useGetHRData(companyId);
  const { data: projectData, isLoading: projectLoading } =
    useGetProjectData(companyId);
  const { data: inventoryData, isLoading: inventoryLoading } =
    useGetInventoryData(companyId);
  const { data: crmData, isLoading: crmLoading } = useGetCRMData(companyId);

  // ── Derived stats ──
  const totalEmployees = summary ? Number(summary.totalEmployees) : 0;
  const openProjects = summary ? Number(summary.openProjects) : 0;
  const lowStock = summary ? Number(summary.lowStockProducts) : 0;
  const pendingInvoices = summary ? Number(summary.pendingInvoices) : 0;
  const totalCustomers = summary ? Number(summary.totalCustomers) : 0;

  const totalIncome = financial ? Number(financial.totalIncome) : 0;
  const totalExpenses = financial ? Number(financial.totalExpenses) : 0;
  const netBalance = financial ? Number(financial.netBalance) : 0;

  // ── HR department distribution ──
  const deptMap: Record<string, number> = {};
  if (hrData?.employees) {
    for (const emp of hrData.employees) {
      const dept = emp.department || t("erp.common.type");
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    }
  }
  const deptData = Object.entries(deptMap)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const maxDept = Math.max(...deptData.map((d) => d.value), 1);

  // ── Project status progress ──
  const totalProjects = projectData?.projects?.length ?? 0;
  const completedProjects =
    projectData?.projects?.filter(
      (p) => p.status === "completed" || p.status === "done",
    ).length ?? 0;
  const inProgressProjects =
    projectData?.projects?.filter(
      (p) => p.status === "in_progress" || p.status === "active",
    ).length ?? 0;
  const projectProgress =
    totalProjects > 0
      ? Math.round((completedProjects / totalProjects) * 100)
      : 0;

  // ── Low stock items ──
  const lowStockItems =
    inventoryData?.products
      ?.filter((p) => Number(p.quantityOnHand) < 20)
      .slice(0, 5) ?? [];

  // ── CRM pipeline ──
  const crmStages = [
    { label: t("erp.crm.prospect"), key: "lead" },
    { label: t("erp.crm.qualified"), key: "qualified" },
    { label: t("erp.crm.proposal"), key: "proposal" },
    { label: t("erp.crm.negotiation"), key: "negotiation" },
    { label: t("erp.crm.closed"), key: "won" },
  ];
  const opportunityByStage = crmStages.map((s) => ({
    label: s.label,
    value: crmData?.opportunities?.filter((o) => o.stage === s.key).length ?? 0,
  }));
  const opportunityTotal = opportunityByStage.reduce((s, o) => s + o.value, 0);

  // ── Financial bar chart ──
  const financialBars = [
    { label: t("erp.reporting.totalIncome"), value: totalIncome },
    { label: t("erp.reporting.totalExpense"), value: totalExpenses },
    { label: t("erp.reporting.netBalance"), value: Math.abs(netBalance) },
  ];
  const maxFinancial = Math.max(...financialBars.map((b) => b.value), 1);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1
          className="font-display text-2xl font-bold flex items-center gap-2"
          style={{ color: "oklch(0.12 0.012 270)" }}
        >
          <BarChart2
            className="w-6 h-6"
            style={{ color: "oklch(0.42 0.15 145)" }}
          />
          {t("erp.reporting.title")}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "oklch(0.5 0.01 270)" }}>
          {t("erp.reporting.subtitle")}
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label={t("erp.reporting.totalEmployees")}
          value={totalEmployees}
          icon={Users}
          iconBg="oklch(0.93 0.04 220)"
          iconColor="oklch(0.42 0.18 220)"
          accent="oklch(0.42 0.18 220)"
          loading={summaryLoading}
        />
        <StatCard
          label={t("erp.reporting.activeProjects")}
          value={openProjects}
          icon={FolderKanban}
          iconBg="oklch(0.93 0.04 280)"
          iconColor="oklch(0.45 0.22 280)"
          accent="oklch(0.45 0.22 280)"
          loading={summaryLoading}
        />
        <StatCard
          label={t("erp.reporting.criticalStock")}
          value={lowStock}
          icon={Boxes}
          iconBg="oklch(0.94 0.06 35)"
          iconColor="oklch(0.5 0.18 35)"
          accent="oklch(0.5 0.18 35)"
          loading={summaryLoading}
        />
        <StatCard
          label={t("erp.accounting.invoices")}
          value={pendingInvoices}
          icon={BookOpen}
          iconBg="oklch(0.94 0.06 75)"
          iconColor="oklch(0.45 0.14 75)"
          accent="oklch(0.45 0.14 75)"
          loading={summaryLoading}
        />
        <StatCard
          label={t("erp.reporting.totalCustomers")}
          value={totalCustomers}
          icon={Contact}
          iconBg="oklch(0.92 0.06 145)"
          iconColor="oklch(0.42 0.16 145)"
          accent="oklch(0.42 0.16 145)"
          loading={summaryLoading}
        />
      </div>

      {/* Row 2: Financial + Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Financial Summary */}
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: "oklch(1 0 0)",
            border: "1px solid oklch(0.88 0.01 270)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <h2
            className="font-display font-semibold mb-4 flex items-center gap-2"
            style={{ color: "oklch(0.12 0.012 270)" }}
          >
            <TrendingUp
              className="h-5 w-5"
              style={{ color: "oklch(0.42 0.16 145)" }}
            />
            {t("erp.reporting.financialSummary")}
          </h2>
          {financialLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  {
                    label: t("erp.reporting.totalIncome"),
                    value: totalIncome,
                    color: "oklch(0.38 0.15 145)",
                    icon: TrendingUp,
                    bg: "oklch(0.92 0.06 145)",
                  },
                  {
                    label: t("erp.reporting.totalExpense"),
                    value: totalExpenses,
                    color: "oklch(0.45 0.18 25)",
                    icon: TrendingDown,
                    bg: "oklch(0.94 0.04 25)",
                  },
                  {
                    label: t("erp.reporting.netBalance"),
                    value: netBalance,
                    color:
                      netBalance >= 0
                        ? "oklch(0.38 0.15 145)"
                        : "oklch(0.45 0.18 25)",
                    icon: netBalance >= 0 ? TrendingUp : TrendingDown,
                    bg:
                      netBalance >= 0
                        ? "oklch(0.92 0.06 145)"
                        : "oklch(0.94 0.04 25)",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg p-3"
                    style={{
                      backgroundColor: item.bg,
                      border: "1px solid oklch(0.88 0.01 270)",
                    }}
                  >
                    <item.icon
                      className="h-3.5 w-3.5 mb-1"
                      style={{ color: item.color }}
                    />
                    <p
                      className="font-bold text-base leading-none"
                      style={{
                        fontFamily: "Bricolage Grotesque, sans-serif",
                        color: item.color,
                      }}
                    >
                      ₺{Math.abs(item.value).toLocaleString("tr-TR")}
                    </p>
                    <p
                      className="text-[10px] mt-1 font-medium"
                      style={{ color: "oklch(0.55 0.01 270)" }}
                    >
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
              <BarChart
                data={financialBars}
                maxValue={maxFinancial}
                color="oklch(0.45 0.16 145)"
                label={t("erp.reporting.incomeExpenseChart")}
              />
            </div>
          )}
        </div>

        {/* Project Status */}
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: "oklch(1 0 0)",
            border: "1px solid oklch(0.88 0.01 270)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <h2
            className="font-display font-semibold mb-4 flex items-center gap-2"
            style={{ color: "oklch(0.12 0.012 270)" }}
          >
            <FolderKanban
              className="h-5 w-5"
              style={{ color: "oklch(0.45 0.22 280)" }}
            />
            {t("erp.reporting.projectStatus")}
          </h2>
          {projectLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: t("erp.common.total"),
                    value: totalProjects,
                    color: "oklch(0.35 0.18 280)",
                    bg: "oklch(0.93 0.04 280)",
                  },
                  {
                    label: t("erp.common.inProgress"),
                    value: inProgressProjects,
                    color: "oklch(0.42 0.14 75)",
                    bg: "oklch(0.94 0.06 75)",
                  },
                  {
                    label: t("erp.common.completed"),
                    value: completedProjects,
                    color: "oklch(0.38 0.15 145)",
                    bg: "oklch(0.92 0.06 145)",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg p-3 text-center"
                    style={{
                      backgroundColor: item.bg,
                      border: "1px solid oklch(0.88 0.01 270)",
                    }}
                  >
                    <p
                      className="font-bold text-2xl leading-none"
                      style={{
                        fontFamily: "Bricolage Grotesque, sans-serif",
                        color: item.color,
                      }}
                    >
                      {item.value}
                    </p>
                    <p
                      className="text-[10px] mt-1 font-medium"
                      style={{ color: "oklch(0.55 0.01 270)" }}
                    >
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: "oklch(0.5 0.01 270)" }}>
                    {t("erp.reporting.completionRate")}
                  </span>
                  <span
                    className="font-mono font-bold"
                    style={{ color: "oklch(0.38 0.15 145)" }}
                  >
                    {projectProgress}%
                  </span>
                </div>
                <Progress
                  value={projectProgress}
                  className="h-2"
                  style={
                    {
                      "--progress-bg": "oklch(0.38 0.15 145)",
                    } as React.CSSProperties
                  }
                />
              </div>
              {totalProjects === 0 && (
                <p
                  className="text-sm text-center py-4"
                  style={{ color: "oklch(0.6 0.01 270)" }}
                >
                  {t("erp.reporting.noProjectData")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: HR Departments + Low Stock + CRM Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* HR Department Distribution */}
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: "oklch(1 0 0)",
            border: "1px solid oklch(0.88 0.01 270)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <h2
            className="font-display font-semibold mb-4 flex items-center gap-2"
            style={{ color: "oklch(0.12 0.012 270)" }}
          >
            <Users
              className="h-5 w-5"
              style={{ color: "oklch(0.42 0.18 220)" }}
            />
            {t("erp.reporting.deptDistribution")}
          </h2>
          {hrLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : deptData.length === 0 ? (
            <p
              className="text-sm text-center py-4"
              style={{ color: "oklch(0.6 0.01 270)" }}
            >
              {t("erp.reporting.noHRData")}
            </p>
          ) : (
            <div className="space-y-2.5">
              {deptData.map((dept) => (
                <div key={dept.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span
                      className="font-medium"
                      style={{ color: "oklch(0.35 0.01 270)" }}
                    >
                      {dept.label}
                    </span>
                    <span
                      className="font-mono"
                      style={{ color: "oklch(0.42 0.18 220)" }}
                    >
                      {dept.value}
                    </span>
                  </div>
                  <div
                    className="w-full rounded-full h-1.5"
                    style={{ backgroundColor: "oklch(0.92 0.02 270)" }}
                  >
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${(dept.value / maxDept) * 100}%`,
                        backgroundColor: "oklch(0.42 0.18 220)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: "oklch(1 0 0)",
            border: "1px solid oklch(0.88 0.01 270)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <h2
            className="font-display font-semibold mb-4 flex items-center gap-2"
            style={{ color: "oklch(0.12 0.012 270)" }}
          >
            <Boxes
              className="h-5 w-5"
              style={{ color: "oklch(0.5 0.18 35)" }}
            />
            {t("erp.reporting.lowStockAlerts")}
          </h2>
          {inventoryLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : lowStockItems.length === 0 ? (
            <p
              className="text-sm text-center py-4"
              style={{ color: "oklch(0.6 0.01 270)" }}
            >
              {t("erp.reporting.noStockAlert")}
            </p>
          ) : (
            <div className="space-y-2">
              {lowStockItems.map((product) => {
                const stock = Number(product.quantityOnHand);
                const isCritical = stock < 5;
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-2 rounded-lg"
                    style={{
                      backgroundColor: isCritical
                        ? "oklch(0.95 0.04 25)"
                        : "oklch(0.96 0.03 75)",
                      border: `1px solid ${
                        isCritical
                          ? "oklch(0.88 0.08 25)"
                          : "oklch(0.88 0.06 75)"
                      }`,
                    }}
                  >
                    <span
                      className="text-xs font-medium truncate max-w-[120px]"
                      style={{ color: "oklch(0.25 0.01 270)" }}
                    >
                      {product.name}
                    </span>
                    <span
                      className="text-xs font-mono font-bold px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: isCritical
                          ? "oklch(0.45 0.18 25)"
                          : "oklch(0.42 0.14 75)",
                        color: "oklch(1 0 0)",
                      }}
                    >
                      {stock}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CRM Pipeline */}
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: "oklch(1 0 0)",
            border: "1px solid oklch(0.88 0.01 270)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <h2
            className="font-display font-semibold mb-4 flex items-center gap-2"
            style={{ color: "oklch(0.12 0.012 270)" }}
          >
            <Contact
              className="h-5 w-5"
              style={{ color: "oklch(0.42 0.16 145)" }}
            />
            {t("erp.reporting.crmPipeline")}
          </h2>
          {crmLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {opportunityByStage.map((stage, idx) => {
                const pct =
                  opportunityTotal > 0
                    ? (stage.value / opportunityTotal) * 100
                    : 0;
                const stageColors = [
                  "oklch(0.5 0.01 270)",
                  "oklch(0.35 0.18 280)",
                  "oklch(0.42 0.14 75)",
                  "oklch(0.5 0.18 25)",
                  "oklch(0.38 0.15 145)",
                ];
                return (
                  <div key={stage.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "oklch(0.4 0.01 270)" }}>
                        {stage.label}
                      </span>
                      <span
                        className="font-mono font-bold"
                        style={{ color: stageColors[idx] }}
                      >
                        {stage.value}
                      </span>
                    </div>
                    <div
                      className="w-full rounded-full h-2"
                      style={{ backgroundColor: "oklch(0.92 0.02 270)" }}
                    >
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: stageColors[idx],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {opportunityByStage.every((s) => s.value === 0) && (
                <p
                  className="text-sm text-center py-4"
                  style={{ color: "oklch(0.6 0.01 270)" }}
                >
                  {t("erp.reporting.noOpportunityData")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
