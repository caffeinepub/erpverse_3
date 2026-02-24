import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import tr from '../locales/tr.json';
import en from '../locales/en.json';

export type Language = 'tr' | 'en';

type Translations = typeof tr;

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Translations> = { tr, en };

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('erpverse-language');
    return (stored === 'en' || stored === 'tr') ? stored : 'tr';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('erpverse-language', lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'tr' ? 'en' : 'tr');
  }, [language, setLanguage]);

  const t = useCallback((key: string): string => {
    return getNestedValue(translations[language] as unknown as Record<string, unknown>, key);
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
