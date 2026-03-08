import {
  Briefcase,
  Building2,
  Calendar,
  Hash,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
} from "lucide-react";
import React from "react";
import type { Company } from "../backend";
import { useLanguage } from "../contexts/LanguageContext";

interface CompanyInfoCardProps {
  company: Company;
}

export default function CompanyInfoCard({ company }: CompanyInfoCardProps) {
  const { t } = useLanguage();

  const fields = [
    {
      icon: Hash,
      label: t("dashboard.owner.taxNumber"),
      value: company.taxNumber,
    },
    {
      icon: Briefcase,
      label: t("dashboard.owner.sector"),
      value: company.sector,
    },
    {
      icon: Calendar,
      label: t("dashboard.owner.founded"),
      value: company.foundingYear.toString(),
    },
    {
      icon: User,
      label: t("dashboard.owner.authorizedPerson"),
      value: company.authorizedPerson,
    },
    {
      icon: Users,
      label: t("dashboard.owner.employeeCount"),
      value: company.employeeCount.toString(),
    },
    { icon: Mail, label: t("dashboard.owner.email"), value: company.email },
    {
      icon: Phone,
      label: t("dashboard.owner.phone"),
      value: `${company.phone.countryCode} ${company.phone.number}`,
    },
    {
      icon: MapPin,
      label: t("dashboard.owner.address"),
      value: company.address,
    },
  ];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: "oklch(1 0 0)",
        border: "1px solid oklch(0.88 0.01 270)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 p-5"
        style={{
          borderBottom: "1px solid oklch(0.88 0.01 270)",
          background:
            "linear-gradient(135deg, oklch(0.93 0.025 280), oklch(0.95 0.015 300))",
        }}
      >
        <div
          className="p-2.5 rounded-lg"
          style={{ backgroundColor: "oklch(0.45 0.22 280)" }}
        >
          <Building2 className="h-5 w-5" style={{ color: "oklch(1 0 0)" }} />
        </div>
        <div>
          <h3
            className="font-bold text-base"
            style={{
              fontFamily: "Bricolage Grotesque, sans-serif",
              color: "oklch(0.15 0.015 270)",
            }}
          >
            {company.name}
          </h3>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.5 0.08 280)" }}
          >
            {t("dashboard.owner.companyId")}: {company.id}
          </p>
        </div>
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2">
        {fields.map(({ icon: Icon, label, value }, index) => (
          <div
            key={label}
            className="flex items-start gap-3 p-4"
            style={{
              borderBottom:
                index < fields.length - 1
                  ? "1px solid oklch(0.92 0.005 270)"
                  : undefined,
              ...(index % 2 === 0 && index < fields.length - 1
                ? { borderRight: "1px solid oklch(0.92 0.005 270)" }
                : {}),
            }}
          >
            <div
              className="p-1.5 rounded-md flex-shrink-0 mt-0.5"
              style={{ backgroundColor: "oklch(0.95 0.01 280)" }}
            >
              <Icon
                className="h-3.5 w-3.5"
                style={{ color: "oklch(0.45 0.22 280)" }}
              />
            </div>
            <div className="min-w-0">
              <p
                className="text-xs mb-0.5 font-medium"
                style={{ color: "oklch(0.55 0.01 270)" }}
              >
                {label}
              </p>
              <p
                className="text-sm font-semibold truncate"
                style={{ color: "oklch(0.15 0.012 270)" }}
              >
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
