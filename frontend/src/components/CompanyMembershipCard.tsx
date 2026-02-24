import React from 'react';
import { Building2, ChevronRight, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CompanyMembershipCardProps {
  companyName: string;
  companyId: string;
  roleName: string;
  onEnter: () => void;
}

function getRoleBadgeColor(roleName: string): string {
  if (roleName.includes('Owner') || roleName.includes('Sahibi')) return 'bg-primary/20 text-primary border-primary/30';
  if (roleName.includes('Manager') || roleName.includes('Yönetici')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  if (roleName.includes('Administrator') || roleName.includes('İdareci')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
  return 'bg-secondary text-muted-foreground border-border';
}

export default function CompanyMembershipCard({
  companyName,
  companyId,
  roleName,
  onEnter,
}: CompanyMembershipCardProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 hover:shadow-glow-sm transition-all group">
      <div className="p-3 bg-primary/10 rounded-xl">
        <Building2 className="h-6 w-6 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-foreground truncate">{companyName}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{companyId}</p>
        <div className="mt-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(roleName)}`}>
            <Shield className="h-3 w-3" />
            {roleName}
          </span>
        </div>
      </div>

      <button
        onClick={onEnter}
        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-all group-hover:shadow-glow-sm"
      >
        {t('dashboard.staff.enterCompany')}
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
