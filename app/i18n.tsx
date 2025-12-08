'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// --- 1. SÖZLÜK (TÜM ÇEVİRİLER BURADA) ---
export const dictionary = {
  tr: {
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
    confirm_delete: 'Silmek istediğine emin misin?',
    // Guest Manager
    guest_status: 'Davetli Durumu',
    total: 'Toplam',
    invite_message: 'Davet Mesajı',
    save_template: 'Kaydet',
    edit_template: 'Düzenle',
    add_guest_title: 'Yeni Davetli Ekle',
    name_label: 'AD SOYAD',
    method_label: 'YÖNTEM',
    phone_label: 'TELEFON',
    email_label: 'E-POSTA',
    add_btn: 'Ekle',
    list_empty: 'Liste boş.'
  },
  en: {
    dashboard_title: 'Cereget Dashboard',
    dashboard_subtitle: 'Manage your events here.',
    my_credits: 'My Credits',
    create_new_event: '+ New Event',
    no_events: 'No events yet.',
    manage: 'Manage',
    download: 'Download',
    guests_tab: '📋 Guest List',
    photos_tab: '📸 Gallery',
    logout: 'Log Out',
    edit: 'Edit',
    delete: 'Delete',
    loading: 'Loading...',
    confirm_delete: 'Are you sure?',
    // Guest Manager
    guest_status: 'Guest Status',
    total: 'Total',
    invite_message: 'Invite Message',
    save_template: 'Save',
    edit_template: 'Edit',
    add_guest_title: 'Add New Guest',
    name_label: 'FULL NAME',
    method_label: 'METHOD',
    phone_label: 'PHONE',
    email_label: 'EMAIL',
    add_btn: 'Add',
    list_empty: 'List is empty.'
  },
  de: {
    dashboard_title: 'Dashboard',
    dashboard_subtitle: 'Verwalten Sie Ihre Events.',
    my_credits: 'Credits',
    create_new_event: '+ Neu',
    no_events: 'Keine Events.',
    manage: 'Verwalten',
    download: 'Laden',
    guests_tab: '📋 Gäste',
    photos_tab: '📸 Galerie',
    logout: 'Abmelden',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    loading: 'Laden...',
    confirm_delete: 'Löschen?',
    guest_status: 'Status',
    total: 'Gesamt',
    invite_message: 'Nachricht',
    save_template: 'Speichern',
    edit_template: 'Bearbeiten',
    add_guest_title: 'Gast hinzufügen',
    name_label: 'NAME',
    method_label: 'METHODE',
    phone_label: 'FON',
    email_label: 'MAIL',
    add_btn: 'Hinzufügen',
    list_empty: 'Leer.'
  }
  // İstersen buraya FR, ES, RU ekleyebilirsin...
};

// --- 2. AYARLAR ---
export type LangType = keyof typeof dictionary;
const DEFAULT_LANG: LangType = 'tr';

interface I18nContextType {
  language: LangType;
  setLanguage: (lang: LangType) => void;
  t: (key: keyof typeof dictionary['tr']) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// --- 3. PROVIDER (VERCEL DOSTU) ---
export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<LangType>(DEFAULT_LANG);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // İstemci tarafında yüklendiğini işaretle
    
    // Sadece tarayıcıda çalış (Build hatasını önler)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cereget-lang') as LangType;
      if (saved && dictionary[saved]) {
        setLanguageState(saved);
      } else {
        const browser = navigator.language.split('-')[0] as LangType;
        if (dictionary[browser]) setLanguageState(browser);
      }
    }
  }, []);

  const setLanguage = (lang: LangType) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cereget-lang', lang);
    }
  };

  const t = (key: keyof typeof dictionary['tr']) => {
    return dictionary[language][key] || key;
  };

  // KRİTİK NOKTA: Server-side render sırasında children'ı gösterme (Mismatch hatasını önler)
  if (!mounted) {
    return <div className="min-h-screen bg-gray-50"/>; 
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

// --- 4. HOOK ---
export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
};