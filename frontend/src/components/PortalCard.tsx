import React from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PortalCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  loginBtnText: string;
  isLoading: boolean;
  onLogin: () => void;
  accentColor?: 'gold' | 'blue';
}

export default function PortalCard({
  icon,
  title,
  subtitle,
  description,
  features,
  loginBtnText,
  isLoading,
  onLogin,
  accentColor = 'gold',
}: PortalCardProps) {
  const { t } = useLanguage();

  return (
    <div className="relative group glass-card rounded-2xl p-8 flex flex-col gap-6 hover:border-primary/40 transition-all duration-300 hover:shadow-glow">
      {/* Accent line */}
      <div
        className={`absolute top-0 left-8 right-8 h-0.5 rounded-full ${
          accentColor === 'gold' ? 'bg-primary' : 'bg-blue-500'
        }`}
      />

      {/* Icon + Title */}
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${accentColor === 'gold' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-400'}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            {subtitle}
          </p>
          <h2 className="font-display text-2xl font-bold text-foreground">{title}</h2>
        </div>
      </div>

      {/* Description */}
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>

      {/* Features */}
      <ul className="flex flex-col gap-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-foreground/80">
            <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${accentColor === 'gold' ? 'text-primary' : 'text-blue-400'}`} />
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        onClick={onLogin}
        disabled={isLoading}
        className={`mt-auto w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
          accentColor === 'gold'
            ? 'gold-gradient text-primary-foreground hover:opacity-90 shadow-glow-sm'
            : 'bg-blue-600 text-white hover:bg-blue-500'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('landing.ownerPortal.loggingIn')}
          </>
        ) : (
          loginBtnText
        )}
      </button>
    </div>
  );
}
