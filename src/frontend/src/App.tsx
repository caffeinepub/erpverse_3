import { Loader2 } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useIsRegisteredAsCompany,
} from "./hooks/useQueries";
import CompanyOwnerDashboard from "./pages/CompanyOwnerDashboard";
import CompanySelectPage from "./pages/CompanySelectPage";
import CompanySetupPage from "./pages/CompanySetupPage";
import LandingPage from "./pages/LandingPage";
import StaffDashboard from "./pages/StaffDashboard";
import StaffRegistrationPage from "./pages/StaffRegistrationPage";

// Portal mode is stored in sessionStorage so it persists across the II redirect
function getStoredPortalMode(): "company" | "staff" | null {
  const stored = sessionStorage.getItem("erpverse-portal-mode");
  if (stored === "company" || stored === "staff") return stored;
  return null;
}

function setStoredPortalMode(mode: "company" | "staff" | null) {
  if (mode) sessionStorage.setItem("erpverse-portal-mode", mode);
  else sessionStorage.removeItem("erpverse-portal-mode");
}

// Role codes: 1=Owner, 2=Manager, 3=Administrator, 4=Staff
function isManagerOrHigher(roleCode: bigint | undefined): boolean {
  if (roleCode === undefined) return false;
  const code = Number(roleCode);
  return code === 1 || code === 2;
}

type AppView =
  | "landing"
  | "company-setup"
  | "company-dashboard"
  | "staff-registration"
  | "staff-dashboard"
  | "staff-module-view"
  | "company-select";

// Declare the global helper injected by index.html
declare global {
  interface Window {
    __hideSplash?: () => void;
  }
}

function AppInner() {
  const { t } = useLanguage();
  const { identity, isInitializing, isLoginError } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const splashHidden = useRef(false);

  // Hide the inline HTML splash screen once React has mounted
  useEffect(() => {
    if (!splashHidden.current) {
      splashHidden.current = true;
      // Small delay so the splash bar animation completes
      const t = setTimeout(() => {
        if (window.__hideSplash) window.__hideSplash();
      }, 800);
      return () => clearTimeout(t);
    }
  }, []);

  const [loginMode, setLoginMode] = useState<"idle" | "company" | "staff">(
    "idle",
  );
  const [portalMode, setPortalMode] = useState<"company" | "staff" | null>(
    getStoredPortalMode,
  );
  const [view, setView] = useState<AppView>("landing");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [staffModuleGrantedModules, setStaffModuleGrantedModules] = useState<
    string[]
  >([]);

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  const {
    data: registeredCompanyId,
    isLoading: companyCheckLoading,
    isFetched: companyCheckFetched,
  } = useIsRegisteredAsCompany();

  // Once authenticated, route based on portal mode and backend state
  useEffect(() => {
    if (!isAuthenticated || isInitializing) return;
    if (!profileFetched || !companyCheckFetched) return;

    // Always re-read from sessionStorage (not just state) to handle fresh mounts after II redirect
    const mode = portalMode ?? getStoredPortalMode();

    if (!mode) {
      // No portal mode — infer from data
      if (registeredCompanyId) {
        setCompanyId(registeredCompanyId);
        setView("company-dashboard");
      } else if (
        userProfile?.companyId &&
        userProfile.companyId !== "unassigned" &&
        userProfile.companyId !== ""
      ) {
        if (isManagerOrHigher(userProfile.roleCode)) {
          setCompanyId(userProfile.companyId);
          setView("company-dashboard");
        } else {
          setView("staff-dashboard");
        }
      } else if (userProfile) {
        setView("staff-dashboard");
      }
      // else: stay on landing — no info yet
      return;
    }

    if (mode === "company") {
      if (registeredCompanyId) {
        setCompanyId(registeredCompanyId);
        setPortalMode("company");
        setView("company-dashboard");
      } else if (
        userProfile?.companyId &&
        userProfile.companyId !== "unassigned" &&
        userProfile.companyId !== "" &&
        isManagerOrHigher(userProfile.roleCode)
      ) {
        setCompanyId(userProfile.companyId);
        setPortalMode("company");
        setView("company-dashboard");
      } else {
        setView("company-setup");
      }
    } else if (mode === "staff") {
      if (!userProfile) {
        setView("staff-registration");
      } else {
        setPortalMode("staff");
        const staffMemberships = userProfile.memberships ?? [];
        if (staffMemberships.length > 1) {
          setView("company-select");
        } else {
          setView("staff-dashboard");
        }
      }
    }
  }, [
    isAuthenticated,
    isInitializing,
    profileFetched,
    companyCheckFetched,
    registeredCompanyId,
    userProfile,
    portalMode,
  ]);

  // If not authenticated, always show landing
  useEffect(() => {
    if (!isAuthenticated && !isInitializing && view !== "landing") {
      setView("landing");
      setPortalMode(null);
      setStoredPortalMode(null);
      setCompanyId(null);
    }
  }, [isAuthenticated, isInitializing, view]);

  const handleCompanyLogin = () => {
    setPortalMode("company");
    setStoredPortalMode("company");
  };

  const handleStaffLogin = () => {
    setPortalMode("staff");
    setStoredPortalMode("staff");
  };

  const handleCompanySetupSuccess = (newCompanyId: string) => {
    setCompanyId(newCompanyId);
    setStoredPortalMode(null);
    setView("company-dashboard");
  };

  const handleStaffRegistrationSuccess = () => {
    setStoredPortalMode(null);
    setView("staff-dashboard");
  };

  const handleEnterCompany = (cid: string) => {
    setCompanyId(cid);
    setView("company-dashboard");
  };

  // Handler for staff members with limited module access
  const handleEnterStaffModules = (cid: string, modules: string[]) => {
    setCompanyId(cid);
    setStaffModuleGrantedModules(modules);
    setView("staff-module-view");
  };

  // Show a full-screen loader while initializing or routing
  // Don't show loader if in error state — let the user see the landing page to retry
  const isRouting =
    isAuthenticated &&
    !isLoginError &&
    (isInitializing || profileLoading || companyCheckLoading) &&
    view === "landing";

  if ((isInitializing && !isLoginError) || isRouting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden dot-grid-bg">
        {/* Soft ambient blobs */}
        <div
          className="absolute top-1/4 right-1/4 w-96 h-96 opacity-15 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.22 280), transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-80 h-80 opacity-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(0.70 0.18 35), transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div className="relative flex flex-col items-center gap-6 animate-scale-in">
          <div
            className="p-4 rounded-2xl bg-card border border-primary/20 shadow-card"
            style={{ animation: "float 3s ease-in-out infinite" }}
          >
            <img
              src="/assets/generated/erpverse-logo.dim_256x256.png"
              alt="ERPVerse"
              className="h-12 w-12 rounded-xl object-cover"
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span
              className="font-display text-xl font-bold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.22 280), oklch(0.70 0.18 35))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ERPVerse
            </span>
            <span className="text-xs text-muted-foreground tracking-widest uppercase">
              {t("common.redirecting")}
            </span>
          </div>
          {/* Animated progress bar */}
          <div className="w-40 h-1 rounded-full overflow-hidden bg-secondary">
            <div
              className="h-full rounded-full animate-progress-bar"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.55 0.22 280), oklch(0.70 0.18 35))",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (view === "landing" || !isAuthenticated) {
    return (
      <LandingPage
        onCompanyLogin={handleCompanyLogin}
        onStaffLogin={handleStaffLogin}
        loginMode={loginMode}
        setLoginMode={setLoginMode}
      />
    );
  }

  if (view === "company-setup") {
    return (
      <CompanySetupPage
        userName={userProfile?.name}
        onSuccess={handleCompanySetupSuccess}
      />
    );
  }

  if (view === "staff-registration") {
    return <StaffRegistrationPage onSuccess={handleStaffRegistrationSuccess} />;
  }

  if (view === "company-dashboard" && companyId) {
    return (
      <CompanyOwnerDashboard
        companyId={companyId}
        userName={userProfile?.name}
        userRoleCode={userProfile?.roleCode}
        onBack={() => setView("staff-dashboard")}
      />
    );
  }

  if (view === "staff-module-view" && companyId) {
    // Staff member accessing specific modules — render CompanyOwnerDashboard
    // with staff role code (4) so sidebar filters to only grantedModules
    return (
      <CompanyOwnerDashboard
        companyId={companyId}
        userName={userProfile?.name}
        userRoleCode={BigInt(4)}
        grantedModules={staffModuleGrantedModules}
        onBack={() => setView("staff-dashboard")}
      />
    );
  }

  if (view === "company-select") {
    return (
      <CompanySelectPage
        onSelectCompany={(cid) => {
          setCompanyId(cid);
          setView("staff-dashboard");
        }}
        onLogout={() => {
          setView("landing");
        }}
      />
    );
  }

  if (view === "staff-dashboard") {
    return (
      <StaffDashboard
        onEnterCompany={handleEnterCompany}
        onEnterStaffModules={handleEnterStaffModules}
      />
    );
  }

  // Fallback
  return (
    <LandingPage
      onCompanyLogin={handleCompanyLogin}
      onStaffLogin={handleStaffLogin}
      loginMode={loginMode}
      setLoginMode={setLoginMode}
    />
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}
