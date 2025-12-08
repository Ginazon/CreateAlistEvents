'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// --- 1. SÖZLÜK (8 DİL & TÜM SAYFALAR) ---
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
    
    // CREATE PAGE (TASARIM)
    design_studio_title: 'Tasarım Stüdyosu',
    edit_event_title: 'Etkinliği Düzenle',
    publish_btn: 'Yayınla (-1 Kredi)',
    save_changes_btn: 'Değişiklikleri Kaydet',
    section_images: '1. Görseller',
    label_cover: 'Kapak Görseli',
    label_main: 'Ana Görsel (Opsiyonel)',
    section_content: '2. İçerik & Yazı',
    label_title: 'Başlık',
    label_message: 'Davet Mesajı',
    section_details: '3. Tarih & Mekan',
    section_color: '4. Tema Rengi',
    section_form: '5. Kayıt Formu Soruları',
    add_question_btn: '+ Soru Ekle',
    locked_fields: '🔒 Standart Alanlar (Otomatik)',
    question_placeholder: 'Sorunuzu yazın (Örn: Menü Tercihi)',
    option_placeholder: 'Seçenekleri virgülle ayırın',
    required_checkbox: 'Zorunlu'
  },
  en: {
    loading: 'Loading...', save: 'Save', cancel: 'Cancel', edit: 'Edit', delete: 'Delete', logout: 'Log Out', confirm_delete: 'Are you sure?',
    dashboard_title: 'Cereget Dashboard', dashboard_subtitle: 'Manage your events here.', my_credits: 'My Credits', create_new_event: '+ New Event', no_events: 'No events yet.', manage: 'Manage', download: 'Download', guests_tab: '📋 Guest List', photos_tab: '📸 Gallery',
    guest_status: 'Guest Status', total: 'Total', invite_message: 'Invite Message', save_template: 'Save', edit_template: 'Edit', add_guest_title: 'Add New Guest', name_label: 'FULL NAME', method_label: 'METHOD', phone_label: 'PHONE', email_label: 'EMAIL', add_btn: 'Add', list_empty: 'List is empty.',
    landing_hero_title: 'Turn Invitations into a Live Social Network.', landing_hero_desc: 'Say goodbye to paper. Smart invites with QR codes.', landing_cta_button: 'View Packages →', landing_login: 'Admin Login', landing_buy: 'Buy Now', feature_1_title: 'Live Design', feature_1_desc: 'Edit instantly with mobile preview.', feature_2_title: 'Social Gallery', feature_2_desc: 'Guests can upload and like photos.', feature_3_title: 'QR Code', feature_3_desc: 'High quality code for print.', feature_4_title: 'RSVP Management', feature_4_desc: 'Smart invites via WhatsApp and Email.', pricing_title: 'Ready?', pricing_desc: 'Choose the package that suits you.', price_starter: 'Starter', price_premium: 'Unlimited', price_trial: 'Trial',
    design_studio_title: 'Design Studio', edit_event_title: 'Edit Event', publish_btn: 'Publish (-1 Credit)', save_changes_btn: 'Save Changes', section_images: '1. Images', label_cover: 'Cover Image', label_main: 'Main Image (Optional)', section_content: '2. Content & Typography', label_title: 'Title', label_message: 'Message', section_details: '3. Date & Location', section_color: '4. Theme Color', section_form: '5. RSVP Form Questions', add_question_btn: '+ Add Question', locked_fields: '🔒 Standard Fields (Auto)', question_placeholder: 'Type your question...', option_placeholder: 'Separate options with comma', required_checkbox: 'Required'
  },
  de: {
    loading: 'Laden...', save: 'Speichern', cancel: 'Abbrechen', edit: 'Bearbeiten', delete: 'Löschen', logout: 'Abmelden', confirm_delete: 'Löschen?',
    dashboard_title: 'Dashboard', dashboard_subtitle: 'Verwalten Sie Ihre Events.', my_credits: 'Credits', create_new_event: '+ Neu', no_events: 'Keine Events.', manage: 'Verwalten', download: 'Laden', guests_tab: '📋 Gäste', photos_tab: '📸 Galerie',
    guest_status: 'Status', total: 'Gesamt', invite_message: 'Nachricht', save_template: 'Speichern', edit_template: 'Bearbeiten', add_guest_title: 'Gast hinzufügen', name_label: 'NAME', method_label: 'METHODE', phone_label: 'FON', email_label: 'MAIL', add_btn: 'Add', list_empty: 'Leer.',
    landing_hero_title: 'Verwandeln Sie Einladungen in ein soziales Netzwerk.', landing_hero_desc: 'Smarte Einladungen mit QR-Codes.', landing_cta_button: 'Pakete ansehen →', landing_login: 'Admin Login', landing_buy: 'Kaufen', feature_1_title: 'Live Design', feature_1_desc: 'Sofortige Vorschau.', feature_2_title: 'Soziale Galerie', feature_2_desc: 'Gäste laden Fotos hoch.', feature_3_title: 'QR Code', feature_3_desc: 'Druckqualität.', feature_4_title: 'RSVP', feature_4_desc: 'WhatsApp & Email.', pricing_title: 'Bereit?', pricing_desc: 'Wähle dein Paket.', price_starter: 'Starter', price_premium: 'Unbegrenzt', price_trial: 'Test',
    design_studio_title: 'Design Studio', edit_event_title: 'Event bearbeiten', publish_btn: 'Veröffentlichen', save_changes_btn: 'Speichern', section_images: '1. Bilder', label_cover: 'Titelbild', label_main: 'Hauptbild', section_content: '2. Inhalt', label_title: 'Titel', label_message: 'Nachricht', section_details: '3. Details', section_color: '4. Farbe', section_form: '5. Formularfragen', add_question_btn: '+ Frage', locked_fields: '🔒 Standardfelder', question_placeholder: 'Frage...', option_placeholder: 'Optionen...', required_checkbox: 'Pflicht'
  },
  fr: {
    loading: 'Chargement...', save: 'Enregistrer', cancel: 'Annuler', edit: 'Modifier', delete: 'Supprimer', logout: 'Déconnexion', confirm_delete: 'Supprimer ?',
    dashboard_title: 'Tableau de Bord', dashboard_subtitle: 'Gérez vos événements.', my_credits: 'Crédits', create_new_event: '+ Nouveau', no_events: 'Aucun événement.', manage: 'Gérer', download: 'Télécharger', guests_tab: '📋 Invités', photos_tab: '📸 Galerie',
    guest_status: 'Statut', total: 'Total', invite_message: 'Message', save_template: 'Sauver', edit_template: 'Modifier', add_guest_title: 'Ajouter', name_label: 'NOM', method_label: 'MÉTHODE', phone_label: 'TÉL', email_label: 'EMAIL', add_btn: 'Ajouter', list_empty: 'Vide.',
    landing_hero_title: 'Transformez les invitations en réseau social.', landing_hero_desc: 'Invitations intelligentes avec QR codes.', landing_cta_button: 'Voir les forfaits →', landing_login: 'Connexion Admin', landing_buy: 'Acheter', feature_1_title: 'Design Live', feature_1_desc: 'Aperçu instantané.', feature_2_title: 'Galerie Sociale', feature_2_desc: 'Partage de photos.', feature_3_title: 'Code QR', feature_3_desc: 'Haute qualité.', feature_4_title: 'Gestion RSVP', feature_4_desc: 'WhatsApp & Email.', pricing_title: 'Prêt ?', pricing_desc: 'Choisissez votre forfait.', price_starter: 'Débutant', price_premium: 'Illimité', price_trial: 'Essai',
    design_studio_title: 'Studio de Création', edit_event_title: 'Modifier l\'événement', publish_btn: 'Publier', save_changes_btn: 'Enregistrer', section_images: '1. Images', label_cover: 'Couverture', label_main: 'Image Principale', section_content: '2. Contenu', label_title: 'Titre', label_message: 'Message', section_details: '3. Détails', section_color: '4. Couleur', section_form: '5. Questions', add_question_btn: '+ Question', locked_fields: '🔒 Champs Standards', question_placeholder: 'Question...', option_placeholder: 'Options...', required_checkbox: 'Obligatoire'
  },
  es: {
    loading: 'Cargando...', save: 'Guardar', cancel: 'Cancelar', edit: 'Editar', delete: 'Eliminar', logout: 'Salir', confirm_delete: '¿Eliminar?',
    dashboard_title: 'Panel', dashboard_subtitle: 'Gestiona eventos.', my_credits: 'Créditos', create_new_event: '+ Nuevo', no_events: 'Sin eventos.', manage: 'Gestionar', download: 'Descargar', guests_tab: '📋 Invitados', photos_tab: '📸 Galería',
    guest_status: 'Estado', total: 'Total', invite_message: 'Mensaje', save_template: 'Guardar', edit_template: 'Editar', add_guest_title: 'Añadir', name_label: 'NOMBRE', method_label: 'MÉTODO', phone_label: 'TEL', email_label: 'EMAIL', add_btn: 'Añadir', list_empty: 'Vacía.',
    landing_hero_title: 'Convierte invitaciones en una red social.', landing_hero_desc: 'Invitaciones inteligentes con códigos QR.', landing_cta_button: 'Ver Paquetes →', landing_login: 'Acceso Admin', landing_buy: 'Comprar', feature_1_title: 'Diseño en Vivo', feature_1_desc: 'Vista previa instantánea.', feature_2_title: 'Galería Social', feature_2_desc: 'Compartir fotos.', feature_3_title: 'Código QR', feature_3_desc: 'Alta calidad.', feature_4_title: 'Gestión RSVP', feature_4_desc: 'WhatsApp y Email.', pricing_title: '¿Listo?', pricing_desc: 'Elige tu paquete.', price_starter: 'Inicial', price_premium: 'Ilimitado', price_trial: 'Prueba',
    design_studio_title: 'Estudio de Diseño', edit_event_title: 'Editar Evento', publish_btn: 'Publicar', save_changes_btn: 'Guardar', section_images: '1. Imágenes', label_cover: 'Portada', label_main: 'Imagen Principal', section_content: '2. Contenido', label_title: 'Título', label_message: 'Mensaje', section_details: '3. Detalles', section_color: '4. Color', section_form: '5. Preguntas', add_question_btn: '+ Pregunta', locked_fields: '🔒 Campos Estándar', question_placeholder: 'Pregunta...', option_placeholder: 'Opciones...', required_checkbox: 'Obligatorio'
  },
  it: {
    loading: 'Caricamento...', save: 'Salva', cancel: 'Annulla', edit: 'Modifica', delete: 'Elimina', logout: 'Esci', confirm_delete: 'Eliminare?',
    dashboard_title: 'Dashboard', dashboard_subtitle: 'Gestisci eventi.', my_credits: 'Crediti', create_new_event: '+ Nuovo', no_events: 'Nessun evento.', manage: 'Gestisci', download: 'Scarica', guests_tab: '📋 Ospiti', photos_tab: '📸 Galleria',
    guest_status: 'Stato', total: 'Totale', invite_message: 'Messaggio', save_template: 'Salva', edit_template: 'Modifica', add_guest_title: 'Aggiungi', name_label: 'NOME', method_label: 'METODO', phone_label: 'TEL', email_label: 'EMAIL', add_btn: 'Aggiungi', list_empty: 'Vuota.',
    landing_hero_title: 'Trasforma gli inviti in un social network.', landing_hero_desc: 'Inviti intelligenti con codici QR.', landing_cta_button: 'Vedi Pacchetti →', landing_login: 'Login Admin', landing_buy: 'Acquista', feature_1_title: 'Design Live', feature_1_desc: 'Anteprima istantanea.', feature_2_title: 'Galleria Social', feature_2_desc: 'Condividi foto.', feature_3_title: 'Codice QR', feature_3_desc: 'Alta qualità.', feature_4_title: 'Gestione RSVP', feature_4_desc: 'WhatsApp e Email.', pricing_title: 'Pronto?', pricing_desc: 'Scegli il pacchetto.', price_starter: 'Starter', price_premium: 'Illimitato', price_trial: 'Prova',
    design_studio_title: 'Studio di Design', edit_event_title: 'Modifica Evento', publish_btn: 'Pubblica', save_changes_btn: 'Salva', section_images: '1. Immagini', label_cover: 'Copertina', label_main: 'Immagine Principale', section_content: '2. Contenuto', label_title: 'Titolo', label_message: 'Messaggio', section_details: '3. Dettagli', section_color: '4. Colore', section_form: '5. Domande', add_question_btn: '+ Domanda', locked_fields: '🔒 Campi Standard', question_placeholder: 'Domanda...', option_placeholder: 'Opzioni...', required_checkbox: 'Obbligatorio'
  },
  ru: {
    loading: 'Загрузка...', save: 'Сохранить', cancel: 'Отмена', edit: 'Изменить', delete: 'Удалить', logout: 'Выйти', confirm_delete: 'Удалить?',
    dashboard_title: 'Панель', dashboard_subtitle: 'Управление.', my_credits: 'Кредиты', create_new_event: '+ Создать', no_events: 'Нет событий.', manage: 'Управлять', download: 'Скачать', guests_tab: '📋 Гости', photos_tab: '📸 Галерея',
    guest_status: 'Статус', total: 'Всего', invite_message: 'Сообщение', save_template: 'Сохранить', edit_template: 'Изменить', add_guest_title: 'Добавить', name_label: 'ИМЯ', method_label: 'МЕТОД', phone_label: 'ТЕЛ', email_label: 'EMAIL', add_btn: 'Добавить', list_empty: 'Пусто.',
    landing_hero_title: 'Превратите приглашения в соцсеть.', landing_hero_desc: 'Умные приглашения с QR-кодами.', landing_cta_button: 'Пакеты →', landing_login: 'Вход', landing_buy: 'Купить', feature_1_title: 'Живой дизайн', feature_1_desc: 'Мгновенный предпросмотр.', feature_2_title: 'Социальная галерея', feature_2_desc: 'Загрузка фото.', feature_3_title: 'QR-код', feature_3_desc: 'Высокое качество.', feature_4_title: 'Управление RSVP', feature_4_desc: 'WhatsApp и Email.', pricing_title: 'Готовы?', pricing_desc: 'Выберите пакет.', price_starter: 'Старт', price_premium: 'Безлимит', price_trial: 'Проба',
    design_studio_title: 'Студия дизайна', edit_event_title: 'Изменить событие', publish_btn: 'Опубликовать', save_changes_btn: 'Сохранить', section_images: '1. Изображения', label_cover: 'Обложка', label_main: 'Главное фото', section_content: '2. Контент', label_title: 'Заголовок', label_message: 'Сообщение', section_details: '3. Детали', section_color: '4. Цвет', section_form: '5. Вопросы', add_question_btn: '+ Вопрос', locked_fields: '🔒 Стандартные поля', question_placeholder: 'Вопрос...', option_placeholder: 'Варианты...', required_checkbox: 'Обязательно'
  },
  ar: {
    loading: 'تحميل...', save: 'حفظ', cancel: 'إلغاء', edit: 'تعديل', delete: 'حذف', logout: 'خروج', confirm_delete: 'حذف؟',
    dashboard_title: 'لوحة التحكم', dashboard_subtitle: 'إدارة الأحداث.', my_credits: 'رصيد', create_new_event: '+ جديد', no_events: 'لا توجد أحداث.', manage: 'إدارة', download: 'تحميل', guests_tab: '📋 الضيوف', photos_tab: '📸 المعرض',
    guest_status: 'الحالة', total: 'مجموع', invite_message: 'رسالة', save_template: 'حفظ', edit_template: 'تعديل', add_guest_title: 'إضافة', name_label: 'الاسم', method_label: 'طريقة', phone_label: 'هاتف', email_label: 'بريد', add_btn: 'إضافة', list_empty: 'فارغة.',
    landing_hero_title: 'حول الدعوات إلى شبكة اجتماعية.', landing_hero_desc: 'دعوات ذكية مع رموز QR.', landing_cta_button: 'عرض الباقات →', landing_login: 'دخول المسؤول', landing_buy: 'شراء', feature_1_title: 'تصميم مباشر', feature_1_desc: 'معاينة فورية.', feature_2_title: 'معرض اجتماعي', feature_2_desc: 'تحميل الصور.', feature_3_title: 'رمز QR', feature_3_desc: 'جودة عالية.', feature_4_title: 'إدارة الدعوات', feature_4_desc: 'واتساب والبريد.', pricing_title: 'جاهز؟', pricing_desc: 'اختر الباقة.', price_starter: 'بداية', price_premium: 'غير محدود', price_trial: 'تجربة',
    design_studio_title: 'استوديو التصميم', edit_event_title: 'تعديل الحدث', publish_btn: 'نشر', save_changes_btn: 'حفظ', section_images: '1. الصور', label_cover: 'الغلاف', label_main: 'الصورة الرئيسية', section_content: '2. المحتوى', label_title: 'العنوان', label_message: 'الرسالة', section_details: '3. التفاصيل', section_color: '4. اللون', section_form: '5. أسئلة', add_question_btn: '+ سؤال', locked_fields: '🔒 حقول قياسية', question_placeholder: 'سؤال...', option_placeholder: 'خيارات...', required_checkbox: 'مطلوب'
  }
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
    return dictionary[language][key] || key;
  };

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