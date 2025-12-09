'use client'

import { useState, useEffect, createContext, useContext } from 'react'

// Desteklenen diller
export type LangType = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru' | 'ar'

// 1. Sözlük (Dictionary)
export const dictionary = {
  tr: {
    loading: 'Yükleniyor...',
    save: 'Kaydet',
    cancel: 'İptal',
    edit: 'Düzenle',
    delete: 'Sil',
    logout: 'Çıkış Yap',
    confirm_delete: 'Bu öğeyi silmek istediğinize emin misiniz?',
    
    // DASHBOARD
    dashboard_title: 'Etkinlik Paneli',
    dashboard_subtitle: 'Etkinliklerini yönet ve davetlilerini takip et.',
    my_credits: 'Kredilerim',
    create_new_event: 'Yeni Etkinlik Oluştur',
    no_events: 'Henüz etkinlik oluşturmadın.',
    manage: 'Yönet',
    download: 'İndir',
    guests_tab: 'Davetliler',
    photos_tab: 'Fotoğraflar',
    
    // DASHBOARD - YENİ SEKMELER
    tab_created: 'Yönettiğim Etkinlikler',
    tab_invited: 'Davet Edildiğim Etkinlikler',
    no_invited_events: 'Henüz bir etkinliğe davet edilmedin.',
    go_to_event: 'Etkinliğe Git ↗',

    // PUBLIC VIEW (DAVETİYE SAYFASI)
    public_not_found: 'Etkinlik bulunamadı veya silinmiş.',
    public_date_label: 'Tarih ve Saat',
    public_location_label: 'Konum',
    public_directions_btn: 'Yol Tarifi Al',
    public_details_title: 'Etkinlik Detayları',
    public_memory_wall: 'Anı Duvarı & Galeri',
    public_gallery_locked: 'Galeri Kilitli 🔒',
    public_gallery_hint: 'Fotoğrafları görmek için lütfen yukarıdaki LCV formunu doldurun veya giriş yapın.',
    public_create_own: 'Bu Davetiyeyi Kendi Etkinliğin İçin Kullan 🎨',
    public_back_dashboard: 'Panele Dön 👑',

    // RSVP (LCV) FORMU
    rsvp_title: 'Lütfen Cevap Verin (LCV)',
    rsvp_name_label: 'Adınız Soyadınız',
    rsvp_name_ph: 'Örn: Ahmet Yılmaz',
    rsvp_email_label: 'E-posta Adresiniz',
    rsvp_email_ph: 'Örn: ahmet@mail.com',
    rsvp_status_label: 'Katılım Durumu',
    rsvp_option_yes: 'Katılıyorum',
    rsvp_option_maybe: 'Belki',
    rsvp_option_no: 'Katılamıyorum',
    rsvp_count_label: 'Kişi Sayısı (+1)',
    rsvp_note_label: 'Etkinlik Sahibine Notunuz',
    rsvp_note_ph: 'Varsa notunuzu buraya yazabilirsiniz...',
    rsvp_btn_send: 'Gönder',
    rsvp_btn_sending: 'Gönderiliyor...',
    rsvp_success_title: 'Teşekkürler!',
    rsvp_success_message: 'LCV kaydınız başarıyla alındı. Aşağıdan panele geçebilirsiniz.',
    rsvp_already_registered: 'Zaten kaydınız mevcut, yönlendiriliyorsunuz...',
    rsvp_error: 'Bir hata oluştu',

    // FOTOĞRAF GALERİSİ
    image_upload_btn: 'Fotoğraf Ekle',
    no_photos: 'Henüz fotoğraf yok. İlk yükleyen sen ol! 📸',
    show_all_comments: 'Tüm yorumları gör',
    hide_comments: 'Yorumları gizle',
    comment_placeholder: 'Yorum yaz...',
    post_btn: 'Paylaş',
  },
  en: {
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    logout: 'Log Out',
    confirm_delete: 'Are you sure you want to delete this item?',

    // DASHBOARD
    dashboard_title: 'Event Dashboard',
    dashboard_subtitle: 'Manage your events and track guests.',
    my_credits: 'My Credits',
    create_new_event: 'Create New Event',
    no_events: 'You haven\'t created any events yet.',
    manage: 'Manage',
    download: 'Download',
    guests_tab: 'Guests',
    photos_tab: 'Photos',

    // DASHBOARD - NEW TABS
    tab_created: 'Events I Manage',
    tab_invited: 'Events I am Invited To',
    no_invited_events: 'You haven\'t been invited to any events yet.',
    go_to_event: 'Go to Event ↗',

    // PUBLIC VIEW
    public_not_found: 'Event not found.',
    public_date_label: 'Date & Time',
    public_location_label: 'Location',
    public_directions_btn: 'Get Directions',
    public_details_title: 'Event Details',
    public_memory_wall: 'Memory Wall & Gallery',
    public_gallery_locked: 'Gallery Locked 🔒',
    public_gallery_hint: 'Please fill out the RSVP form above or login to view photos.',
    public_create_own: 'Create Your Own Event Like This 🎨',
    public_back_dashboard: 'Back to Dashboard 👑',

    // RSVP FORM
    rsvp_title: 'RSVP',
    rsvp_name_label: 'Full Name',
    rsvp_name_ph: 'Ex: John Doe',
    rsvp_email_label: 'Email Address',
    rsvp_email_ph: 'Ex: john@mail.com',
    rsvp_status_label: 'Status',
    rsvp_option_yes: 'Going',
    rsvp_option_maybe: 'Maybe',
    rsvp_option_no: 'Not Going',
    rsvp_count_label: 'Guests (+1)',
    rsvp_note_label: 'Note to Host',
    rsvp_note_ph: 'Any dietary restrictions or notes...',
    rsvp_btn_send: 'Submit RSVP',
    rsvp_btn_sending: 'Sending...',
    rsvp_success_title: 'Thank You!',
    rsvp_success_message: 'Your RSVP has been received successfully.',
    rsvp_already_registered: 'You are already registered, redirecting...',
    rsvp_error: 'An error occurred',

    // GALLERY
    image_upload_btn: 'Add Photo',
    no_photos: 'No photos yet. Be the first! 📸',
    show_all_comments: 'View all comments',
    hide_comments: 'Hide comments',
    comment_placeholder: 'Write a comment...',
    post_btn: 'Post',
  }
  // Diğer diller için (DE, FR vb.) buraya benzer bloklar ekleyebilirsin.
  // Şimdilik hata vermemesi için TR ve EN tam olması yeterli.
};

// 2. Context Oluşturma
const TranslationContext = createContext<any>(null)

// 3. Provider Bileşeni
export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<LangType>('tr') // Varsayılan TR

  // t fonksiyonu: Anahtar (key) alır, seçili dildeki karşılığını döner
  const t = (key: string) => {
    // @ts-ignore
    return dictionary[language][key] || key 
  }

  return (
    <TranslationContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  )
}

// 4. Hook
export const useTranslation = () => useContext(TranslationContext)