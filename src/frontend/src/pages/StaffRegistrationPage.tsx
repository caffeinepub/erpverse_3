import { ArrowRight, Loader2, User } from "lucide-react";
import type React from "react";
import { useState } from "react";
import type { UserProfile } from "../backend";
import EmployeeCodeDisplay from "../components/EmployeeCodeDisplay";
import Header from "../components/Header";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useGetMyEmployeeCode,
  useSaveCallerUserProfile,
} from "../hooks/useQueries";

interface StaffRegistrationPageProps {
  onSuccess: () => void;
}

export default function StaffRegistrationPage({
  onSuccess,
}: StaffRegistrationPageProps) {
  const { t } = useLanguage();
  const saveProfile = useSaveCallerUserProfile();
  const { data: employeeCode, refetch: refetchCode } = useGetMyEmployeeCode();

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [nameError, setNameError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(t("staffRegistration.errors.nameRequired"));
      return;
    }
    setNameError("");

    const profile: UserProfile = {
      name: name.trim(),
      projectManager: title.trim(),
      roleCode: BigInt(4), // Company Staff by default
      employeeCode: "",
      companyId: "",
      memberships: [],
    };

    try {
      await saveProfile.mutateAsync(profile);
      await refetchCode();
      setProfileSaved(true);
    } catch (err) {
      setNameError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg">
          {!profileSaved ? (
            <div className="animate-fade-in">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                  {t("staffRegistration.title")}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {t("staffRegistration.description")}
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-5"
              >
                <div>
                  <label
                    htmlFor="staff-name"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    {t("staffRegistration.fields.name")}{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="staff-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (nameError) setNameError("");
                    }}
                    placeholder={t("staffRegistration.fields.namePlaceholder")}
                    className={`w-full bg-white border ${nameError ? "border-destructive" : "border-border"} rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all`}
                  />
                  {nameError && (
                    <p className="text-destructive text-xs mt-1">{nameError}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="staff-title"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    {t("staffRegistration.fields.title")}
                  </label>
                  <input
                    id="staff-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("staffRegistration.fields.titlePlaceholder")}
                    className="w-full bg-white border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saveProfile.isPending}
                  data-ocid="staff_registration.submit_button"
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 brand-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-sm"
                >
                  {saveProfile.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("staffRegistration.submitting")}
                    </>
                  ) : (
                    <>
                      {t("staffRegistration.submitBtn")}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-fade-in flex flex-col gap-6">
              <div className="text-center">
                <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                  {t("staffRegistration.subtitle")}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {t("staffRegistration.description")}
                </p>
              </div>

              {employeeCode && <EmployeeCodeDisplay code={employeeCode} />}

              <button
                type="button"
                onClick={onSuccess}
                data-ocid="staff_registration.continue_button"
                className="w-full flex items-center justify-center gap-2 py-3 px-6 brand-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm"
              >
                {t("staffRegistration.continueBtn")}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
