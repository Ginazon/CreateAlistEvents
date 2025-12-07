# CEREGET - PROJECT MASTER CONTEXT
Tarih: 07.12.2025
Durum: MVP Tamamlandı (Deployment Aşaması)

## 1. TEKNOLOJİ STACK'İ
- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend/DB:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Email/Password)
- **Storage:** Supabase Storage (Resimler için)
- **Ek Kütüphaneler:** qrcode.react (QR Üretimi)

## 2. VERİTABANI ŞEMASI (SQL)

### Tablo: `profiles` (Kullanıcı & Kredi)
- id (UUID, PK) -> auth.users.id
- email (TEXT)
- credits (INT) -> Varsayılan: 3 (Trigger ile otomatik oluşur)
- is_premium (BOOL)

### Tablo: `events` (Etkinlikler)
- id (UUID, PK)
- user_id (UUID, FK -> auth.users)
- title (TEXT)
- slug (TEXT, Unique) -> URL yapısı için
- image_url (TEXT) -> Davetiye görseli
- design_settings (JSONB) -> { "theme": "#hexcode" }
- event_date (TIMESTAMP)
- location_name (TEXT)
- location_url (TEXT) -> Google Maps linki

### Tablo: `guests` (Davetliler & LCV)
- id (UUID, PK)
- event_id (UUID, FK -> events)
- name (TEXT)
- email (TEXT) -> Galeri erişimi için zorunlu (V1 update)
- status (TEXT) -> 'katiliyor', 'katilmiyor'
- plus_one (INT)
- note (TEXT)

### Tablo: `photos` (Galeri)
- id (UUID, PK)
- event_id (UUID, FK -> events)
- guest_email (TEXT) -> Yükleyen kişi
- image_url (TEXT)
- status (TEXT) -> Varsayılan: 'approved'

### Storage Buckets
1. `event-images` (Public) -> Davetiye kapak görselleri (Admin yükler)
2. `guest-uploads` (Public) -> Misafir fotoğrafları

## 3. KRİTİK İŞ KURALLARI & GÜVENLİK (RLS)
- **RLS:** Tüm tablolarda Row Level Security açık.
- **Photos:** - `INSERT`: Herkes (emaili olan) yükleyebilir.
  - `DELETE`: Sadece etkinlik sahibi (user_id eşleşen) silebilir.
- **Guests:**
  - `INSERT`: Herkes kayıt olabilir.
  - `SELECT`: Sadece etkinlik sahibi listeyi görebilir.
- **Kredi Sistemi:** Etkinlik oluştururken 1 kredi düşer. Kredi < 1 ise işlem engellenir.

## 4. SAYFA YAPISI (APP ROUTER)
- `/app/page.tsx` -> **Admin Dashboard** (Giriş, Etkinlik Oluşturma, QR, İstatistikler, Moderasyon).
- `/app/[slug]/page.tsx` -> **Davetiye Sayfası** (Misafir Görünümü).
  - Giriş yapılmamışsa: Sayaç, Harita, LCV Formu, Kilitli Galeri.
  - Giriş yapılmışsa (LCV sonrası): + Fotoğraf Yükleme Alanı (PhotoGallery).

## 5. BİLEŞENLER
- `RsvpForm.tsx`: LCV ve Giriş işlemi. Başarılı olunca `localStorage`'a kaydeder.
- `PhotoGallery.tsx`: Fotoğraf yükleme ve grid görünümü.
- `Countdown.tsx`: Geri sayım sayacı.