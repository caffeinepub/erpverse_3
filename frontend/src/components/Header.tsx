import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import { LogOut, User } from 'lucide-react';

interface HeaderProps {
  showAuth?: boolean;
  userName?: string;
}

export default function Header({ showAuth = true, userName }: HeaderProps) {
  const { identity, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-sidebar/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/erpverse-logo.dim_256x256.png"
              alt="ERPVerse"
              className="h-9 w-9 rounded-lg object-cover"
            />
            <div className="flex flex-col">
              <span className="font-display font-bold text-foreground text-lg leading-tight">
                ERPVerse
              </span>
              <span className="text-muted-foreground text-[10px] leading-tight hidden sm:block">
                {t('app.tagline')}
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LanguageToggle />

            {showAuth && isAuthenticated && (
              <div className="flex items-center gap-2">
                {userName && (
                  <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="font-medium text-foreground">{userName}</span>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  disabled={loginStatus === 'logging-in'}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-secondary transition-all"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t('nav.logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
