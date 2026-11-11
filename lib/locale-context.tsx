'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import i18nData from '@/lib/i18n-data.json';

export type Locale = 'en' | 'ar';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (namespace: 'common' | 'home' | 'blog' | string, path: string, params?: Record<string, any>) => string;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  // Load persisted locale on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('replean_locale') as Locale | null;
      if (saved === 'en' || saved === 'ar') {
        setLocaleState(saved);
      }
    } catch {}
  }, []);

  // Sync document root dir and lang, and persist
  useEffect(() => {
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    try {
      localStorage.setItem('replean_locale', locale);
    } catch {}
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => (prev === 'en' ? 'ar' : 'en'));
  }, []);

  const t = useCallback(
    (namespace: 'common' | 'home' | 'blog' | string, path: string, params?: Record<string, any>): string => {
      const dict = (i18nData as any)[locale]?.[namespace] || (i18nData as any)['en']?.[namespace] || {};
      const parts = path.split('.');
      let val: any = dict;
      for (const p of parts) {
        val = val?.[p];
        if (val === undefined) break;
      }
      if (typeof val !== 'string') {
        // fallback to english
        let fb: any = (i18nData as any)['en']?.[namespace] || {};
        for (const p of parts) {
          fb = fb?.[p];
          if (fb === undefined) break;
        }
        val = typeof fb === 'string' ? fb : path;
      }
      if (params) {
        Object.keys(params).forEach((k) => {
          val = val.replace(new RegExp(`{{\\s*${k}[^}]*}}`, 'g'), String(params[k]));
        });
      }
      return val;
    },
    [locale]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}
