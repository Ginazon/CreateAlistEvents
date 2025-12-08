'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. GENİŞLETİLMİŞ SÖZLÜK
const translations = {
  tr: {
    name: 'Türkçe',
    dashboard_title: 'Cereget Yönetim Paneli',
    dashboard_subtitle: 'Etkinliklerini buradan yönet.',
    my_credits: 'Kredilerim',
    create_new_event: '+ Yeni Etkinlik',
    no_events: 'Henüz hiç etkinliğin yok.',
    manage: 'Yönet',
    download: 'İndir',
    guests_tab: '📋 Davetliler',
    photos_tab: '📸 Galeri',
    logout: 'Çıkış',
    edit: 'Düzenle',
    delete: 'Sil',
    loading: 'Yükleniyor...',
    confirm_delete: 'Silmek istediğine emin misin?'
  },
  en: {
    name: 'English',
    dashboard_title: 'Cereget Dashboard',
    dashboard_subtitle: 'Manage your events here.',
    my_credits: 'My Credits',
    create_new_event: '+ New Event',
    no_events: 'You have no events yet.',
    manage: 'Manage',
    download: 'Download',
    guests_tab: '📋 Guest List',
    photos_tab: '📸 Gallery',
    logout: 'Log Out',
    edit: 'Edit',
    delete: 'Delete',
    loading: 'Loading...',
    confirm_delete: 'Are you sure you want to delete?'
  },
  de: {
    name: 'Deutsch',
    dashboard_title: 'Cereget Dashboard',
    dashboard_subtitle: 'Verwalten Sie hier Ihre Events.',
    my_credits: 'Meine Credits',
    create_new_event: '+ Neues Event',
    no_events: 'Sie haben noch keine Events.',
    manage: 'Verwalten',
    download: 'Herunterladen',
    guests_tab: '📋 Gästeliste',
    photos_tab: '📸 Galerie',
    logout: 'Abmelden',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    loading: 'Laden...',
    confirm_delete: 'Möchten Sie wirklich löschen?'
  },
  fr: {
    name: 'Français',
    dashboard_title: 'Tableau de bord Cereget',
    dashboard_subtitle: 'Gérez vos événements ici.',
    my_credits: 'Mes crédits',
    create_new_event: '+ Nouvel événement',
    no_events: 'Vous n\'avez pas encore d\'événements.',
    manage: 'Gérer',
    download: 'Télécharger',
    guests_tab: '📋 Invités',
    photos_tab: '📸 Galerie',
    logout: 'Déconnexion',
    edit: 'Modifier',
    delete: 'Supprimer',
    loading: 'Chargement...',
    confirm_delete: 'Êtes-vous sûr de vouloir supprimer ?'
  },
  es: {
    name: 'Español',
    dashboard_title: 'Panel de Cereget',
    dashboard_subtitle: 'Gestiona tus eventos aquí.',
    my_credits: 'Mis Créditos',
    create_new_event: '+ Nuevo Evento',
    no_events: 'Aún no tienes eventos.',
    manage: 'Gestionar',
    download: 'Descargar',
    guests_tab: '📋 Invitados',
    photos_tab: '📸 Galería',
    logout: 'Salir',
    edit: 'Editar',
    delete: 'Eliminar',
    loading: 'Cargando...',
    confirm_delete: '¿Seguro que quieres eliminar?'
  },
  it: {
    name: 'Italiano',
    dashboard_title: 'Dashboard Cereget',
    dashboard_subtitle: 'Gestisci qui i tuoi eventi.',
    my_credits: 'I miei crediti',
    create_new_event: '+ Nuovo Evento',
    no_events: 'Non hai ancora eventi.',
    manage: 'Gestisci',
    download: 'Scarica',
    guests_tab: '📋 Ospiti',
    photos_tab: '📸 Galleria',
    logout: 'Esci',
    edit: 'Modifica',
    delete: 'Elimina',
    loading: 'Caricamento...',
    confirm_delete: 'Sei sicuro di voler eliminare?'
  },
  ru: {
    name: 'Русский',
    dashboard_title: 'Панель Cereget',
    dashboard_subtitle: 'Управляйте событиями здесь.',
    my_credits: 'Мои кредиты',
    create_new_event: '+ Создать',
    no_events: 'У вас пока нет событий.',
    manage: 'Управлять',
    download: 'Скачать',
    guests_tab: '📋 Гости',
    photos_tab: '📸 Галерея',
    logout: 'Выйти',
    edit: 'Изменить',
    delete: 'Удалить',
    loading: 'Загрузка...',
    confirm_delete: 'Вы уверены, что хотите удалить?'
  },
  ar: {
    name: 'العربية',
    dashboard_title: 'لوحة تحكم Cereget',
    dashboard_subtitle: 'إدارة الأحداث الخاصة بك هنا.',
    my_credits: 'رصيدي',
    create_new_event: '+ حدث جديد',
    no_events: 'ليس لديك أحداث بعد.',
    manage: 'إدارة',
    download: 'تحميل',
    guests_tab: '📋 الضيوف',
    photos_tab: '📸 المعرض',
    logout: 'خروج',
    edit: 'تعديل',
    delete: 'حذف',
    loading: 'جار التحميل...',
    confirm_delete: 'هل أنت متأكد أنك تريد الحذف؟'
  }
};

// 2. YENİ TİP TANIMI (8 DİL)
export type Language = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru' | 'ar';
export const languagesList = Object.keys(translations) as Language[]; // Dropdown için liste

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['tr']) => string;
  availableLanguages: typeof translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 3. PROVIDER
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('tr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('cereget-lang') as Language;
    
    if (savedLang && translations[savedLang]) {
      setLanguageState(savedLang);
    } else {
      // Tarayıcı dilini algıla (örn: 'fr-FR' -> 'fr')
      const browserCode = navigator.language.split('-')[0] as Language;
      // Eğer tarayıcı dili bizde varsa onu yap, yoksa İngilizce yap
      if (translations[browserCode]) {
        setLanguageState(browserCode);
      } else {
        setLanguageState('en');
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('cereget-lang', lang);
    
    // Arapça seçilirse sayfayı sağdan sola (RTL) yap
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = lang;
    }
  };

  const t = (key: keyof typeof translations['tr']) => {
    return translations[language][key] || key;
  };

  if (!mounted) {
    return <div className="p-10 text-center text-gray-400">...</div>; 
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages: translations }}>
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