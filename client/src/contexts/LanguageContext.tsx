import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import arSA from "../locales/ar-SA.json";
import enUS from "../locales/en-US.json";

export type Locale = "ar-SA" | "en-US";
export type Direction = "rtl" | "ltr";

const locales: Record<Locale, Record<string, any>> = {
  "ar-SA": arSA,
  "en-US": enUS,
};

interface LanguageContextType {
  locale: Locale;
  direction: Direction;
  isRTL: boolean;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tArray: (key: string) => any[];
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "investor-portal-locale";

function getNestedValue(obj: Record<string, any>, path: string): string | undefined {
  const keys = path.split(".");
  let current: any = obj;
  for (const key of keys) {
    if (current === undefined || current === null) return undefined;
    current = current[key];
  }
  return typeof current === "string" ? current : undefined;
}

function getNestedArray(obj: Record<string, any>, path: string): any[] | undefined {
  const keys = path.split(".");
  let current: any = obj;
  for (const key of keys) {
    if (current === undefined || current === null) return undefined;
    current = current[key];
  }
  return Array.isArray(current) ? current : undefined;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "ar-SA" || saved === "en-US") return saved;
    }
    return "ar-SA"; // Default Arabic
  });

  const direction: Direction = locale === "ar-SA" ? "rtl" : "ltr";
  const isRTL = locale === "ar-SA";

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLocale(locale === "ar-SA" ? "en-US" : "ar-SA");
  }, [locale, setLocale]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let value = getNestedValue(locales[locale], key);
      if (!value) {
        // Fallback to Arabic
        value = getNestedValue(locales["ar-SA"], key);
      }
      if (!value) return key; // Return key as fallback
      
      // Replace params like {min}, {max}
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          value = value!.replace(`{${k}}`, String(v));
        });
      }
      return value;
    },
    [locale]
  );

  const tArray = useCallback(
    (key: string): any[] => {
      let value = getNestedArray(locales[locale], key);
      if (!value) {
        value = getNestedArray(locales["ar-SA"], key);
      }
      return value || [];
    },
    [locale]
  );

  // Update document direction and lang
  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = locale === "ar-SA" ? "ar" : "en";
    
    // Update font family based on language
    if (locale === "ar-SA") {
      document.documentElement.style.fontFamily = "'Cairo', 'Tajawal', sans-serif";
    } else {
      document.documentElement.style.fontFamily = "'Inter', 'Poppins', sans-serif";
    }
  }, [locale, direction]);

  return (
    <LanguageContext.Provider value={{ locale, direction, isRTL, setLocale, t, tArray, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export default LanguageContext;
