import React, { useEffect } from 'react';
import { Building2, Users, ArrowRight, Globe, Lock, Layers, Zap } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useLanguage } from '../contexts/LanguageContext';
import PortalCard from '../components/PortalCard';
import LanguageToggle from '../components/LanguageToggle';

interface LandingPageProps {
  onCompanyLogin: () => void;
  onStaffLogin: () => void;
  loginMode: 'idle' | 'company' | 'staff';
  setLoginMode: (mode: 'idle' | 'company' | 'staff') => void;
}

export default function LandingPage({
  onCompanyLogin,
  onStaffLogin,
  loginMode,
  setLoginMode,
}: LandingPageProps) {
  const { login, loginStatus, isLoggingIn } = useInternetIdentity();
  const { t } = useLanguage();

  const handleCompanyLogin = () => {
    setLoginMode('company');
    onCompanyLogin();
    login();
  };

  const handleStaffLogin = () => {
    setLoginMode('staff');
    onStaffLogin();
    login();
  };

  const featureItems = [
    {
      icon: Layers,
      title: t('landing.features.multiTenant.title'),
      desc: t('landing.features.multiTenant.desc'),
    },
    {
      icon: Lock,
      title: t('landing.features.roles.title'),
      desc: t('landing.features.roles.desc'),
    },
    {
      icon: Globe,
      title: t('landing.features.multilang.title'),
      desc: t('landing.features.multilang.desc'),
    },
    {
      icon: Zap,
      title: t('landing.features.secure.title'),
      desc: t('landing.features.secure.desc'),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('/assets/generated/hero-bg.dim_1920x1080.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 z-0 bg-background/85" />

      {/* Decorative grid */}
      <div
        className="absolute inset-0 z-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(oklch(0.78 0.16 75) 1px, transparent 1px), linear-gradient(90deg, oklch(0.78 0.16 75) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-sidebar/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img
                src="/assets/generated/erpverse-logo.dim_256x256.png"
                alt="ERPVerse"
                className="h-9 w-9 rounded-lg object-cover"
              />
              <div>
                <span className="font-display font-bold text-foreground text-lg leading-tight block">
                  ERPVerse
                </span>
                <span className="text-muted-foreground text-[10px] leading-tight hidden sm:block">
                  {t('app.tagline')}
                </span>
              </div>
            </div>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col">
        {/* Hero */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-semibold uppercase tracking-widest mb-6">
              <Zap className="h-3.5 w-3.5" />
              {t('landing.hero.badge')}
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              {t('landing.hero.title')}
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
              {t('landing.hero.subtitle')}
            </p>
          </div>
        </section>

        {/* Portal Cards */}
        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <PortalCard
              icon={<Building2 className="h-6 w-6" />}
              title={t('landing.ownerPortal.title')}
              subtitle={t('landing.ownerPortal.subtitle')}
              description={t('landing.ownerPortal.description')}
              features={[
                t('landing.ownerPortal.features.0') || 'Şirket Yönetimi',
                t('landing.ownerPortal.features.1') || 'Personel Kontrolü',
                t('landing.ownerPortal.features.2') || 'Rol Yönetimi',
              ]}
              loginBtnText={t('landing.ownerPortal.loginBtn')}
              isLoading={isLoggingIn && loginMode === 'company'}
              onLogin={handleCompanyLogin}
              accentColor="gold"
            />

            <PortalCard
              icon={<Users className="h-6 w-6" />}
              title={t('landing.staffPortal.title')}
              subtitle={t('landing.staffPortal.subtitle')}
              description={t('landing.staffPortal.description')}
              features={[
                t('landing.staffPortal.features.0') || 'Çoklu Şirket Desteği',
                t('landing.staffPortal.features.1') || 'Rol Bazlı Erişim',
                t('landing.staffPortal.features.2') || 'Personel Kodu',
              ]}
              loginBtnText={t('landing.staffPortal.loginBtn')}
              isLoading={isLoggingIn && loginMode === 'staff'}
              onLogin={handleStaffLogin}
              accentColor="blue"
            />
          </div>
        </section>

        {/* Features */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20 border-t border-border/30 pt-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-center text-foreground mb-10">
              {t('landing.features.title')}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {featureItems.map(({ icon: Icon, title, desc }, i) => (
                <div
                  key={i}
                  className="glass-card rounded-xl p-5 flex flex-col gap-3 hover:border-primary/30 transition-all"
                >
                  <div className="p-2.5 bg-primary/10 rounded-lg w-fit">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground text-sm">{title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} ERPVerse. {t('footer.rights')}.</span>
          <span className="flex items-center gap-1">
            {t('footer.builtWith')}{' '}
            <span className="text-primary">♥</span>{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'erpverse')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
