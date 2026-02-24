import React from 'react';
import { Building2, Users, Shield, Settings, LayoutDashboard, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export type SidebarView = 'overview' | 'staff' | 'roles' | 'settings';

interface DashboardSidebarProps {
  companyName: string;
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
  isOwner?: boolean;
}

export default function DashboardSidebar({
  companyName,
  activeView,
  onViewChange,
  isOwner = true,
}: DashboardSidebarProps) {
  const { t } = useLanguage();

  const navItems: { id: SidebarView; icon: React.ElementType; label: string }[] = [
    { id: 'overview', icon: LayoutDashboard, label: t('dashboard.owner.overview') },
    { id: 'staff', icon: Users, label: t('dashboard.owner.staffManagement') },
    { id: 'roles', icon: Shield, label: t('dashboard.owner.roleManagement') },
    { id: 'settings', icon: Settings, label: t('dashboard.owner.settings') },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col min-h-0">
      {/* Company name */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
              {isOwner ? t('dashboard.owner.title') : t('dashboard.staff.companyPanel')}
            </p>
            <p className="font-display font-semibold text-foreground text-sm truncate">{companyName}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
              activeView === id
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            }`}
          >
            <Icon className={`h-4 w-4 flex-shrink-0 ${activeView === id ? 'text-primary' : ''}`} />
            <span className="flex-1 text-left">{label}</span>
            {activeView === id && <ChevronRight className="h-3.5 w-3.5 text-primary" />}
          </button>
        ))}
      </nav>

      {/* Bottom badge */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg border border-primary/10">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-muted-foreground">ERPVerse v1.0</span>
        </div>
      </div>
    </aside>
  );
}
