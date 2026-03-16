import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Locale } from "../i18n";

interface LanguageContextProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, ...args: any[]) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Get saved locale from localStorage or detect browser language
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved && (saved === "en" || saved === "ru")) return saved;
    
    // Detect browser language
    const browserLang = navigator.language.split("-")[0];
    return browserLang === "ru" ? "ru" : "en";
  });

  // Save locale to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("locale", locale);
    document.documentElement.lang = locale;
  }, [locale]);

  // Translation function - simplified to avoid typing issues
  const t = (key: string, ...args: any[]): string => {
    // Get the translation for the current locale
    const localeTranslations = translations[locale as keyof typeof translations];
    const translation = (localeTranslations as any)[key];
    
    // Fallback to English if translation not found in current locale
    const fallbackTranslation = (translations.en as any)[key];
    
    // If it's a function, call it with arguments
    if (typeof translation === "function") {
      return translation(...args);
    }
    
    // If translation exists, return it, otherwise use fallback
    if (translation !== undefined) {
      return translation;
    }
    
    // If fallback exists, return it
    if (fallbackTranslation !== undefined) {
      return typeof fallbackTranslation === "function" ? fallbackTranslation(...args) : fallbackTranslation;
    }
    
    // Return key as last resort
    return key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};