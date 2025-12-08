'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// --- 1. SÖZLÜK (TÜM SİSTEM) ---
export const dictionary = {
  tr: {
    // GENEL
    loading: 'Yükleniyor...',
    save: 'Kaydet',
    cancel: 'İptal',
    edit: 'Düzenle',
    delete: 'Sil',
    logout: 'Çıkış',
    confirm_delete: 'Silmek istediğine emin misin?',
    
    // DASHBOARD
    dashboard_title: 'Cereget Yönetim Paneli',
    dashboard_subtitle: 'Etkinliklerini buradan yönet.',
    my_credits: 'Kredilerim',
    create_new_event: '+ Yeni Etkinlik',
    no_events: 'Henüz hiç etkinliğin yok.',
    manage: 'Yönet',
    download: 'İndir',
    guests_tab: '📋 Davetliler',
    photos_tab: '📸 Galeri',
    
    // GUEST MANAGER
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
    list_empty: 'Liste boş.',

    // LANDING PAGE
    landing_hero_title: 'Davetiyeyi, Canlı Bir Sosyal Ağ\'a Çevirin.',
    landing_hero_desc: 'Tek kullanımlık kağıtlara veda edin. QR kodlu, canlı galerili, akıllı davetiyeler.',
    landing_cta_button: 'Paketleri İncele →',
    landing_login: 'Admin Girişi',
    landing_buy: 'Satın Al',
    feature_1_title: 'Canlı Tasarım',
    feature_1_desc: 'Telefonda anlık önizleme ile düzenleyin.',
    feature_2_title: 'Sosyal Galeri',
    feature_2_desc: 'Misafirleriniz fotoğraf yüklesin ve beğensin.',
    feature_3_title: 'QR Kod',
    feature_3_desc: 'Davetiyeye basılabilir yüksek kalite kod.',
    feature_4_title: 'LCV Yönetimi',
    feature_4_desc: 'WhatsApp ve Email ile akıllı davet gönderimi.',
    pricing_title: 'Hazır mısın?',
    pricing_desc: 'İhtiyacına uygun paketi seç.',
    price_starter: 'Başlangıç',
    price_premium: 'Sınırsız',
    price_trial: 'Deneme',
    
    // CREATE PAGE
    design_studio_title: 'Tasarım Stüdyosu',
    edit_event_title: 'Etkinliği Düzenle',
    publish_btn: 'Yayınla (-1 Kredi)',
    save_changes_btn: 'Değişiklikleri Kaydet',
    section_images: '1. Görseller',
    label_cover: 'Kapak Görseli',
    label_main: 'Ana Görsel (Opsiyonel)',
    file_btn_label: 'Görsel Seç',
    file_no_file: 'Dosya seçilmedi',
    section_content: '2. İçerik & Yazı',
    label_title: 'Başlık',
    label_message: 'Davet Mesajı',
    section_details: '3. Tarih & Mekan',
    label_date: 'Tarih',
    label_location_name: 'Mekan Adı',
    label_location_url: 'Harita Linki',
    section_color: '4. Tema Rengi',
    section_form: '5. Kayıt Formu Soruları',
    add_question_btn: '+ Soru Ekle',
    locked_fields: '🔒 Standart Alanlar (Otomatik)',
    question_placeholder: 'Sorunuzu yazın (Örn: Menü Tercihi)',
    option_placeholder: 'Seçenekleri virgülle ayırın',
    required_checkbox: 'Zorunlu',
    section_extra: '6. Detaylar & Akış',
    add_timeline_btn: '+ Akış Ekle',
    add_note_btn: '+ Not Ekle',
    add_link_btn: '+ Link Ekle',
    timeline_time_ph: 'Saat (19:00)',
    timeline_title_ph: 'Olay (Nikah)',
    note_title_ph: 'Başlık (Örn: Çocuklar)',
    note_desc_ph: 'Açıklama...',
    link_title_ph: 'Buton Yazısı',
    link_url_ph: 'https://...',
    image_upload_btn: 'Resim Ekle',

    // PREVIEW
    preview_cover_placeholder: 'Kapak',
    preview_main_placeholder: 'Görsel',
    preview_title_placeholder: 'Başlık',
    preview_location_placeholder: 'Konum',
    preview_map_btn: 'Yol Tarifi Al',
    preview_rsvp_title: 'LCV Formu Önizleme',
    preview_ph_name: 'Ad Soyad',
    preview_ph_email: 'E-Posta',
    preview_ph_status: 'Katılım Durumu',
    preview_ph_count: '+ Kişi Sayısı',
    preview_ph_note: 'Notunuz...',
    preview_submit_btn: 'Gönder',

    // --- PUBLIC EVENT PAGE (MİSAFİR EKRANI) ---
    public_date_label: '📅 Tarih',
    public_location_label: '📍 Konum',
    public_directions_btn: 'Yol Tarifi Al 🗺️',
    public_details_title: 'Etkinlik Detayları',
    public_memory_wall: '📸 Anı Duvarı',
    public_gallery_locked: 'Galeri Kilitli',
    public_gallery_hint: 'Görmek için yukarıdan giriş yapın.',
    public_back_dashboard: "← Dashboard'a Dön",
    public_create_own: "Cereget ile kendi davetiyeni oluştur",
    public_not_found: "Bulunamadı"
  },
  en: {
    loading: 'Loading...', save: 'Save', cancel: 'Cancel', edit: 'Edit', delete: 'Delete', logout: 'Log Out', confirm_delete: 'Are you sure?',
    dashboard_title: 'Cereget Dashboard', dashboard_subtitle: 'Manage your events here.', my_credits: 'My Credits', create_new_event: '+ New Event', no_events: 'No events yet.', manage: 'Manage', download: 'Download', guests_tab: '📋 Guest List', photos_tab: '📸 Gallery',
    guest_status: 'Guest Status', total: 'Total', invite_message: 'Invite Message', save_template: 'Save', edit_template: 'Edit', add_guest_title: 'Add New Guest', name_label: 'FULL NAME', method_label: 'METHOD', phone_label: 'PHONE', email_label: 'EMAIL', add_btn: 'Add', list_empty: 'List is empty.',
    landing_hero_title: 'Turn Invitations into a Live Social Network.', landing_hero_desc: 'Smart invites with QR codes.', landing_cta_button: 'View Packages →', landing_login: 'Admin Login', landing_buy: 'Buy Now', feature_1_title: 'Live Design', feature_1_desc: 'Edit instantly with mobile preview.', feature_2_title: 'Social Gallery', feature_2_desc: 'Guests can upload and like photos.', feature_3_title: 'QR Code', feature_3_desc: 'High quality code for print.', feature_4_title: 'RSVP Management', feature_4_desc: 'Smart invites via WhatsApp and Email.', pricing_title: 'Ready?', pricing_desc: 'Choose the package that suits you.', price_starter: 'Starter', price_premium: 'Unlimited', price_trial: 'Trial',
    design_studio_title: 'Design Studio', edit_event_title: 'Edit Event', publish_btn: 'Publish (-1 Credit)', save_changes_btn: 'Save Changes', section_images: '1. Images', label_cover: 'Cover Image', label_main: 'Main Image (Optional)', file_btn_label: 'Choose Image', file_no_file: 'No file chosen', section_content: '2. Content & Typography', label_title: 'Title', label_message: 'Message', section_details: '3. Date & Location', label_date: 'Date', label_location_name: 'Venue Name', label_location_url: 'Map Link', section_color: '4. Theme Color', section_form: '5. RSVP Form Questions', add_question_btn: '+ Add Question', locked_fields: '🔒 Standard Fields (Auto)', question_placeholder: 'Type your question...', option_placeholder: 'Separate options with comma', required_checkbox: 'Required',
    section_extra: '6. Details & Timeline', add_timeline_btn: '+ Add Timeline', add_note_btn: '+ Add Note', add_link_btn: '+ Add Link', timeline_time_ph: 'Time (19:00)', timeline_title_ph: 'Event (Dinner)', note_title_ph: 'Title (e.g. Kids)', note_desc_ph: 'Description...', link_title_ph: 'Button Text', link_url_ph: 'https://...', image_upload_btn: 'Add Image',
    preview_cover_placeholder: 'Cover', preview_main_placeholder: 'Image', preview_title_placeholder: 'Title', preview_location_placeholder: 'Location', preview_map_btn: 'Get Directions', preview_rsvp_title: 'RSVP Form Preview', preview_ph_name: 'Full Name', preview_ph_email: 'E-Mail', preview_ph_status: 'Attendance Status', preview_ph_count: '+ Guest Count', preview_ph_note: 'Your Note...', preview_submit_btn: 'Submit',
    
    // PUBLIC PAGE
    public_date_label: '📅 Date', public_location_label: '📍 Location', public_directions_btn: 'Get Directions 🗺️', public_details_title: 'Event Details', public_memory_wall: '📸 Memory Wall', public_gallery_locked: 'Gallery Locked', public_gallery_hint: 'Login above to view.', public_back_dashboard: "← Back to Dashboard", public_create_own: "Create your own with Cereget", public_not_found: "Not Found"
  },
  // (Diğer diller için de aynı anahtarları ekleyebilirsin, yer tutmaması için kısalttım)
  de: {
    loading: 'Laden...', save: 'Speichern', cancel: 'Abbrechen', edit: 'Bearbeiten', delete: 'Löschen', logout: 'Abmelden', confirm_delete: 'Löschen?',
    dashboard_title: 'Dashboard', dashboard_subtitle: 'Verwalten Sie Ihre Events.', my_credits: 'Credits', create_new_event: '+ Neu', no_events: 'Keine Events.', manage: 'Verwalten', download: 'Laden', guests_tab: '📋 Gäste', photos_tab: '📸 Galerie',
    guest_status: 'Status', total: 'Gesamt', invite_message: 'Nachricht', save_template: 'Speichern', edit_template: 'Bearbeiten', add_guest_title: 'Gast hinzufügen', name_label: 'NAME', method_label: 'METHODE', phone_label: 'FON', email_label: 'MAIL', add_btn: 'Add', list_empty: 'Leer.',
    landing_hero_title: 'Smarte Einladungen.', landing_hero_desc: 'Mit QR-Codes.', landing_cta_button: 'Pakete →', landing_login: 'Login', landing_buy: 'Kaufen', feature_1_title: 'Live Design', feature_1_desc: 'Vorschau.', feature_2_title: 'Galerie', feature_2_desc: 'Fotos teilen.', feature_3_title: 'QR Code', feature_3_desc: 'Druckqualität.', feature_4_title: 'RSVP', feature_4_desc: 'WhatsApp & Email.', pricing_title: 'Bereit?', pricing_desc: 'Wähle Paket.', price_starter: 'Start', price_premium: 'Max', price_trial: 'Test',
    design_studio_title: 'Design Studio', edit_event_title: 'Event bearbeiten', publish_btn: 'Veröffentlichen', save_changes_btn: 'Speichern', section_images: '1. Bilder', label_cover: 'Titelbild', label_main: 'Hauptbild', file_btn_label: 'Bild wählen', file_no_file: 'Kein Bild', section_content: '2. Inhalt', label_title: 'Titel', label_message: 'Nachricht', section_details: '3. Details', label_date: 'Datum', label_location_name: 'Ort', label_location_url: 'Karten-URL', section_color: '4. Farbe', section_form: '5. Fragen', add_question_btn: '+ Frage', locked_fields: '🔒 Standardfelder', question_placeholder: 'Frage...', option_placeholder: 'Optionen...', required_checkbox: 'Pflicht',
    section_extra: '6. Details & Zeitplan', add_timeline_btn: '+ Zeitplan', add_note_btn: '+ Notiz', add_link_btn: '+ Link', timeline_time_ph: 'Zeit', timeline_title_ph: 'Ereignis', note_title_ph: 'Titel', note_desc_ph: 'Beschreibung', link_title_ph: 'Button Text', link_url_ph: 'URL', image_upload_btn: 'Bild',
    preview_cover_placeholder: 'Titelbild', preview_main_placeholder: 'Bild', preview_title_placeholder: 'Titel', preview_location_placeholder: 'Ort', preview_map_btn: 'Route', preview_rsvp_title: 'RSVP Vorschau', preview_ph_name: 'Name', preview_ph_email: 'E-Mail', preview_ph_status: 'Status', preview_ph_count: '+ Gäste', preview_ph_note: 'Notiz...', preview_submit_btn: 'Senden',
    public_date_label: '📅 Datum', public_location_label: '📍 Ort', public_directions_btn: 'Route 🗺️', public_details_title: 'Details', public_memory_wall: '📸 Fotowand', public_gallery_locked: 'Galerie Gesperrt', public_gallery_hint: 'Bitte einloggen.', public_back_dashboard: "← Zurück", public_create_own: "Erstelle deine eigene Einladung", public_not_found: "Nicht gefunden"
  },
  // FR, ES, IT, RU, AR da benzer şekilde eklenebilir...
  fr: { public_date_label: '📅 Date', public_location_label: '📍 Lieu', public_directions_btn: 'Itinéraire 🗺️', public_details_title: 'Détails', public_memory_wall: '📸 Mur de Photos', public_gallery_locked: 'Galerie Verrouillée', public_gallery_hint: 'Connectez-vous pour voir.', public_back_dashboard: "← Retour", public_create_own: "Créez la vôtre", public_not_found: "Non trouvé" } as any,
  es: { public_date_label: '📅 Fecha', public_location_label: '📍 Lugar', public_directions_btn: 'Direcciones 🗺️', public_details_title: 'Detalles', public_memory_wall: '📸 Muro de Fotos', public_gallery_locked: 'Galería Bloqueada', public_gallery_hint: 'Inicia sesión para ver.', public_back_dashboard: "← Volver", public_create_own: "Crea la tuya", public_not_found: "No encontrado" } as any,
  it: { public_date_label: '📅 Data', public_location_label: '📍 Luogo', public_directions_btn: 'Indicazioni 🗺️', public_details_title: 'Dettagli', public_memory_wall: '📸 Muro dei Ricordi', public_gallery_locked: 'Galleria Bloccata', public_gallery_hint: 'Accedi per vedere.', public_back_dashboard: "← Indietro", public_create_own: "Crea il tuo", public_not_found: "Non trovato" } as any,
  ru: { public_date_label: '📅 Дата', public_location_label: '📍 Место', public_directions_btn: 'Маршрут 🗺️', public_details_title: 'Детали', public_memory_wall: '📸 Фотостена', public_gallery_locked: 'Галерея закрыта', public_gallery_hint: 'Войдите, чтобы увидеть.', public_back_dashboard: "← Назад", public_create_own: "Создать свое", public_not_found: "Не найдено" } as any,
  ar: { public_date_label: '📅 تاريخ', public_location_label: '📍 موقع', public_directions_btn: 'اتجاهات 🗺️', public_details_title: 'تفاصيل', public_memory_wall: '📸 جدار الذكريات', public_gallery_locked: 'المعرض مغلق', public_gallery_hint: 'سجل الدخول للمشاهدة.', public_back_dashboard: "← رجوع", public_create_own: "اصنع خاصتك", public_not_found: "غير موجود" } as any
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

// --- 3. PROVIDER ---
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
    // @ts-ignore (Bazı dillerde eksik key olabilir diye type check'i gevşetiyoruz)
    return dictionary[language][key] || key;
  };

  if (!mounted) return <div className="min-h-screen bg-gray-50"/>; 

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