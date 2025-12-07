# CEREGET - PROJECT MASTER CONTEXT
Tarih: 07.12.2025
Durum: v1.2 - Tasarım Stüdyosu & Gelişmiş Özelleştirme Hazır

## 1. TEKNOLOJİ STACK'İ
- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend/DB:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Email/Password - Auto Signup/Login logic)
- **Storage:** Supabase Storage (Resimler için)
- **Ek Kütüphaneler:** qrcode.react (QR Üretimi)

## 2. VERİTABANI ŞEMASI (SQL)

### Tablo: `profiles` (Kullanıcı & Kredi)
- id (UUID, PK) -> auth.users.id
- email (TEXT)
- credits (INT) -> Varsayılan: 3 (Trigger ile otomatik oluşur)
- is_premium (BOOL)
* **Kritik Kural:** Kullanıcılar kendi profillerini (kredilerini) güncelleyebilir (RLS: UPDATE policy added).

### Tablo: `events` (Etkinlikler)
- id (UUID, PK)
- user_id (UUID, FK -> auth.users)
- title (TEXT)
- slug (TEXT, Unique) -> Otomatik üretilir (tr-slug-randomID)
- image_url (TEXT) -> Kapak görseli
- main_image_url (TEXT) -> **YENİ:** İçerik görseli (Opsiyonel)
- message (TEXT) -> **YENİ:** Davet metni
- design_settings (JSONB) -> 
    { 
      "theme": "#hexcode",
      "titleFont": "'FontName', type",
      "titleSize": number (rem),
      "messageFont": "'FontName', type",
      "messageSize": number (rem)
    }
- event_date (TIMESTAMP)
- location_name (TEXT)
- location_url (TEXT)

### Tablo: `guests` (Davetliler & LCV)
- id (UUID, PK)
- event_id (UUID, FK -> events)
- name (TEXT)
- email (TEXT) -> Galeri erişimi için zorunlu
- status (TEXT) -> 'katiliyor', 'katilmiyor'
- plus_one (INT)
- note (TEXT)
* **Kritik Kural:** `INSERT` herkese açık (Public).

### Tablo: `photos` (Galeri)
- id (UUID, PK)
- event_id (UUID, FK -> events)
- guest_email (TEXT) -> Yükleyen kişi
- image_url (TEXT)
- status (TEXT) -> Varsayılan: 'approved'

## 3. SAYFA YAPISI (APP ROUTER)

### `/app/page.tsx` (Dashboard)
- **Liste Görünümü:** Kullanıcının etkinliklerini listeler.
- **Yönetim:** QR Kod indirme, Davetli listesi, Fotoğraf silme.
- **Giriş Sistemi:** Email/Şifre ile giriş. Kullanıcı yoksa otomatik kayıt olur ve sayfayı yeniler (`window.location.reload()`).

### `/app/create/page.tsx` (Tasarım Stüdyosu - YENİ)
- **Split View:** Ekran ikiye bölünür.
  - **Sol:** Editör (Form, Font Seçici, Renk Seçici, Dosya Yükleme).
  - **Sağ:** Canlı Telefon Önizlemesi (Mockup).
- **Otomatik Slug:** Başlık girildikçe Türkçe karakterler temizlenir ve random ID eklenir.

### `/app/[slug]/page.tsx` (Davetiye Sayfası)
- **Tasarım:** Seçilen font, renk ve boyutlara göre dinamik render edilir.
- **Kilit Sistemi:** Giriş yapılmamışsa Galeri kilitli görünür.
- **Özellikler:** Geri sayım, Harita butonu, LCV formu, Fotoğraf yükleme.

## 4. KRİTİK İŞ KURALLARI
1. **Kredi Düşümü:** Etkinlik oluştururken Frontend'de kredi kontrolü yapılır ve `profiles` tablosunda update edilir.
2. **Türkçe Karakter:** URL'lerde (slug) Türkçe karakter sorunu `turkishSlugify` fonksiyonu ile çözüldü.
3. **Public Erişim:** Etkinlik ve Davetli tabloları okuma (SELECT) için public hale getirildi (QR ile girenler görebilsin diye).
4. **Fontlar:** Google Fonts (Inter, Playfair Display, Dancing Script, Merriweather, Montserrat) `layout.tsx` içine eklendi.