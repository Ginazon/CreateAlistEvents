'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. SÖZLÜK (Şimdilik Sadece TR ve EN - Hata Çıkarmaması İçin)
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
  }
};

// 2. TİP TANIMLAMASI (Sadece TR ve EN)
export type LangType = 'tr' | 'en'; 

interface I18nContextType {
  language: LangType;
  setLanguage: (lang: LangType) => void;
  t: (key: keyof typeof dictionary['tr']) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// 3. PROVIDER
export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<LangType>('tr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cereget-lang') as LangType;
      // Güvenli kontrol: Kayıtlı dil bizim sözlükte var mı?
      if (saved && (saved === 'tr' || saved === 'en')) {
        setLanguageState(saved);
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

  if (!mounted) return <div className="min-h-screen bg-white"/>; 

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation error');
  return context;
};