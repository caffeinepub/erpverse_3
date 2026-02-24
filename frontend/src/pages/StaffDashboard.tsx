import React, { useState } from 'react';
import { Building2, User, Loader2, Copy, CheckCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useGetCallerUserProfile, useGetMyEmployeeCode, useGetCompany } from '../hooks/useQueries';
import Header from '../components/Header';
import CompanyMembershipCard from '../components/CompanyMembershipCard';

interface StaffDashboardProps {
  onEnterCompany?: (companyId: string) => void;
}

function getRoleName(roleCode: bigint, t: (key: string) => string): string {
  const code = Number(roleCode);
  if (code === 1) return t('roles.companyOwner');
  if (code === 2) return t('roles.companyManager');
  if (code === 3) return t('roles.companyAdministrator');
  if (code === 4) return t('roles.companyStaff');
  return t('roles.unknown');
}

interface StaffCompanyCardProps {
  companyId: string;
  roleCode: bigint;
  onEnter: () => void;
}

function StaffCompanyCard({ companyId, roleCode, onEnter }: StaffCompanyCardProps) {
  const { t } = useLanguage();
  const { data: company, isLoading } = useGetCompany(companyId);

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{t('common.loading')}</span>
      </div>
    );
  }

  if (!company) return null;

  return (
    <CompanyMembershipCard
      companyName={company.name}
      companyId={company.id}
      roleName={getRoleName(roleCode, t)}
      onEnter={onEnter}
    />
  );
}

export default function StaffDashboard({ onEnterCompany }: StaffDashboardProps) {
  const { t } = useLanguage();
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: employeeCode } = useGetMyEmployeeCode();
  const [activeTab, setActiveTab] = useState<'companies' | 'profile'>('companies');
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

  const hasCompany =
    profile?.companyId &&
    profile.companyId !== 'unassigned' &&
    profile.companyId !== '';

  if (profileLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t('common.loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header userName={profile?.name} />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Welcome */}
          <div className="mb-8 animate-fade-in">
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">
              {t('dashboard.staff.title')}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t('dashboard.staff.welcome')}, {profile?.name || ''}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-secondary rounded-lg p-1 mb-6 w-fit">
            <button
              onClick={() => setActiveTab('companies')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'companies'
                  ? 'bg-card text-foreground shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Building2 className="h-4 w-4" />
              {t('dashboard.staff.myCompanies')}
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-card text-foreground shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <User className="h-4 w-4" />
              {t('dashboard.staff.myProfile')}
            </button>
          </div>

          {/* Companies Tab */}
          {activeTab === 'companies' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              {hasCompany ? (
                <StaffCompanyCard
                  companyId={profile!.companyId}
                  roleCode={profile!.roleCode}
                  onEnter={() => onEnterCompany?.(profile!.companyId)}
                />
              ) : (
                <div className="bg-card border border-border rounded-xl p-10 flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-muted-foreground opacity-50" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-2">
                      {t('dashboard.staff.noCompanies')}
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-sm">
                      {t('dashboard.staff.noCompaniesDesc')}
                    </p>
                  </div>

                  {/* Show employee code prominently when no company */}
                  {employeeCode && (
                    <div className="mt-2 w-full max-w-sm bg-primary/10 border border-primary/30 rounded-xl p-4">
                      <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
                        {t('dashboard.staff.myCode')}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="flex-1 font-mono text-lg font-bold tracking-[0.25em] text-primary">
                          {employeeCode}
                        </span>
                        <button
                          onClick={handleCopyCode}
                          className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-all"
                        >
                          {codeCopied ? (
                            <CheckCheck className="h-4 w-4 text-primary" />
                          ) : (
                            <Copy className="h-4 w-4 text-primary" />
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
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Profile header */}
                <div className="flex items-center gap-4 p-6 border-b border-border bg-secondary/30">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <span className="font-display text-2xl font-bold text-primary">
                      {profile?.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-foreground text-lg">
                      {profile?.name || '—'}
                    </h2>
                    {profile?.projectManager && (
                      <p className="text-muted-foreground text-sm">{profile.projectManager}</p>
                    )}
                  </div>
                </div>

                {/* Profile details */}
                <div className="p-6 flex flex-col gap-4">
                  {/* Employee Code */}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">
                      {t('dashboard.staff.myCode')}
                    </p>
                    <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                      <span className="flex-1 font-mono text-xl font-bold tracking-[0.3em] text-primary">
                        {employeeCode || '—'}
                      </span>
                      {employeeCode && (
                        <button
                          onClick={handleCopyCode}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 rounded-md text-xs font-medium text-primary transition-all"
                        >
                          {codeCopied ? (
                            <>
                              <CheckCheck className="h-3.5 w-3.5" />
                              {t('staffRegistration.codeCopied')}
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              {t('staffRegistration.copyBtn')}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('staffRegistration.codeDesc')}
                    </p>
                  </div>

                  {/* Current company & role */}
                  {hasCompany && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">
                        {t('dashboard.staff.role')}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary">
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
      <footer className="border-t border-border py-4 px-6 text-xs text-muted-foreground flex items-center justify-between">
        <span>© {new Date().getFullYear()} ERPVerse. {t('footer.rights')}.</span>
        <span className="flex items-center gap-1">
          {t('footer.builtWith')} <span className="text-primary">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'erpverse')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </span>
      </footer>
    </div>
  );
}
