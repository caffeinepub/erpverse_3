import React from 'react';
import { Building2, Mail, Phone, MapPin, User, Calendar, Hash, Users, Briefcase } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Company } from '../backend';

interface CompanyInfoCardProps {
  company: Company;
}

export default function CompanyInfoCard({ company }: CompanyInfoCardProps) {
  const { t } = useLanguage();

  const fields = [
    { icon: Hash, label: t('dashboard.owner.taxNumber'), value: company.taxNumber },
    { icon: Briefcase, label: t('dashboard.owner.sector'), value: company.sector },
    { icon: Calendar, label: t('dashboard.owner.founded'), value: company.foundingYear.toString() },
    { icon: User, label: t('dashboard.owner.authorizedPerson'), value: company.authorizedPerson },
    { icon: Users, label: t('dashboard.owner.employeeCount'), value: company.employeeCount.toString() },
    { icon: Mail, label: t('dashboard.owner.email'), value: company.email },
    { icon: Phone, label: t('dashboard.owner.phone'), value: `${company.phone.countryCode} ${company.phone.number}` },
    { icon: MapPin, label: t('dashboard.owner.address'), value: company.address },
  ];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-border bg-secondary/30">
        <div className="p-2.5 bg-primary/10 rounded-lg">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground">{company.name}</h3>
          <p className="text-xs text-muted-foreground">{t('dashboard.owner.companyId')}: {company.id}</p>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x-0">
        {fields.map(({ icon: Icon, label, value }, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 p-4 ${i % 2 === 0 ? '' : ''} border-b border-border last:border-b-0`}
          >
            <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
              <p className="text-sm font-medium text-foreground truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
