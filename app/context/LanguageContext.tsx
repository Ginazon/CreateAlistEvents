'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '../lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['tr']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en'); // Varsayılanı sonra değiştireceğiz

  useEffect(() => {
    // 1. Önce kayıtlı tercih var mı bak
    const savedLang = localStorage.getItem('cereget-lang') as Language;
    
    if (savedLang) {
      setLanguageState(savedLang);
    } else {
      // 2. Yoksa tarayıcı diline bak
      const browserLang = navigator.language.startsWith('tr') ? 'tr' : 'en';
      setLanguageState(browserLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('cereget-lang', lang);
  };

  // Çeviri fonksiyonu: t('save') -> "Kaydet" veya "Save" döndürür
  const t = (key: keyof typeof translations['tr']) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Kolay kullanım için Hook
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};