'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// --- 1. SÖZLÜK (TÜM DİLLER VE TÜM ÖZELLİKLER) ---
export const dictionary = {
  tr: {
    // GENEL
    loading: 'Yükleniyor...', save: 'Kaydet', cancel: 'İptal', edit: 'Düzenle', delete: 'Sil', logout: 'Çıkış', confirm_delete: 'Silmek istediğine emin misin?',
    
    // DASHBOARD
    dashboard_title: 'Cereget Yönetim Paneli', dashboard_subtitle: 'Etkinliklerini buradan yönet.', my_credits: 'Kredilerim', create_new_event: '+ Yeni Etkinlik', no_events: 'Henüz hiç etkinliğin yok.', manage: 'Yönet', download: 'İndir', guests_tab: '📋 Davetliler', photos_tab: '📸 Galeri',
    export_btn: 'Excel İndir 📥', // YENİ

    // GUEST MANAGER
    guest_status: 'Davetli Durumu', total: 'Toplam', invite_message: 'Davet Mesajı', save_template: 'Kaydet', edit_template: 'Düzenle', add_guest_title: 'Yeni Davetli Ekle', name_label: 'AD SOYAD', method_label: 'YÖNTEM', phone_label: 'TELEFON', email_label: 'E-POSTA', add_btn: 'Ekle', list_empty: 'Liste boş.',
    // TABLO BAŞLIKLARI (YENİ)
    col_name: 'İsim', col_contact: 'İletişim', col_status: 'Durum', col_count: '+Kişi', col_note: 'Not', col_invite: 'Davet', col_action: 'İşlem',

    // LANDING PAGE
    landing_hero_title: 'Davetiyeyi, Canlı Bir Sosyal Ağ\'a Çevirin.', landing_hero_desc: 'Tek kullanımlık kağıtlara veda edin. QR kodlu, canlı galerili, akıllı davetiyeler.', landing_cta_button: 'Paketleri İncele →', landing_login: 'Admin Girişi', landing_buy: 'Satın Al', feature_1_title: 'Canlı Tasarım', feature_1_desc: 'Telefonda anlık önizleme ile düzenleyin.', feature_2_title: 'Sosyal Galeri', feature_2_desc: 'Misafirleriniz fotoğraf yüklesin ve beğensin.', feature_3_title: 'QR Kod', feature_3_desc: 'Davetiyeye basılabilir yüksek kalite kod.', feature_4_title: 'LCV Yönetimi', feature_4_desc: 'WhatsApp ve Email ile akıllı davet gönderimi.', pricing_title: 'Hazır mısın?', pricing_desc: 'İhtiyacına uygun paketi seç.', price_starter: 'Başlangıç', price_premium: 'Sınırsız', price_trial: 'Deneme',
    
    // CREATE PAGE
    design_studio_title: 'Tasarım Stüdyosu', edit_event_title: 'Etkinliği Düzenle', publish_btn: 'Yayınla (-1 Kredi)', save_changes_btn: 'Değişiklikleri Kaydet', section_images: '1. Görseller', label_cover: 'Kapak Görseli', label_main: 'Ana Görsel (Opsiyonel)', file_btn_label: 'Görsel Seç', file_no_file: 'Dosya seçilmedi', section_content: '2. İçerik & Yazı', label_title: 'Başlık', label_message: 'Davet Mesajı', section_details: '3. Tarih & Mekan', label_date: 'Tarih', label_location_name: 'Mekan Adı', label_location_url: 'Harita Linki', section_color: '4. Tema Rengi', section_form: '5. Kayıt Formu Soruları', add_question_btn: '+ Soru Ekle', locked_fields: '🔒 Standart Alanlar (Otomatik)', question_placeholder: 'Sorunuzu yazın (Örn: Menü Tercihi)', option_placeholder: 'Seçenekleri virgülle ayırın', required_checkbox: 'Zorunlu',
    section_extra: '6. Detaylar & Akış', add_timeline_btn: '+ Akış Ekle', add_note_btn: '+ Not Ekle', add_link_btn: '+ Link Ekle', timeline_time_ph: 'Saat (19:00)', timeline_title_ph: 'Olay (Nikah)', note_title_ph: 'Başlık (Örn: Çocuklar)', note_desc_ph: 'Açıklama...', link_title_ph: 'Buton Yazısı', link_url_ph: 'https://...', image_upload_btn: 'Resim Ekle',

    // PREVIEW
    preview_cover_placeholder: 'Kapak', preview_main_placeholder: 'Görsel', preview_title_placeholder: 'Başlık', preview_location_placeholder: 'Konum', preview_map_btn: 'Yol Tarifi Al', preview_rsvp_title: 'LCV Formu Önizleme', preview_ph_name: 'Ad Soyad', preview_ph_email: 'E-Posta', preview_ph_status: 'Katılım Durumu', preview_ph_count: '+ Kişi Sayısı', preview_ph_note: 'Notunuz...', preview_submit_btn: 'Gönder',

    // PUBLIC PAGE
    public_date_label: '📅 Tarih', public_location_label: '📍 Konum', public_directions_btn: 'Yol Tarifi Al 🗺️', public_details_title: 'Etkinlik Detayları', public_memory_wall: '📸 Anı Duvarı', public_gallery_locked: 'Galeri Kilitli', public_gallery_hint: 'Görmek için yukarıdan giriş yapın.', public_back_dashboard: "← Dashboard'a Dön", public_create_own: "Cereget ile kendi davetiyeni oluştur", public_not_found: "Bulunamadı",
    
    // RSVP FORM
    rsvp_title: 'LCV Formu', rsvp_name_label: 'Ad Soyad', rsvp_name_ph: 'İsminiz', rsvp_email_label: 'E-Posta', rsvp_email_ph: 'ornek@email.com', rsvp_status_label: 'Durum', rsvp_option_yes: 'Katılıyorum 🥳', rsvp_option_no: 'Katılamıyorum 😔', rsvp_count_label: '+ Kişi Sayısı', rsvp_note_label: 'Notunuz (Opsiyonel)', rsvp_note_ph: 'Mesajınız...', rsvp_btn_send: 'Cevabı Gönder', rsvp_btn_sending: 'Gönderiliyor...', rsvp_success_title: 'Kaydınız Alındı!', rsvp_success_msg: 'Teşekkürler, yanıtın bize ulaştı.', rsvp_success_hint: 'Aşağıdaki galeriye fotoğraf yükleyebilirsin.',
  // --- YENİ: MİSAFİR DETAY PENCERESİ ---
  modal_details_title: 'Misafir Cevapları',
  modal_no_response: 'Bu misafir özel sorulara cevap vermemiş.',
  modal_close_btn: 'Kapat',
  view_details_btn: 'Cevapları Gör',
},
  en: {
    loading: 'Loading...', save: 'Save', cancel: 'Cancel', edit: 'Edit', delete: 'Delete', logout: 'Log Out', confirm_delete: 'Are you sure?',
    dashboard_title: 'Cereget Dashboard', dashboard_subtitle: 'Manage your events here.', my_credits: 'My Credits', create_new_event: '+ New Event', no_events: 'No events yet.', manage: 'Manage', download: 'Download', guests_tab: '📋 Guest List', photos_tab: '📸 Gallery',
    export_btn: 'Download Excel 📥',
    guest_status: 'Guest Status', total: 'Total', invite_message: 'Invite Message', save_template: 'Save', edit_template: 'Edit', add_guest_title: 'Add New Guest', name_label: 'FULL NAME', method_label: 'METHOD', phone_label: 'PHONE', email_label: 'EMAIL', add_btn: 'Add', list_empty: 'List is empty.',
    col_name: 'Name', col_contact: 'Contact', col_status: 'Status', col_count: '+Count', col_note: 'Note', col_invite: 'Invite', col_action: 'Action',
    landing_hero_title: 'Turn Invitations into a Live Social Network.', landing_hero_desc: 'Smart invites with QR codes.', landing_cta_button: 'View Packages →', landing_login: 'Admin Login', landing_buy: 'Buy Now', feature_1_title: 'Live Design', feature_1_desc: 'Edit instantly with mobile preview.', feature_2_title: 'Social Gallery', feature_2_desc: 'Guests can upload and like photos.', feature_3_title: 'QR Code', feature_3_desc: 'High quality code for print.', feature_4_title: 'RSVP Management', feature_4_desc: 'Smart invites via WhatsApp and Email.', pricing_title: 'Ready?', pricing_desc: 'Choose the package that suits you.', price_starter: 'Starter', price_premium: 'Unlimited', price_trial: 'Trial',
    design_studio_title: 'Design Studio', edit_event_title: 'Edit Event', publish_btn: 'Publish', save_changes_btn: 'Save Changes', section_images: '1. Images', label_cover: 'Cover Image', label_main: 'Main Image (Optional)', file_btn_label: 'Choose Image', file_no_file: 'No file chosen', section_content: '2. Content & Typography', label_title: 'Title', label_message: 'Message', section_details: '3. Date & Location', label_date: 'Date', label_location_name: 'Venue Name', label_location_url: 'Map Link', section_color: '4. Theme Color', section_form: '5. RSVP Form Questions', add_question_btn: '+ Add Question', locked_fields: '🔒 Standard Fields (Auto)', question_placeholder: 'Type your question...', option_placeholder: 'Separate options with comma', required_checkbox: 'Required',
    section_extra: '6. Details & Timeline', add_timeline_btn: '+ Timeline', add_note_btn: '+ Note', add_link_btn: '+ Link', timeline_time_ph: 'Time', timeline_title_ph: 'Event', note_title_ph: 'Title', note_desc_ph: 'Description...', link_title_ph: 'Button Text', link_url_ph: 'https://...', image_upload_btn: 'Add Image',
    preview_cover_placeholder: 'Cover', preview_main_placeholder: 'Image', preview_title_placeholder: 'Title', preview_location_placeholder: 'Location', preview_map_btn: 'Get Directions', preview_rsvp_title: 'RSVP Form Preview', preview_ph_name: 'Full Name', preview_ph_email: 'Email', preview_ph_status: 'Attendance Status', preview_ph_count: '+ Guest Count', preview_ph_note: 'Your Note...', preview_submit_btn: 'Submit',
    public_date_label: '📅 Date', public_location_label: '📍 Location', public_directions_btn: 'Get Directions 🗺️', public_details_title: 'Event Details', public_memory_wall: '📸 Memory Wall', public_gallery_locked: 'Gallery Locked', public_gallery_hint: 'Login above to view.', public_back_dashboard: "← Back to Dashboard", public_create_own: "Create your own with Cereget", public_not_found: "Not Found",
    rsvp_title: 'RSVP Form', rsvp_name_label: 'Full Name', rsvp_name_ph: 'Your Name', rsvp_email_label: 'Email', rsvp_email_ph: 'email@example.com', rsvp_status_label: 'Status', rsvp_option_yes: 'Attending 🥳', rsvp_option_no: 'Not Attending 😔', rsvp_count_label: '+ Guest Count', rsvp_note_label: 'Note (Optional)', rsvp_note_ph: 'Your message...', rsvp_btn_send: 'Send Response', rsvp_btn_sending: 'Sending...', rsvp_success_title: 'Registered!', rsvp_success_msg: 'Response received.', rsvp_success_hint: 'You can use the gallery below.',
  // --- NEW: GUEST DETAILS MODAL ---
  modal_details_title: 'Guest Responses',
  modal_no_response: 'No custom responses from this guest.',
  modal_close_btn: 'Close',
  view_details_btn: 'View Answers',
},
  de: {
    loading: 'Laden...', save: 'Speichern', cancel: 'Abbrechen', edit: 'Bearbeiten', delete: 'Löschen', logout: 'Abmelden', confirm_delete: 'Löschen?',
    dashboard_title: 'Dashboard', dashboard_subtitle: 'Verwalten Sie Ihre Events.', my_credits: 'Credits', create_new_event: '+ Neu', no_events: 'Keine Events.', manage: 'Verwalten', download: 'Laden', guests_tab: '📋 Gäste', photos_tab: '📸 Galerie',
    export_btn: 'Excel Laden 📥',
    guest_status: 'Status', total: 'Gesamt', invite_message: 'Nachricht', save_template: 'Speichern', edit_template: 'Bearbeiten', add_guest_title: 'Gast hinzufügen', name_label: 'NAME', method_label: 'METHODE', phone_label: 'FON', email_label: 'MAIL', add_btn: 'Add', list_empty: 'Leer.',
    col_name: 'Name', col_contact: 'Kontakt', col_status: 'Status', col_count: '+Gäste', col_note: 'Notiz', col_invite: 'Einladen', col_action: 'Aktion',
    landing_hero_title: 'Smarte Einladungen.', landing_hero_desc: 'Mit QR-Codes.', landing_cta_button: 'Pakete →', landing_login: 'Login', landing_buy: 'Kaufen', feature_1_title: 'Live Design', feature_1_desc: 'Vorschau.', feature_2_title: 'Galerie', feature_2_desc: 'Fotos teilen.', feature_3_title: 'QR Code', feature_3_desc: 'Druckqualität.', feature_4_title: 'RSVP', feature_4_desc: 'WhatsApp & Email.', pricing_title: 'Bereit?', pricing_desc: 'Wähle Paket.', price_starter: 'Start', price_premium: 'Max', price_trial: 'Test',
    design_studio_title: 'Design Studio', edit_event_title: 'Bearbeiten', publish_btn: 'Veröffentlichen', save_changes_btn: 'Speichern', section_images: '1. Bilder', label_cover: 'Titelbild', label_main: 'Hauptbild', file_btn_label: 'Bild wählen', file_no_file: 'Kein Bild', section_content: '2. Inhalt', label_title: 'Titel', label_message: 'Nachricht', section_details: '3. Details', label_date: 'Datum', label_location_name: 'Ort', label_location_url: 'Karten-URL', section_color: '4. Farbe', section_form: '5. Fragen', add_question_btn: '+ Frage', locked_fields: '🔒 Standard', question_placeholder: 'Frage...', option_placeholder: 'Optionen...', required_checkbox: 'Pflicht',
    section_extra: '6. Details', add_timeline_btn: '+ Zeitplan', add_note_btn: '+ Notiz', add_link_btn: '+ Link', timeline_time_ph: 'Zeit', timeline_title_ph: 'Ereignis', note_title_ph: 'Titel', note_desc_ph: 'Beschreibung', link_title_ph: 'Button', link_url_ph: 'URL', image_upload_btn: 'Bild',
    preview_cover_placeholder: 'Titelbild', preview_main_placeholder: 'Bild', preview_title_placeholder: 'Titel', preview_location_placeholder: 'Ort', preview_map_btn: 'Route', preview_rsvp_title: 'RSVP', preview_ph_name: 'Name', preview_ph_email: 'Email', preview_ph_status: 'Status', preview_ph_count: '+ Gäste', preview_ph_note: 'Notiz...', preview_submit_btn: 'Senden',
    public_date_label: '📅 Datum', public_location_label: '📍 Ort', public_directions_btn: 'Route 🗺️', public_details_title: 'Details', public_memory_wall: '📸 Fotowand', public_gallery_locked: 'Gesperrt', public_gallery_hint: 'Login.', public_back_dashboard: "← Zurück", public_create_own: "Erstellen", public_not_found: "Nicht gefunden",
    rsvp_title: 'RSVP Formular', rsvp_name_label: 'Name', rsvp_name_ph: 'Ihr Name', rsvp_email_label: 'E-Mail', rsvp_email_ph: 'email@bsp.com', rsvp_status_label: 'Status', rsvp_option_yes: 'Dabei 🥳', rsvp_option_no: 'Leider nein 😔', rsvp_count_label: '+ Gäste', rsvp_note_label: 'Notiz', rsvp_note_ph: 'Nachricht...', rsvp_btn_send: 'Senden', rsvp_btn_sending: 'Senden...', rsvp_success_title: 'Erhalten!', rsvp_success_msg: 'Danke.', rsvp_success_hint: 'Galerie unten.'
  },
  fr: {
    loading: 'Chargement...', save: 'Sauver', cancel: 'Annuler', edit: 'Modifier', delete: 'Supprimer', logout: 'Déconnexion', confirm_delete: 'Supprimer ?',
    dashboard_title: 'Tableau de Bord', dashboard_subtitle: 'Gérez vos événements.', my_credits: 'Crédits', create_new_event: '+ Nouveau', no_events: 'Aucun événement.', manage: 'Gérer', download: 'Télécharger', guests_tab: '📋 Invités', photos_tab: '📸 Galerie',
    export_btn: 'Télécharger Excel 📥',
    guest_status: 'Statut', total: 'Total', invite_message: 'Message', save_template: 'Sauver', edit_template: 'Modifier', add_guest_title: 'Ajouter', name_label: 'NOM', method_label: 'MÉTHODE', phone_label: 'TÉL', email_label: 'EMAIL', add_btn: 'Ajouter', list_empty: 'Vide.',
    col_name: 'Nom', col_contact: 'Contact', col_status: 'Statut', col_count: '+Invités', col_note: 'Note', col_invite: 'Inviter', col_action: 'Action',
    landing_hero_title: 'Invitations sociales.', landing_hero_desc: 'Avec QR codes.', landing_cta_button: 'Forfaits →', landing_login: 'Login', landing_buy: 'Acheter', feature_1_title: 'Design Live', feature_1_desc: 'Aperçu.', feature_2_title: 'Galerie', feature_2_desc: 'Photos.', feature_3_title: 'QR Code', feature_3_desc: 'Qualité.', feature_4_title: 'RSVP', feature_4_desc: 'WhatsApp.', pricing_title: 'Prêt ?', pricing_desc: 'Choisissez.', price_starter: 'Débutant', price_premium: 'Max', price_trial: 'Essai',
    design_studio_title: 'Studio', edit_event_title: 'Modifier', publish_btn: 'Publier', save_changes_btn: 'Sauver', section_images: '1. Images', label_cover: 'Couverture', label_main: 'Image', file_btn_label: 'Choisir', file_no_file: 'Aucun fichier', section_content: '2. Contenu', label_title: 'Titre', label_message: 'Message', section_details: '3. Détails', label_date: 'Date', label_location_name: 'Lieu', label_location_url: 'Carte', section_color: '4. Couleur', section_form: '5. Questions', add_question_btn: '+ Question', locked_fields: '🔒 Standard', question_placeholder: 'Question...', option_placeholder: 'Options...', required_checkbox: 'Obligatoire',
    section_extra: '6. Détails', add_timeline_btn: '+ Chronologie', add_note_btn: '+ Note', add_link_btn: '+ Lien', timeline_time_ph: 'Heure', timeline_title_ph: 'Événement', note_title_ph: 'Titre', note_desc_ph: 'Description', link_title_ph: 'Bouton', link_url_ph: 'URL', image_upload_btn: 'Image',
    preview_cover_placeholder: 'Couverture', preview_main_placeholder: 'Image', preview_title_placeholder: 'Titre', preview_location_placeholder: 'Lieu', preview_map_btn: 'Itinéraire', preview_rsvp_title: 'RSVP', preview_ph_name: 'Nom', preview_ph_email: 'Email', preview_ph_status: 'Statut', preview_ph_count: '+ Invités', preview_ph_note: 'Note...', preview_submit_btn: 'Envoyer',
    public_date_label: '📅 Date', public_location_label: '📍 Lieu', public_directions_btn: 'Itinéraire 🗺️', public_details_title: 'Détails', public_memory_wall: '📸 Photos', public_gallery_locked: 'Verrouillé', public_gallery_hint: 'Login.', public_back_dashboard: "← Retour", public_create_own: "Créer", public_not_found: "Non trouvé",
    rsvp_title: 'Formulaire RSVP', rsvp_name_label: 'Nom', rsvp_name_ph: 'Votre Nom', rsvp_email_label: 'Email', rsvp_email_ph: 'email@ex.com', rsvp_status_label: 'Statut', rsvp_option_yes: 'Présent 🥳', rsvp_option_no: 'Absent 😔', rsvp_count_label: '+ Invités', rsvp_note_label: 'Note', rsvp_note_ph: 'Message...', rsvp_btn_send: 'Envoyer', rsvp_btn_sending: 'Envoi...', rsvp_success_title: 'Reçu !', rsvp_success_msg: 'Merci.', rsvp_success_hint: 'Galerie ci-dessous.'
  },
  es: {
    loading: 'Cargando...', save: 'Guardar', cancel: 'Cancelar', edit: 'Editar', delete: 'Eliminar', logout: 'Salir', confirm_delete: '¿Eliminar?',
    dashboard_title: 'Panel', dashboard_subtitle: 'Gestiona eventos.', my_credits: 'Créditos', create_new_event: '+ Nuevo', no_events: 'Sin eventos.', manage: 'Gestionar', download: 'Descargar', guests_tab: '📋 Invitados', photos_tab: '📸 Galería',
    export_btn: 'Descargar Excel 📥',
    guest_status: 'Estado', total: 'Total', invite_message: 'Mensaje', save_template: 'Guardar', edit_template: 'Editar', add_guest_title: 'Añadir', name_label: 'NOMBRE', method_label: 'MÉTODO', phone_label: 'TEL', email_label: 'EMAIL', add_btn: 'Añadir', list_empty: 'Vacía.',
    col_name: 'Nombre', col_contact: 'Contacto', col_status: 'Estado', col_count: '+Invitados', col_note: 'Nota', col_invite: 'Invitar', col_action: 'Acción',
    landing_hero_title: 'Invitaciones sociales.', landing_hero_desc: 'Con códigos QR.', landing_cta_button: 'Paquetes →', landing_login: 'Acceso', landing_buy: 'Comprar', feature_1_title: 'Diseño', feature_1_desc: 'Vista previa.', feature_2_title: 'Galería', feature_2_desc: 'Fotos.', feature_3_title: 'Código QR', feature_3_desc: 'Calidad.', feature_4_title: 'RSVP', feature_4_desc: 'WhatsApp.', pricing_title: '¿Listo?', pricing_desc: 'Elige.', price_starter: 'Inicial', price_premium: 'Max', price_trial: 'Prueba',
    design_studio_title: 'Estudio', edit_event_title: 'Editar', publish_btn: 'Publicar', save_changes_btn: 'Guardar', section_images: '1. Imágenes', label_cover: 'Portada', label_main: 'Imagen', file_btn_label: 'Elegir', file_no_file: 'Ningún archivo', section_content: '2. Contenido', label_title: 'Título', label_message: 'Mensaje', section_details: '3. Detalles', label_date: 'Fecha', label_location_name: 'Lugar', label_location_url: 'Mapa', section_color: '4. Color', section_form: '5. Preguntas', add_question_btn: '+ Pregunta', locked_fields: '🔒 Estándar', question_placeholder: 'Pregunta...', option_placeholder: 'Opciones...', required_checkbox: 'Obligatorio',
    section_extra: '6. Detalles', add_timeline_btn: '+ Cronología', add_note_btn: '+ Nota', add_link_btn: '+ Enlace', timeline_time_ph: 'Hora', timeline_title_ph: 'Evento', note_title_ph: 'Título', note_desc_ph: 'Descripción', link_title_ph: 'Botón', link_url_ph: 'URL', image_upload_btn: 'Imagen',
    preview_cover_placeholder: 'Portada', preview_main_placeholder: 'Imagen', preview_title_placeholder: 'Título', preview_location_placeholder: 'Lugar', preview_map_btn: 'Direcciones', preview_rsvp_title: 'RSVP', preview_ph_name: 'Nombre', preview_ph_email: 'Email', preview_ph_status: 'Estado', preview_ph_count: '+ Invitados', preview_ph_note: 'Nota...', preview_submit_btn: 'Enviar',
    public_date_label: '📅 Fecha', public_location_label: '📍 Lugar', public_directions_btn: 'Direcciones 🗺️', public_details_title: 'Detalles', public_memory_wall: '📸 Fotos', public_gallery_locked: 'Bloqueada', public_gallery_hint: 'Acceso.', public_back_dashboard: "← Volver", public_create_own: "Crear", public_not_found: "No encontrado",
    rsvp_title: 'Formulario RSVP', rsvp_name_label: 'Nombre', rsvp_name_ph: 'Tu Nombre', rsvp_email_label: 'Email', rsvp_email_ph: 'email@ej.com', rsvp_status_label: 'Estado', rsvp_option_yes: 'Asistiré 🥳', rsvp_option_no: 'No asistiré 😔', rsvp_count_label: '+ Invitados', rsvp_note_label: 'Nota', rsvp_note_ph: 'Mensaje...', rsvp_btn_send: 'Enviar', rsvp_btn_sending: 'Enviando...', rsvp_success_title: '¡Recibido!', rsvp_success_msg: 'Gracias.', rsvp_success_hint: 'Galería abajo.'
  },
  it: {
    loading: 'Caricamento...', save: 'Salva', cancel: 'Annulla', edit: 'Modifica', delete: 'Elimina', logout: 'Esci', confirm_delete: 'Eliminare?',
    dashboard_title: 'Dashboard', dashboard_subtitle: 'Gestisci eventi.', my_credits: 'Crediti', create_new_event: '+ Nuovo', no_events: 'Nessun evento.', manage: 'Gestisci', download: 'Scarica', guests_tab: '📋 Ospiti', photos_tab: '📸 Galleria',
    export_btn: 'Scarica Excel 📥',
    guest_status: 'Stato', total: 'Totale', invite_message: 'Messaggio', save_template: 'Salva', edit_template: 'Modifica', add_guest_title: 'Aggiungi', name_label: 'NOME', method_label: 'METODO', phone_label: 'TEL', email_label: 'EMAIL', add_btn: 'Aggiungi', list_empty: 'Vuota.',
    col_name: 'Nome', col_contact: 'Contatto', col_status: 'Stato', col_count: '+Ospiti', col_note: 'Nota', col_invite: 'Invito', col_action: 'Azione',
    landing_hero_title: 'Inviti sociali.', landing_hero_desc: 'Codici QR.', landing_cta_button: 'Pacchetti →', landing_login: 'Login', landing_buy: 'Acquista', feature_1_title: 'Design', feature_1_desc: 'Anteprima.', feature_2_title: 'Galleria', feature_2_desc: 'Foto.', feature_3_title: 'QR', feature_3_desc: 'Qualità.', feature_4_title: 'RSVP', feature_4_desc: 'WhatsApp.', pricing_title: 'Pronto?', pricing_desc: 'Scegli.', price_starter: 'Starter', price_premium: 'Max', price_trial: 'Prova',
    design_studio_title: 'Studio', edit_event_title: 'Modifica', publish_btn: 'Pubblica', save_changes_btn: 'Salva', section_images: '1. Immagini', label_cover: 'Copertina', label_main: 'Immagine Principale', file_btn_label: 'Scegli', file_no_file: 'Nessun file', section_content: '2. Contenuto', label_title: 'Titolo', label_message: 'Messaggio', section_details: '3. Dettagli', label_date: 'Data', label_location_name: 'Luogo', label_location_url: 'Mappa', section_color: '4. Colore', section_form: '5. Domande', add_question_btn: '+ Domanda', locked_fields: '🔒 Standard', question_placeholder: 'Domanda...', option_placeholder: 'Opzioni...', required_checkbox: 'Obbligatorio',
    section_extra: '6. Dettagli', add_timeline_btn: '+ Cronologia', add_note_btn: '+ Nota', add_link_btn: '+ Link', timeline_time_ph: 'Ora', timeline_title_ph: 'Evento', note_title_ph: 'Titolo', note_desc_ph: 'Descrizione', link_title_ph: 'Pulsante', link_url_ph: 'URL', image_upload_btn: 'Immagine',
    preview_cover_placeholder: 'Copertina', preview_main_placeholder: 'Immagine', preview_title_placeholder: 'Titolo', preview_location_placeholder: 'Luogo', preview_map_btn: 'Indicazioni', preview_rsvp_title: 'RSVP', preview_ph_name: 'Nome', preview_ph_email: 'Email', preview_ph_status: 'Stato', preview_ph_count: '+ Ospiti', preview_ph_note: 'Nota...', preview_submit_btn: 'Invia',
    public_date_label: '📅 Data', public_location_label: '📍 Luogo', public_directions_btn: 'Indicazioni 🗺️', public_details_title: 'Dettagli', public_memory_wall: '📸 Foto', public_gallery_locked: 'Bloccata', public_gallery_hint: 'Accedi.', public_back_dashboard: "← Indietro", public_create_own: "Crea", public_not_found: "Non trovato",
    rsvp_title: 'Modulo RSVP', rsvp_name_label: 'Nome', rsvp_name_ph: 'Il tuo nome', rsvp_email_label: 'Email', rsvp_email_ph: 'email@es.com', rsvp_status_label: 'Stato', rsvp_option_yes: 'Partecipo 🥳', rsvp_option_no: 'Non partecipo 😔', rsvp_count_label: '+ Ospiti', rsvp_note_label: 'Nota', rsvp_note_ph: 'Messaggio...', rsvp_btn_send: 'Invia', rsvp_btn_sending: 'Invio...', rsvp_success_title: 'Ricevuto!', rsvp_success_msg: 'Grazie.', rsvp_success_hint: 'Galleria sotto.'
  },
  ru: {
    loading: 'Загрузка...', save: 'Сохранить', cancel: 'Отмена', edit: 'Изменить', delete: 'Удалить', logout: 'Выйти', confirm_delete: 'Удалить?',
    dashboard_title: 'Панель', dashboard_subtitle: 'Управление.', my_credits: 'Кредиты', create_new_event: '+ Создать', no_events: 'Нет событий.', manage: 'Управлять', download: 'Скачать', guests_tab: '📋 Гости', photos_tab: '📸 Галерея',
    export_btn: 'Скачать Excel 📥',
    guest_status: 'Статус', total: 'Всего', invite_message: 'Сообщение', save_template: 'Сохранить', edit_template: 'Изменить', add_guest_title: 'Добавить', name_label: 'ИМЯ', method_label: 'МЕТОД', phone_label: 'ТЕЛ', email_label: 'EMAIL', add_btn: 'Добавить', list_empty: 'Пусто.',
    col_name: 'Имя', col_contact: 'Контакт', col_status: 'Статус', col_count: '+Гости', col_note: 'Заметка', col_invite: 'Пригласить', col_action: 'Действие',
    landing_hero_title: 'Соцсеть.', landing_hero_desc: 'QR-коды.', landing_cta_button: 'Пакеты →', landing_login: 'Вход', landing_buy: 'Купить', feature_1_title: 'Дизайн', feature_1_desc: 'Предпросмотр.', feature_2_title: 'Галерея', feature_2_desc: 'Фото.', feature_3_title: 'QR', feature_3_desc: 'Качество.', feature_4_title: 'RSVP', feature_4_desc: 'WhatsApp.', pricing_title: 'Готовы?', pricing_desc: 'Выберите.', price_starter: 'Старт', price_premium: 'Безлимит', price_trial: 'Проба',
    design_studio_title: 'Студия', edit_event_title: 'Изменить', publish_btn: 'Опубликовать', save_changes_btn: 'Сохранить', section_images: '1. Фото', label_cover: 'Обложка', label_main: 'Главное', file_btn_label: 'Выбрать', file_no_file: 'Нет файла', section_content: '2. Контент', label_title: 'Заголовок', label_message: 'Сообщение', section_details: '3. Детали', label_date: 'Дата', label_location_name: 'Место', label_location_url: 'Карта', section_color: '4. Цвет', section_form: '5. Вопросы', add_question_btn: '+ Вопрос', locked_fields: '🔒 Стандарт', question_placeholder: 'Вопрос...', option_placeholder: 'Варианты...', required_checkbox: 'Обязательно',
    section_extra: '6. Детали', add_timeline_btn: '+ Таймлайн', add_note_btn: '+ Заметка', add_link_btn: '+ Ссылка', timeline_time_ph: 'Время', timeline_title_ph: 'Событие', note_title_ph: 'Заголовок', note_desc_ph: 'Описание', link_title_ph: 'Кнопка', link_url_ph: 'URL', image_upload_btn: 'Фото',
    preview_cover_placeholder: 'Обложка', preview_main_placeholder: 'Фото', preview_title_placeholder: 'Заголовок', preview_location_placeholder: 'Место', preview_map_btn: 'Маршрут', preview_rsvp_title: 'RSVP', preview_ph_name: 'Имя', preview_ph_email: 'Email', preview_ph_status: 'Статус', preview_ph_count: '+ Гостей', preview_ph_note: 'Примечание...', preview_submit_btn: 'Отправить',
    public_date_label: '📅 Дата', public_location_label: '📍 Место', public_directions_btn: 'Маршрут 🗺️', public_details_title: 'Детали', public_memory_wall: '📸 Фото', public_gallery_locked: 'Закрыто', public_gallery_hint: 'Войдите.', public_back_dashboard: "← Назад", public_create_own: "Создать", public_not_found: "Не найдено",
    rsvp_title: 'Форма RSVP', rsvp_name_label: 'Имя', rsvp_name_ph: 'Ваше имя', rsvp_email_label: 'Email', rsvp_email_ph: 'email@ex.com', rsvp_status_label: 'Статус', rsvp_option_yes: 'Буду 🥳', rsvp_option_no: 'Не буду 😔', rsvp_count_label: '+ Гости', rsvp_note_label: 'Заметка', rsvp_note_ph: 'Сообщение...', rsvp_btn_send: 'Отправить', rsvp_btn_sending: 'Отправка...', rsvp_success_title: 'Получено!', rsvp_success_msg: 'Спасибо.', rsvp_success_hint: 'Галерея ниже.'
  },
  ar: {
    loading: 'تحميل...', save: 'حفظ', cancel: 'إلغاء', edit: 'تعديل', delete: 'حذف', logout: 'خروج', confirm_delete: 'حذف؟',
    dashboard_title: 'لوحة التحكم', dashboard_subtitle: 'إدارة.', my_credits: 'رصيد', create_new_event: '+ جديد', no_events: 'لا توجد أحداث.', manage: 'إدارة', download: 'تحميل', guests_tab: '📋 الضيوف', photos_tab: '📸 المعرض',
    export_btn: 'تحميل Excel 📥',
    guest_status: 'الحالة', total: 'مجموع', invite_message: 'رسالة', save_template: 'حفظ', edit_template: 'تعديل', add_guest_title: 'إضافة', name_label: 'الاسم', method_label: 'طريقة', phone_label: 'هاتف', email_label: 'بريد', add_btn: 'إضافة', list_empty: 'فارغة.',
    col_name: 'الاسم', col_contact: 'اتصال', col_status: 'الحالة', col_count: '+ضيوف', col_note: 'ملاحظة', col_invite: 'دعوة', col_action: 'إجراء',
    landing_hero_title: 'دعوات اجتماعية.', landing_hero_desc: 'رموز QR.', landing_cta_button: 'باقات →', landing_login: 'دخول', landing_buy: 'شراء', feature_1_title: 'تصميم', feature_1_desc: 'معاينة.', feature_2_title: 'معرض', feature_2_desc: 'صور.', feature_3_title: 'QR', feature_3_desc: 'جودة.', feature_4_title: 'إدارة', feature_4_desc: 'واتساب.', pricing_title: 'جاهز؟', pricing_desc: 'اختر.', price_starter: 'بداية', price_premium: 'غير محدود', price_trial: 'تجربة',
    design_studio_title: 'استوديو', edit_event_title: 'تعديل', publish_btn: 'نشر', save_changes_btn: 'حفظ', section_images: '1. صور', label_cover: 'غلاف', label_main: 'صورة', file_btn_label: 'اختر', file_no_file: 'لا ملف', section_content: '2. محتوى', label_title: 'عنوان', label_message: 'رسالة', section_details: '3. تفاصيل', label_date: 'تاريخ', label_location_name: 'مكان', label_location_url: 'خريطة', section_color: '4. لون', section_form: '5. أسئلة', add_question_btn: '+ سؤال', locked_fields: '🔒 قياسي', question_placeholder: 'سؤال...', option_placeholder: 'خيارات...', required_checkbox: 'مطلوب',
    section_extra: '6. تفاصيل', add_timeline_btn: '+ جدول', add_note_btn: '+ ملاحظة', add_link_btn: '+ رابط', timeline_time_ph: 'وقت', timeline_title_ph: 'حدث', note_title_ph: 'عنوان', note_desc_ph: 'وصف', link_title_ph: 'زر', link_url_ph: 'رابط', image_upload_btn: 'صورة',
    preview_cover_placeholder: 'غلاف', preview_main_placeholder: 'صورة', preview_title_placeholder: 'عنوان', preview_location_placeholder: 'مكان', preview_map_btn: 'اتجاهات', preview_rsvp_title: 'معاينة', preview_ph_name: 'اسم', preview_ph_email: 'بريد', preview_ph_status: 'حالة', preview_ph_count: '+ ضيوف', preview_ph_note: 'ملاحظة...', preview_submit_btn: 'إرسال',
    public_date_label: '📅 تاريخ', public_location_label: '📍 موقع', public_directions_btn: 'اتجاهات 🗺️', public_details_title: 'تفاصيل', public_memory_wall: '📸 صور', public_gallery_locked: 'مغلق', public_gallery_hint: 'دخول.', public_back_dashboard: "← رجوع", public_create_own: "اصنع", public_not_found: "غير موجود",
    rsvp_title: 'نموذج RSVP', rsvp_name_label: 'الاسم', rsvp_name_ph: 'اسمك', rsvp_email_label: 'بريد إلكتروني', rsvp_email_ph: 'email@ex.com', rsvp_status_label: 'الحالة', rsvp_option_yes: 'سأحضر 🥳', rsvp_option_no: 'لن أحضر 😔', rsvp_count_label: '+ ضيوف', rsvp_note_label: 'ملاحظة', rsvp_note_ph: 'رسالة...', rsvp_btn_send: 'إرسال', rsvp_btn_sending: 'جاري الإرسال...', rsvp_success_title: 'تم الاستلام!', rsvp_success_msg: 'شكرا.', rsvp_success_hint: 'المعرض أدناه.'
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

// --- 4. HOOK ---
export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
};