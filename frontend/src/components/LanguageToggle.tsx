import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 bg-secondary rounded-md p-0.5 border border-border">
      <button
        onClick={() => setLanguage('tr')}
        className={`px-2.5 py-1 text-xs font-semibold rounded transition-all ${
          language === 'tr'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="Türkçe"
      >
        TR
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 text-xs font-semibold rounded transition-all ${
          language === 'en'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
