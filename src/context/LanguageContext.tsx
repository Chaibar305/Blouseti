'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { TRANSLATIONS, TranslationKey } from '@/lib/i18n';

export type Language = 'FR' | 'AR';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  isRtl: boolean;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('FR');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('blouseti_lang');
      if (saved === 'AR' || saved === 'FR') {
        setLangState(saved);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const isAdmin = window.location.pathname.startsWith('/admin');
    if (isAdmin) {
      document.documentElement.lang = 'fr';
      document.documentElement.dir = 'ltr';
      return;
    }
    document.documentElement.lang = lang === 'AR' ? 'ar' : 'fr';
    document.documentElement.dir = lang === 'AR' ? 'rtl' : 'ltr';
  }, [lang]);

  const setLang = (next: Language) => {
    setLangState(next);
    try {
      localStorage.setItem('blouseti_lang', next);
    } catch {
      // Ignore storage errors
    }
  };

  const toggleLang = () => {
    setLang(lang === 'FR' ? 'AR' : 'FR');
  };

  const t = (key: TranslationKey): string => {
    return TRANSLATIONS[lang][key] || TRANSLATIONS.FR[key];
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        isRtl: lang === 'AR',
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
