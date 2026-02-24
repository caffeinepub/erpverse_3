import React, { useState, useEffect } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsRegisteredAsCompany } from './hooks/useQueries';
import { LanguageProvider } from './contexts/LanguageContext';
import LandingPage from './pages/LandingPage';
import CompanySetupPage from './pages/CompanySetupPage';
import StaffRegistrationPage from './pages/StaffRegistrationPage';
import CompanyOwnerDashboard from './pages/CompanyOwnerDashboard';
import StaffDashboard from './pages/StaffDashboard';
import { Loader2 } from 'lucide-react';

// Portal mode is stored in sessionStorage so it persists across the II redirect
function getStoredPortalMode(): 'company' | 'staff' | null {
  const stored = sessionStorage.getItem('erpverse-portal-mode');
  if (stored === 'company' || stored === 'staff') return stored;
  return null;
}

function setStoredPortalMode(mode: 'company' | 'staff' | null) {
  if (mode) sessionStorage.setItem('erpverse-portal-mode', mode);
  else sessionStorage.removeItem('erpverse-portal-mode');
}

type AppView =
  | 'landing'
  | 'company-setup'
  | 'company-dashboard'
  | 'staff-registration'
  | 'staff-dashboard';

function AppInner() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const [loginMode, setLoginMode] = useState<'idle' | 'company' | 'staff'>('idle');
  const [portalMode, setPortalMode] = useState<'company' | 'staff' | null>(getStoredPortalMode);
  const [view, setView] = useState<AppView>('landing');
  const [companyId, setCompanyId] = useState<string | null>(null);

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
    if (profileLoading || companyCheckLoading) return;
    if (!profileFetched || !companyCheckFetched) return;

    const mode = portalMode || getStoredPortalMode();

    if (mode === 'company') {
      if (registeredCompanyId) {
        setCompanyId(registeredCompanyId);
        setView('company-dashboard');
      } else {
        setView('company-setup');
      }
    } else if (mode === 'staff') {
      if (!userProfile) {
        setView('staff-registration');
      } else {
        setView('staff-dashboard');
      }
    } else {
      // No portal mode stored — try to infer from backend state
      if (registeredCompanyId) {
        setCompanyId(registeredCompanyId);
        setView('company-dashboard');
      } else if (userProfile) {
        setView('staff-dashboard');
      }
      // else stay on landing (user just authenticated without choosing a portal)
    }
  }, [
    isAuthenticated,
    isInitializing,
    profileLoading,
    companyCheckLoading,
    profileFetched,
    companyCheckFetched,
    userProfile,
    registeredCompanyId,
    portalMode,
  ]);

  // If not authenticated, always show landing
  useEffect(() => {
    if (!isAuthenticated && !isInitializing) {
      setView('landing');
    }
  }, [isAuthenticated, isInitializing]);

  const handleCompanyLogin = () => {
    setPortalMode('company');
    setStoredPortalMode('company');
  };

  const handleStaffLogin = () => {
    setPortalMode('staff');
    setStoredPortalMode('staff');
  };

  const handleCompanySetupSuccess = (newCompanyId: string) => {
    setCompanyId(newCompanyId);
    setStoredPortalMode(null);
    setView('company-dashboard');
  };

  const handleStaffRegistrationSuccess = () => {
    setStoredPortalMode(null);
    setView('staff-dashboard');
  };

  const handleEnterCompany = (cid: string) => {
    setCompanyId(cid);
    setView('company-dashboard');
  };

  // Show a full-screen loader while initializing or routing
  const isRouting =
    isAuthenticated &&
    (isInitializing || profileLoading || companyCheckLoading) &&
    view === 'landing';

  if (isInitializing || isRouting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/generated/erpverse-logo.dim_256x256.png"
            alt="ERPVerse"
            className="h-14 w-14 rounded-xl object-cover"
          />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">ERPVerse yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'landing' || !isAuthenticated) {
    return (
      <LandingPage
        onCompanyLogin={handleCompanyLogin}
        onStaffLogin={handleStaffLogin}
        loginMode={loginMode}
        setLoginMode={setLoginMode}
      />
    );
  }

  if (view === 'company-setup') {
    return (
      <CompanySetupPage
        userName={userProfile?.name}
        onSuccess={handleCompanySetupSuccess}
      />
    );
  }

  if (view === 'staff-registration') {
    return (
      <StaffRegistrationPage
        onSuccess={handleStaffRegistrationSuccess}
      />
    );
  }

  if (view === 'company-dashboard' && companyId) {
    return (
      <CompanyOwnerDashboard
        companyId={companyId}
        userName={userProfile?.name}
      />
    );
  }

  if (view === 'staff-dashboard') {
    return (
      <StaffDashboard
        onEnterCompany={handleEnterCompany}
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
