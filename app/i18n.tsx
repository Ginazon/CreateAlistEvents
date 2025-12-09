'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. TEMİZLENMİŞ SÖZLÜK
export const dictionary = {
  tr: {
    loading: 'Yükleniyor...', save: 'Kaydet', cancel: 'İptal', edit: 'Düzenle', delete: 'Sil', logout: 'Çıkış', confirm_delete: 'Silmek istediğine emin misin?',
    dashboard_title: 'Cereget Yönetim Paneli', dashboard_subtitle: 'Etkinliklerini buradan yönet.', my_credits: 'Kredilerim', create_new_event: '+ Yeni Etkinlik', no_events: 'Henüz hiç etkinliğin yok.', manage: 'Yönet', download: 'İndir', guests_tab: '📋 Davetliler', photos_tab: '📸 Galeri',
    
    // EXPORT
    export_btn: 'Excel İndir 📥',
    export_pdf_btn: 'PDF İndir 📄',
    
    // PDF BAŞLIKLARI
    pdf_header_identity: 'KİMLİK BİLGİLERİ', pdf_header_contact: 'İLETİŞİM BİLGİLERİ', pdf_header_details: 'DETAYLAR & CEVAPLAR',
    pdf_label_name: 'AD', pdf_label_status: 'DURUM', pdf_label_count: 'KİŞİ', pdf_label_phone: 'TEL', pdf_label_email: 'MAIL', pdf_label_method: 'YÖNTEM', pdf_label_note: 'NOT',

    guest_status: 'Davetli Durumu', total: 'Toplam', invite_message: 'Davet Mesajı', save_template: 'Kaydet', edit_template: 'Düzenle', add_guest_title: 'Yeni Davetli Ekle', name_label: 'AD SOYAD', method_label: 'YÖNTEM', phone_label: 'TELEFON', email_label: 'E-POSTA', add_btn: 'Ekle', list_empty: 'Liste boş.',
    col_name: 'İsim', col_contact: 'İletişim', col_status: 'Durum', col_count: '+Kişi', col_note: 'Not', col_invite: 'Davet', col_action: 'İşlem',
    
    // DETAY PENCERESİ
    modal_details_title: 'Misafir Cevapları', modal_no_response: 'Bu misafir özel sorulara cevap vermemiş.', modal_close_btn: 'Kapat', view_details_btn: 'Cevapları Gör',

    landing_hero_title: 'Davetiyeyi, Canlı Bir Sosyal Ağ\'a Çevirin.', landing_hero_desc: 'Tek kullanımlık kağıtlara veda edin. QR kodlu, canlı galerili, akıllı davetiyeler.', landing_cta_button: 'Paketleri İncele →', landing_login: 'Admin Girişi', landing_buy: 'Satın Al', feature_1_title: 'Canlı Tasarım', feature_1_desc: 'Telefonda anlık önizleme ile düzenleyin.', feature_2_title: 'Sosyal Galeri', feature_2_desc: 'Misafirleriniz fotoğraf yüklesin ve beğensin.', feature_3_title: 'QR Kod', feature_3_desc: 'Davetiyeye basılabilir yüksek kalite kod.', feature_4_title: 'LCV Yönetimi', feature_4_desc: 'WhatsApp ve Email ile akıllı davet gönderimi.', pricing_title: 'Hazır mısın?', pricing_desc: 'İhtiyacına uygun paketi seç.', price_starter: 'Başlangıç', price_premium: 'Sınırsız', price_trial: 'Deneme',
    design_studio_title: 'Tasarım Stüdyosu', edit_event_title: 'Etkinliği Düzenle', publish_btn: 'Yayınla (-1 Kredi)', save_changes_btn: 'Değişiklikleri Kaydet', section_images: '1. Görseller', label_cover: 'Kapak Görseli', label_main: 'Ana Görsel (Opsiyonel)', file_btn_label: 'Görsel Seç', file_no_file: 'Dosya seçilmedi', section_content: '2. İçerik & Yazı', label_title: 'Başlık', label_message: 'Davet Mesajı', section_details: '3. Tarih & Mekan', label_date: 'Tarih', label_location_name: 'Mekan Adı', label_location_url: 'Harita Linki', section_color: '4. Tema Rengi', section_form: '5. Kayıt Formu Soruları', add_question_btn: '+ Soru Ekle', locked_fields: '🔒 Standart Alanlar (Otomatik)', question_placeholder: 'Sorunuzu yazın (Örn: Menü Tercihi)', option_placeholder: 'Seçenekleri virgülle ayırın', required_checkbox: 'Zorunlu',
    section_extra: '6. Detaylar & Akış', add_timeline_btn: '+ Akış Ekle', add_note_btn: '+ Not Ekle', add_link_btn: '+ Link Ekle', timeline_time_ph: 'Saat (19:00)', timeline_title_ph: 'Olay (Nikah)', note_title_ph: 'Başlık (Örn: Çocuklar)', note_desc_ph: 'Açıklama...', link_title_ph: 'Buton Yazısı', link_url_ph: 'https://...', image_upload_btn: 'Resim Ekle',
    preview_cover_placeholder: 'Kapak', preview_main_placeholder: 'Görsel', preview_title_placeholder: 'Başlık', preview_location_placeholder: 'Konum', preview_map_btn: 'Yol Tarifi Al', preview_rsvp_title: 'LCV Formu Önizleme', preview_ph_name: 'Ad Soyad', preview_ph_email: 'E-Posta', preview_ph_status: 'Katılım Durumu', preview_ph_count: '+ Kişi Sayısı', preview_ph_note: 'Notunuz...', preview_submit_btn: 'Gönder',
    public_date_label: '📅 Tarih', public_location_label: '📍 Konum', public_directions_btn: 'Yol Tarifi Al 🗺️', public_details_title: 'Etkinlik Detayları', public_memory_wall: '📸 Anı Duvarı', public_gallery_locked: 'Galeri Kilitli', public_gallery_hint: 'Görmek için yukarıdan giriş yapın.', public_back_dashboard: "← Dashboard'a Dön", public_create_own: "Cereget ile kendi davetiyeni oluştur", public_not_found: "Bulunamadı",
    rsvp_title: 'LCV Formu', rsvp_name_label: 'Ad Soyad', rsvp_name_ph: 'İsminiz', rsvp_email_label: 'E-Posta', rsvp_email_ph: 'ornek@email.com', rsvp_status_label: 'Durum', rsvp_option_yes: 'Katılıyorum 🥳', rsvp_option_no: 'Katılamıyorum 😔', rsvp_count_label: '+ Kişi Sayısı', rsvp_note_label: 'Notunuz (Opsiyonel)', rsvp_note_ph: 'Mesajınız...', rsvp_btn_send: 'Cevabı Gönder', rsvp_btn_sending: 'Gönderiliyor...', rsvp_success_title: 'Kaydınız Alındı!', rsvp_success_msg: 'Teşekkürler, yanıtın bize ulaştı.', rsvp_success_hint: 'Aşağıdaki galeriye fotoğraf yükleyebilirsin.',
    // GALERİ İÇİN YENİ:
    show_all_comments: 'Tüm yorumları gör',
    hide_comments: 'Yorumları gizle',
    comment_placeholder: 'Yorum yaz...',
    post_btn: 'Paylaş',
    no_photos: 'Henüz fotoğraf yok. İlk yükleyen sen ol! 📸',
    tab_created: 'Yönettiğim Etkinlikler',
    tab_invited: 'Davet Edildiğim Etkinlikler',
    invited_by: 'Davet Eden:',
    go_to_event: 'Etkinliğe Git ↗',
    no_invited_events: 'Henüz bir etkinliğe davet edilmedin.',
    // RSVP (LCV) FORMU İÇİN EKLENECEKLER:
    
    rsvp_success_message: 'LCV kaydınız başarıyla alındı. Aşağıdan panele geçebilirsiniz.',
    rsvp_already_registered: 'Zaten kaydınız mevcut, yönlendiriliyorsunuz...',
    rsvp_error: 'Bir hata oluştu',
    rsvp_option_maybe: 'Belki',
    
  },
  en: {
    loading: 'Loading...', save: 'Save', cancel: 'Cancel', edit: 'Edit', delete: 'Delete', logout: 'Log Out', confirm_delete: 'Are you sure?',
    dashboard_title: 'Cereget Dashboard', dashboard_subtitle: 'Manage your events here.', my_credits: 'My Credits', create_new_event: '+ New Event', no_events: 'No events yet.', manage: 'Manage', download: 'Download', guests_tab: '📋 Guest List', photos_tab: '📸 Gallery',
    
    export_btn: 'Download Excel 📥',
    export_pdf_btn: 'Download PDF 📄',

    pdf_header_identity: 'IDENTITY INFO', pdf_header_contact: 'CONTACT INFO', pdf_header_details: 'DETAILS & ANSWERS',
    pdf_label_name: 'NAME', pdf_label_status: 'STATUS', pdf_label_count: 'COUNT', pdf_label_phone: 'PHONE', pdf_label_email: 'MAIL', pdf_label_method: 'METHOD', pdf_label_note: 'NOTE',

    guest_status: 'Guest Status', total: 'Total', invite_message: 'Invite Message', save_template: 'Save', edit_template: 'Edit', add_guest_title: 'Add New Guest', name_label: 'FULL NAME', method_label: 'METHOD', phone_label: 'PHONE', email_label: 'EMAIL', add_btn: 'Add', list_empty: 'List is empty.',
    col_name: 'Name', col_contact: 'Contact', col_status: 'Status', col_count: '+Count', col_note: 'Note', col_invite: 'Invite', col_action: 'Action',
    
    modal_details_title: 'Guest Responses', modal_no_response: 'No custom responses.', modal_close_btn: 'Close', view_details_btn: 'View Answers',

    landing_hero_title: 'Turn Invitations into a Live Social Network.', landing_hero_desc: 'Smart invites with QR codes.', landing_cta_button: 'View Packages →', landing_login: 'Admin Login', landing_buy: 'Buy Now', feature_1_title: 'Live Design', feature_1_desc: 'Edit instantly with mobile preview.', feature_2_title: 'Social Gallery', feature_2_desc: 'Guests can upload and like photos.', feature_3_title: 'QR Code', feature_3_desc: 'High quality code for print.', feature_4_title: 'RSVP Management', feature_4_desc: 'Smart invites via WhatsApp and Email.', pricing_title: 'Ready?', pricing_desc: 'Choose package.', price_starter: 'Starter', price_premium: 'Unlimited', price_trial: 'Trial',
    design_studio_title: 'Design Studio', edit_event_title: 'Edit Event', publish_btn: 'Publish', save_changes_btn: 'Save Changes', section_images: '1. Images', label_cover: 'Cover', label_main: 'Main Image', file_btn_label: 'Choose Image', file_no_file: 'No file', section_content: '2. Content', label_title: 'Title', label_message: 'Message', section_details: '3. Date & Location', label_date: 'Date', label_location_name: 'Venue', label_location_url: 'Map Link', section_color: '4. Theme Color', section_form: '5. Questions', add_question_btn: '+ Add', locked_fields: '🔒 Standard', question_placeholder: 'Question...', option_placeholder: 'Options...', required_checkbox: 'Required',
    section_extra: '6. Details & Timeline', add_timeline_btn: '+ Timeline', add_note_btn: '+ Note', add_link_btn: '+ Link', timeline_time_ph: 'Time', timeline_title_ph: 'Event', note_title_ph: 'Title', note_desc_ph: 'Description...', link_title_ph: 'Button Text', link_url_ph: 'URL', image_upload_btn: 'Add Image',
    preview_cover_placeholder: 'Cover', preview_main_placeholder: 'Image', preview_title_placeholder: 'Title', preview_location_placeholder: 'Location', preview_map_btn: 'Directions', preview_rsvp_title: 'RSVP Preview', preview_ph_name: 'Full Name', preview_ph_email: 'Email', preview_ph_status: 'Status', preview_ph_count: '+ Guests', preview_ph_note: 'Note...', preview_submit_btn: 'Submit',
    public_date_label: '📅 Date', public_location_label: '📍 Location', public_directions_btn: 'Get Directions 🗺️', public_details_title: 'Event Details', public_memory_wall: '📸 Memory Wall', public_gallery_locked: 'Gallery Locked', public_gallery_hint: 'Login above.', public_back_dashboard: "← Back", public_create_own: "Create your own", public_not_found: "Not Found",
    rsvp_title: 'RSVP Form', rsvp_name_label: 'Full Name', rsvp_name_ph: 'Your Name', rsvp_email_label: 'Email', rsvp_email_ph: 'email@ex.com', rsvp_status_label: 'Status', rsvp_option_yes: 'Attending 🥳', rsvp_option_no: 'Not Attending 😔', rsvp_count_label: '+ Guests', rsvp_note_label: 'Note', rsvp_note_ph: 'Message...', rsvp_btn_send: 'Send', rsvp_btn_sending: 'Sending...', rsvp_success_title: 'Registered!', rsvp_success_msg: 'Received.', rsvp_success_hint: 'Gallery below.',
    tab_created: 'Events I Manage',
    tab_invited: 'Events I am Invited To',
    invited_by: 'Invited By:',
    go_to_event: 'Go to Event ↗',
    no_invited_events: 'You haven\'t been invited to any events yet.',
    // RSVP FORM ADDITIONS:
    
    rsvp_success_message: 'Your RSVP has been received successfully.',
    rsvp_already_registered: 'You are already registered, redirecting...',
    rsvp_error: 'An error occurred',
    rsvp_option_maybe: 'Belki',
  },
  // (Diğer diller için de aynısını yapabilirsin, şimdilik TR/EN yeterli)
  de: { export_btn: 'Excel', export_pdf_btn: 'PDF', modal_details_title: 'Antworten', modal_close_btn: 'Schließen' } as any,
  fr: { export_btn: 'Excel', export_pdf_btn: 'PDF', modal_details_title: 'Réponses', modal_close_btn: 'Fermer' } as any,
  es: { export_btn: 'Excel', export_pdf_btn: 'PDF', modal_details_title: 'Respuestas', modal_close_btn: 'Cerrar' } as any,
  it: { export_btn: 'Excel', export_pdf_btn: 'PDF', modal_details_title: 'Risposte', modal_close_btn: 'Chiudi' } as any,
  ru: { export_btn: 'Excel', export_pdf_btn: 'PDF', modal_details_title: 'Ответы', modal_close_btn: 'Закрыть' } as any,
  ar: { export_btn: 'Excel', export_pdf_btn: 'PDF', modal_details_title: 'إجابات', modal_close_btn: 'إغلاق' } as any,
  show_all_comments: 'View all comments',
    hide_comments: 'Hide comments',
    comment_placeholder: 'Write a comment...',
    post_btn: 'Post',
    no_photos: 'No photos yet. Be the first! 📸',
    rsvp_option_maybe: 'Maybe',
};

export type LangType = keyof typeof dictionary;
const DEFAULT_LANG: LangType = 'tr';

interface I18nContextType {
  language: LangType;
  setLanguage: (lang: LangType) => void;
  t: (key: keyof typeof dictionary['tr']) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<LangType>(DEFAULT_LANG);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cereget-lang') as LangType;
      if (saved && dictionary[saved]) {
        setLanguageState(saved);
        if(saved === 'ar') document.documentElement.dir = 'rtl';
      } else {
        const browser = navigator.language.split('-')[0] as LangType;
        if (dictionary[browser]) {
            setLanguageState(browser);
            if(browser === 'ar') document.documentElement.dir = 'rtl';
        }
      }
    }
  }, []);

  const setLanguage = (lang: LangType) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cereget-lang', lang);
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  };

  const t = (key: keyof typeof dictionary['tr']) => {
    // @ts-ignore
    return dictionary[language][key] || key;
  };

  if (!mounted) return <div className="min-h-screen bg-gray-50"/>; 

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation must be used within I18nProvider');
  return context;
};