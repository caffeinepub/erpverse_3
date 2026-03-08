import { ArrowRight, Building2, CheckCircle2, Loader2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import type { CompanyProfile } from "../backend";
import Header from "../components/Header";
import { useLanguage } from "../contexts/LanguageContext";
import { useCreateCompany } from "../hooks/useQueries";

interface CompanySetupPageProps {
  userName?: string;
  onSuccess: (companyId: string) => void;
}

interface FormData {
  name: string;
  taxNumber: string;
  sector: string;
  address: string;
  countryCode: string;
  phone: string;
  email: string;
  authorizedPerson: string;
  employeeCount: string;
  foundingYear: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function CompanySetupPage({
  userName,
  onSuccess,
}: CompanySetupPageProps) {
  const { t, tArray } = useLanguage();
  const createCompany = useCreateCompany();

  const [form, setForm] = useState<FormData>({
    name: "",
    taxNumber: "",
    sector: "",
    address: "",
    countryCode: "+90",
    phone: "",
    email: "",
    authorizedPerson: "",
    employeeCount: "",
    foundingYear: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const sectors = tArray("companySetup.sectors");

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim())
      newErrors.name = t("companySetup.errors.nameRequired");
    if (!form.taxNumber.trim())
      newErrors.taxNumber = t("companySetup.errors.taxRequired");
    if (!form.sector)
      newErrors.sector = t("companySetup.errors.sectorRequired");
    if (!form.address.trim())
      newErrors.address = t("companySetup.errors.addressRequired");
    if (!form.phone.trim())
      newErrors.phone = t("companySetup.errors.phoneRequired");
    if (!form.email.trim())
      newErrors.email = t("companySetup.errors.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = t("companySetup.errors.emailInvalid");
    if (!form.authorizedPerson.trim())
      newErrors.authorizedPerson = t("companySetup.errors.authorizedRequired");
    if (!form.employeeCount)
      newErrors.employeeCount = t("companySetup.errors.employeeRequired");
    if (!form.foundingYear)
      newErrors.foundingYear = t("companySetup.errors.yearRequired");
    else if (
      Number.isNaN(Number(form.foundingYear)) ||
      Number(form.foundingYear) < 1800 ||
      Number(form.foundingYear) > new Date().getFullYear()
    ) {
      newErrors.foundingYear = t("companySetup.errors.yearInvalid");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const profile: CompanyProfile = {
      name: form.name.trim(),
      taxNumber: form.taxNumber.trim(),
      sector: form.sector,
      address: form.address.trim(),
      phone: { countryCode: form.countryCode, number: form.phone.trim() },
      email: form.email.trim(),
      authorizedPerson: form.authorizedPerson.trim(),
      employeeCount: BigInt(Number.parseInt(form.employeeCount)),
      foundingYear: BigInt(Number.parseInt(form.foundingYear)),
    };

    try {
      const company = await createCompany.mutateAsync(profile);
      setSubmitted(true);
      setTimeout(() => onSuccess(company.id), 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrors({ submit: msg });
    }
  };

  const inputClass = (field: string) =>
    `w-full bg-white border ${errors[field] ? "border-destructive" : "border-border"} rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all`;

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header showAuth={false} />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              {t("companySetup.success")}
            </h2>
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header userName={userName} />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Page header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {t("companySetup.title")}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {t("companySetup.subtitle")}
                </p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              {t("companySetup.description")}
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-5 animate-fade-in"
          >
            {/* Company Name */}
            <div>
              <label
                htmlFor="company-name"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                {t("companySetup.fields.name")}{" "}
                <span className="text-destructive">*</span>
              </label>
              <input
                id="company-name"
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder={t("companySetup.fields.namePlaceholder")}
                className={inputClass("name")}
              />
              {errors.name && (
                <p className="text-destructive text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Tax Number */}
            <div>
              <label
                htmlFor="company-tax"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                {t("companySetup.fields.taxNumber")}{" "}
                <span className="text-destructive">*</span>
              </label>
              <input
                id="company-tax"
                type="text"
                value={form.taxNumber}
                onChange={(e) => handleChange("taxNumber", e.target.value)}
                placeholder={t("companySetup.fields.taxNumberPlaceholder")}
                className={inputClass("taxNumber")}
              />
              {errors.taxNumber && (
                <p className="text-destructive text-xs mt-1">
                  {errors.taxNumber}
                </p>
              )}
            </div>

            {/* Sector */}
            <div>
              <label
                htmlFor="company-sector"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                {t("companySetup.fields.sector")}{" "}
                <span className="text-destructive">*</span>
              </label>
              <select
                id="company-sector"
                value={form.sector}
                onChange={(e) => handleChange("sector", e.target.value)}
                className={inputClass("sector")}
              >
                <option value="">
                  {t("companySetup.fields.sectorPlaceholder")}
                </option>
                {sectors.map((s: string) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.sector && (
                <p className="text-destructive text-xs mt-1">{errors.sector}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="company-address"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                {t("companySetup.fields.address")}{" "}
                <span className="text-destructive">*</span>
              </label>
              <textarea
                id="company-address"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder={t("companySetup.fields.addressPlaceholder")}
                rows={2}
                className={`${inputClass("address")} resize-none`}
              />
              {errors.address && (
                <p className="text-destructive text-xs mt-1">
                  {errors.address}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="company-phone"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                {t("companySetup.fields.phone")}{" "}
                <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={form.countryCode}
                  onChange={(e) => handleChange("countryCode", e.target.value)}
                  className="bg-white border border-border rounded-lg px-2 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-24"
                >
                  <option value="+90">+90 🇹🇷</option>
                  <option value="+1">+1 🇺🇸</option>
                  <option value="+44">+44 🇬🇧</option>
                  <option value="+49">+49 🇩🇪</option>
                  <option value="+33">+33 🇫🇷</option>
                </select>
                <input
                  id="company-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder={t("companySetup.fields.phonePlaceholder")}
                  className={`flex-1 ${inputClass("phone")}`}
                />
              </div>
              {errors.phone && (
                <p className="text-destructive text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="company-email"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                {t("companySetup.fields.email")}{" "}
                <span className="text-destructive">*</span>
              </label>
              <input
                id="company-email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder={t("companySetup.fields.emailPlaceholder")}
                className={inputClass("email")}
              />
              {errors.email && (
                <p className="text-destructive text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Authorized Person */}
            <div>
              <label
                htmlFor="company-authorized"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                {t("companySetup.fields.authorizedPerson")}{" "}
                <span className="text-destructive">*</span>
              </label>
              <input
                id="company-authorized"
                type="text"
                value={form.authorizedPerson}
                onChange={(e) =>
                  handleChange("authorizedPerson", e.target.value)
                }
                placeholder={t(
                  "companySetup.fields.authorizedPersonPlaceholder",
                )}
                className={inputClass("authorizedPerson")}
              />
              {errors.authorizedPerson && (
                <p className="text-destructive text-xs mt-1">
                  {errors.authorizedPerson}
                </p>
              )}
            </div>

            {/* Employee Count + Founding Year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="company-employee-count"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  {t("companySetup.fields.employeeCount")}{" "}
                  <span className="text-destructive">*</span>
                </label>
                <input
                  id="company-employee-count"
                  type="number"
                  min="1"
                  value={form.employeeCount}
                  onChange={(e) =>
                    handleChange("employeeCount", e.target.value)
                  }
                  placeholder={t(
                    "companySetup.fields.employeeCountPlaceholder",
                  )}
                  className={inputClass("employeeCount")}
                />
                {errors.employeeCount && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.employeeCount}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="company-founding-year"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  {t("companySetup.fields.foundingYear")}{" "}
                  <span className="text-destructive">*</span>
                </label>
                <input
                  id="company-founding-year"
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  value={form.foundingYear}
                  onChange={(e) => handleChange("foundingYear", e.target.value)}
                  placeholder={t("companySetup.fields.foundingYearPlaceholder")}
                  className={inputClass("foundingYear")}
                />
                {errors.foundingYear && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.foundingYear}
                  </p>
                )}
              </div>
            </div>

            {/* Submit error */}
            {errors.submit && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 text-sm text-destructive">
                {errors.submit}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={createCompany.isPending}
              data-ocid="company_setup.submit_button"
              className="w-full flex items-center justify-center gap-2 py-3 px-6 brand-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-sm"
            >
              {createCompany.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("companySetup.submitting")}
                </>
              ) : (
                <>
                  {t("companySetup.submitBtn")}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
