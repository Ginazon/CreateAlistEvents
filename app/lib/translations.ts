export type Language = 'tr' | 'en';

export const translations = {
  tr: {
    // GENEL
    save: 'Kaydet',
    cancel: 'İptal',
    loading: 'Yükleniyor...',
    processing: 'İşleniyor...',
    success: 'Başarılı!',
    error: 'Hata',
    delete: 'Sil',
    edit: 'Düzenle',
    
    // DASHBOARD
    dashboard_title: 'Cereget Yönetim Paneli',
    dashboard_subtitle: 'Etkinliklerini buradan yönet.',
    my_credits: 'Kredilerim',
    create_new_event: '+ Yeni Etkinlik Oluştur',
    no_events: 'Henüz hiç etkinliğin yok.',
    manage: 'Yönet',
    download: 'İndir',
    guests_tab: '📋 Davetli Listesi',
    photos_tab: '📸 Galeri',
    logout: 'Çıkış Yap',

    // GUEST MANAGER (DAVETLİLER)
    guest_status_title: 'Davetli Durumu',
    total: 'Toplam',
    invite_message_title: 'Davet Mesajı',
    invite_message_hint: '* [Ad] ve [Link] otomatik değişecektir.',
    add_new_guest: 'Yeni Davetli Ekle',
    name_placeholder: 'İsim Giriniz',
    phone_label: 'TELEFON',
    email_label: 'E-POSTA',
    method_label: 'YÖNTEM',
    send_whatsapp: 'WhatsApp Gönder ↗',
    send_sms: 'SMS Gönder ↗',
    send_email: 'Mail Gönder ↗',
    
    // LANDING & AUTH
    login_admin: 'Admin Girişi',
    buy_credits: 'Kredi Satın Al',
  },
  en: {
    // GENERAL
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading...',
    processing: 'Processing...',
    success: 'Success!',
    error: 'Error',
    delete: 'Delete',
    edit: 'Edit',

    // DASHBOARD
    dashboard_title: 'Cereget Dashboard',
    dashboard_subtitle: 'Manage your events here.',
    my_credits: 'My Credits',
    create_new_event: '+ Create New Event',
    no_events: 'You have no events yet.',
    manage: 'Manage',
    download: 'Download',
    guests_tab: '📋 Guest List',
    photos_tab: '📸 Gallery',
    logout: 'Log Out',

    // GUEST MANAGER
    guest_status_title: 'Guest Status',
    total: 'Total',
    invite_message_title: 'Invite Message',
    invite_message_hint: '* [Name] and [Link] will change automatically.',
    add_new_guest: 'Add New Guest',
    name_placeholder: 'Enter Name',
    phone_label: 'PHONE',
    email_label: 'EMAIL',
    method_label: 'METHOD',
    send_whatsapp: 'Send WhatsApp ↗',
    send_sms: 'Send SMS ↗',
    send_email: 'Send Email ↗',

    // LANDING & AUTH
    login_admin: 'Admin Login',
    buy_credits: 'Buy Credits',
  }
};