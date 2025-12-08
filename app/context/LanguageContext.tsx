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
  // Varsayılan olarak 'tr' başlatıyoruz ki sunucu tarafında hata olmasın
  const [language, setLanguageState] = useState<Language>('tr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Bileşen tarayıcıda yüklendi
    
    // Sadece tarayıcıda çalışır
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('cereget-lang') as Language;
      if (savedLang) {
        setLanguageState(savedLang);
      } else {
        const browserLang = navigator.language.startsWith('en') ? 'en' : 'tr';
        setLanguageState(browserLang);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cereget-lang', lang);
    }
  };

  const t = (key: keyof typeof translations['tr']) => {
    return translations[language][key] || key;
  };

  // Hydration hatasını önlemek için mount olana kadar render etme (Opsiyonel ama güvenli)
  if (!mounted) {
    return <>{children}</>; 
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};