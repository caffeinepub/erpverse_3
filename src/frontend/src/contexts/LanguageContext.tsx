import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import ar from "../locales/ar.json";
import de from "../locales/de.json";
import en from "../locales/en.json";
import es from "../locales/es.json";
import fr from "../locales/fr.json";
import ja from "../locales/ja.json";
import pt from "../locales/pt.json";
import ru from "../locales/ru.json";
import tr from "../locales/tr.json";
import zh from "../locales/zh.json";

export type Language =
  | "tr"
  | "en"
  | "de"
  | "fr"
  | "es"
  | "ar"
  | "ru"
  | "zh"
  | "ja"
  | "pt";

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  dir?: "ltr" | "rtl";
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "tr", label: "Turkish", nativeLabel: "Türkçe" },
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "de", label: "German", nativeLabel: "Deutsch" },
  { code: "fr", label: "French", nativeLabel: "Français" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", dir: "rtl" },
  { code: "ru", label: "Russian", nativeLabel: "Русский" },
  { code: "zh", label: "Chinese", nativeLabel: "中文" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português" },
];

type Translations = typeof tr;

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  tArray: (key: string) => string[];
  currentOption: LanguageOption;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

const translations: Record<Language, Translations> = {
  tr,
  en,
  de,
  fr,
  es,
  ar,
  ru,
  zh,
  ja,
  pt,
} as Record<Language, Translations>;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (
      current &&
      typeof current === "object" &&
      key in (current as Record<string, unknown>)
    ) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}

function getNestedArray(obj: Record<string, unknown>, path: string): string[] {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (
      current &&
      typeof current === "object" &&
      key in (current as Record<string, unknown>)
    ) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return [];
    }
  }
  return Array.isArray(current) ? (current as string[]) : [];
}

const VALID_LANGS: Language[] = [
  "tr",
  "en",
  "de",
  "fr",
  "es",
  "ar",
  "ru",
  "zh",
  "ja",
  "pt",
];

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("erpverse-language");
    return VALID_LANGS.includes(stored as Language)
      ? (stored as Language)
      : "tr";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("erpverse-language", lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    const idx = VALID_LANGS.indexOf(language);
    setLanguage(VALID_LANGS[(idx + 1) % VALID_LANGS.length]);
  }, [language, setLanguage]);

  const t = useCallback(
    (key: string): string => {
      return getNestedValue(
        translations[language] as unknown as Record<string, unknown>,
        key,
      );
    },
    [language],
  );

  const tArray = useCallback(
    (key: string): string[] => {
      return getNestedArray(
        translations[language] as unknown as Record<string, unknown>,
        key,
      );
    },
    [language],
  );

  const currentOption =
    LANGUAGE_OPTIONS.find((o) => o.code === language) ?? LANGUAGE_OPTIONS[0];
  const isRTL = currentOption.dir === "rtl";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        toggleLanguage,
        setLanguage,
        t,
        tArray,
        currentOption,
        isRTL,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
