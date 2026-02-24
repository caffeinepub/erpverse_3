import React, { useState } from 'react';
import {
  Users, Plus, Trash2, Shield, Loader2, AlertCircle,
  LayoutDashboard, RefreshCw, X
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  useGetCompany,
  useGetStaffForCompany,
  useAddStaffToCompany,
  useRemoveStaffFromCompany,
  useUpdateStaffRole,
  useListRolesForCompany,
} from '../hooks/useQueries';
import Header from '../components/Header';
import DashboardSidebar, { type SidebarView } from '../components/DashboardSidebar';
import CompanyInfoCard from '../components/CompanyInfoCard';
import { RoleAssignmentResult } from '../backend';
import type { Staff } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

interface CompanyOwnerDashboardProps {
  companyId: string;
  userName?: string;
}

function getRoleName(roleCode: bigint): string {
  const code = Number(roleCode);
  if (code === 1) return 'Company Owner';
  if (code === 2) return 'Company Manager';
  if (code === 3) return 'Company Administrator';
  if (code === 4) return 'Company Staff';
  return 'Unknown';
}

function getRoleDisplayName(roleName: string, t: (key: string) => string): string {
  if (roleName === 'Company Owner') return t('roles.companyOwner');
  if (roleName === 'Company Manager') return t('roles.companyManager');
  if (roleName === 'Company Administrator') return t('roles.companyAdministrator');
  if (roleName === 'Company Staff') return t('roles.companyStaff');
  return roleName;
}

export default function CompanyOwnerDashboard({ companyId, userName }: CompanyOwnerDashboardProps) {
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState<SidebarView>('overview');
  const [addCode, setAddCode] = useState('');
  const [addRole, setAddRole] = useState('Company Staff');
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [removingPrincipal, setRemovingPrincipal] = useState<string | null>(null);
  const [updatingPrincipal, setUpdatingPrincipal] = useState<string | null>(null);
  const [updateRoleValue, setUpdateRoleValue] = useState('');

  const { data: company, isLoading: companyLoading } = useGetCompany(companyId);
  const { data: staffList = [], isLoading: staffLoading, refetch: refetchStaff } = useGetStaffForCompany(companyId);
  const { data: roles = [] } = useListRolesForCompany(companyId);
  const addStaff = useAddStaffToCompany();
  const removeStaff = useRemoveStaffFromCompany();
  const updateRole = useUpdateStaffRole();

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    if (!addCode.trim() || addCode.trim().length !== 12) {
      setAddError('Geçerli bir 12 haneli personel kodu girin');
      return;
    }
    try {
      const result = await addStaff.mutateAsync({ companyId, employeeCode: addCode.trim(), roleName: addRole });
      if (result === RoleAssignmentResult.success) {
        setAddSuccess(t('common.success'));
        setAddCode('');
        refetchStaff();
      } else if (result === RoleAssignmentResult.invalidCode) {
        setAddError('Geçersiz personel kodu');
      } else if (result === RoleAssignmentResult.alreadyAssigned) {
        setAddError('Bu personel zaten şirkete ekli');
      } else if (result === RoleAssignmentResult.insufficientPermissions) {
        setAddError('Bu rolü atamak için yetkiniz yok');
      } else {
        setAddError(t('common.error'));
      }
    } catch (err) {
      setAddError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleRemoveStaff = async (principal: Principal) => {
    setRemovingPrincipal(principal.toString());
    try {
      await removeStaff.mutateAsync({ companyId, staffPrincipal: principal });
      refetchStaff();
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingPrincipal(null);
    }
  };

  const handleUpdateRole = async (staff: Staff) => {
    if (!updateRoleValue) return;
    setUpdatingPrincipal(staff.principal.toString());
    try {
      await updateRole.mutateAsync({
        companyId,
        staffPrincipal: staff.principal,
        newRoleName: updateRoleValue,
      });
      setUpdatingPrincipal(null);
      setUpdateRoleValue('');
      refetchStaff();
    } catch (err) {
      console.error(err);
      setUpdatingPrincipal(null);
    }
  };

  const availableRoles = roles.length > 0
    ? roles.map(r => r.name)
    : ['Company Manager', 'Company Administrator', 'Company Staff'];

  if (companyLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header userName={userName} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t('common.loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header userName={userName} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('common.error')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header userName={userName} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <DashboardSidebar
          companyName={company.name}
          activeView={activeView}
          onViewChange={setActiveView}
          isOwner
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {/* Overview */}
          {activeView === 'overview' && (
            <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">
                  {t('dashboard.owner.overview')}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {t('dashboard.owner.welcome')}, {userName || company.authorizedPerson}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {t('dashboard.owner.totalStaff')}
                    </span>
                  </div>
                  <p className="font-display text-3xl font-bold text-foreground">{staffList.length}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {t('dashboard.owner.activeRoles')}
                    </span>
                  </div>
                  <p className="font-display text-3xl font-bold text-foreground">{availableRoles.length}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-5 col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-2 mb-3">
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {t('dashboard.owner.sector')}
                    </span>
                  </div>
                  <p className="font-display text-lg font-bold text-foreground truncate">{company.sector}</p>
                </div>
              </div>

              <CompanyInfoCard company={company} />
            </div>
          )}

          {/* Staff Management */}
          {activeView === 'staff' && (
            <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">
                  {t('dashboard.owner.staffManagement')}
                </h1>
              </div>

              {/* Add Staff Form */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-display font-semibold text-foreground mb-1">
                  {t('dashboard.owner.addStaffTitle')}
                </h2>
                <p className="text-muted-foreground text-sm mb-4">{t('dashboard.owner.addStaffDesc')}</p>

                <form onSubmit={handleAddStaff} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={addCode}
                      onChange={e => {
                        setAddCode(e.target.value.toUpperCase());
                        setAddError('');
                        setAddSuccess('');
                      }}
                      placeholder={t('dashboard.owner.employeeCodePlaceholder')}
                      maxLength={12}
                      className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                  </div>
                  <select
                    value={addRole}
                    onChange={e => setAddRole(e.target.value)}
                    className="bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {availableRoles.filter(r => r !== 'Company Owner').map(r => (
                      <option key={r} value={r}>{getRoleDisplayName(r, t)}</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={addStaff.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 gold-gradient text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-60 whitespace-nowrap"
                  >
                    {addStaff.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    {addStaff.isPending ? t('dashboard.owner.adding') : t('dashboard.owner.addBtn')}
                  </button>
                </form>

                {addError && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {addError}
                  </div>
                )}
                {addSuccess && (
                  <div className="mt-3 text-sm text-primary">{addSuccess}</div>
                )}
              </div>

              {/* Staff List */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <h2 className="font-display font-semibold text-foreground">
                    {t('dashboard.owner.staffList')}
                  </h2>
                  <button
                    onClick={() => refetchStaff()}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-all"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>

                {staffLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : staffList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Users className="h-10 w-10 mb-3 opacity-30" />
                    <p className="text-sm">{t('dashboard.owner.noStaff')}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {staffList.map((staff) => {
                      const roleName = getRoleName(staff.roleCode);
                      const isUpdating = updatingPrincipal === staff.principal.toString();
                      const isRemoving = removingPrincipal === staff.principal.toString();

                      return (
                        <div key={staff.principal.toString()} className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-all">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-semibold text-sm">
                              {staff.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">{staff.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{staff.employeeCode}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isUpdating ? (
                              <div className="flex items-center gap-2">
                                <select
                                  value={updateRoleValue}
                                  onChange={e => setUpdateRoleValue(e.target.value)}
                                  className="bg-input border border-border rounded-md px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                >
                                  <option value="">{t('dashboard.owner.rolePlaceholder')}</option>
                                  {availableRoles.filter(r => r !== 'Company Owner').map(r => (
                                    <option key={r} value={r}>{getRoleDisplayName(r, t)}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleUpdateRole(staff)}
                                  disabled={updateRole.isPending}
                                  className="px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:opacity-90"
                                >
                                  {updateRole.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : '✓'}
                                </button>
                                <button
                                  onClick={() => { setUpdatingPrincipal(null); setUpdateRoleValue(''); }}
                                  className="p-1 text-muted-foreground hover:text-foreground"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-secondary rounded-full text-xs text-muted-foreground border border-border">
                                  <Shield className="h-3 w-3" />
                                  {getRoleDisplayName(roleName, t)}
                                </span>
                                <button
                                  onClick={() => {
                                    setUpdatingPrincipal(staff.principal.toString());
                                    setUpdateRoleValue(roleName);
                                  }}
                                  className="p-1.5 text-muted-foreground hover:text-primary rounded-md hover:bg-primary/10 transition-all"
                                  title={t('dashboard.owner.updateRole')}
                                >
                                  <Shield className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRemoveStaff(staff.principal)}
                                  disabled={isRemoving}
                                  className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition-all"
                                  title={t('dashboard.owner.removeBtn')}
                                >
                                  {isRemoving ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Role Management */}
          {activeView === 'roles' && (
            <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">
                  {t('dashboard.owner.roleManagement')}
                </h1>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableRoles.map((roleName) => (
                  <div key={roleName} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Shield className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-display font-semibold text-foreground text-sm">
                        {getRoleDisplayName(roleName, t)}
                      </h3>
                    </div>
                    {roles.find(r => r.name === roleName)?.permissions && (
                      <ul className="flex flex-col gap-1.5">
                        {roles.find(r => r.name === roleName)!.permissions.map((perm, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                            {perm}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          {activeView === 'settings' && (
            <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">
                  {t('dashboard.owner.settings')}
                </h1>
              </div>
              <CompanyInfoCard company={company} />
            </div>
          )}
        </main>
      </div>

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
