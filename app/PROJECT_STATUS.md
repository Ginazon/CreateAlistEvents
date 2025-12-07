# CEREGET - PROJECT MASTER CONTEXT
Tarih: 07.12.2025
Durum: v1.3 - Sosyal Özellikler (Beğeni/Yorum) Eklendi

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
- credits (INT) -> Trigger ile otomatik oluşur. RLS: Update izni açık.

### Tablo: `events` (Etkinlikler)
- id (UUID, PK), user_id (FK), title, slug (otomatik), event_date, location_name, location_url
- image_url (Kapak), main_image_url (İçerik)
- message (Davet metni)
- design_settings (JSONB): { theme, titleFont, titleSize, messageFont, messageSize }
* **Kural:** Public SELECT açık.

### Tablo: `guests` (Davetliler)
- id, event_id, name, email (Zorunlu), status, plus_one, note
* **Kural:** Public INSERT açık.

### Tablo: `photos` (Galeri)
- id, event_id, guest_email, image_url, status
* **Kural:** Herkes yükleyebilir, sadece admin silebilir.

### Tablo: `photo_likes` (YENİ - Beğeniler)
- id (UUID), photo_id (FK), guest_email (TEXT)
- UNIQUE(photo_id, guest_email) -> Bir kişi bir fotoyu 1 kere beğenebilir.
* **Kural:** Public INSERT/DELETE açık.

### Tablo: `photo_comments` (YENİ - Yorumlar)
- id (UUID), photo_id (FK), guest_email (TEXT), message (TEXT), created_at
* **Kural:** Public INSERT/SELECT açık.

## 3. SAYFA YAPISI

### `/app/page.tsx` (Dashboard)
- Etkinlik Listesi, QR Kod, Kredi Gösterimi.
- Yönetim Paneli: Davetli Listesi + Galeri Moderasyonu (Silme).

### `/app/create/page.tsx` (Tasarım Stüdyosu - Split View)
- **Sol:** Editör (Form, Font/Renk/Boyut Seçici, Dosya Yükleme).
- **Sağ:** Canlı iPhone Önizlemesi (Mockup).
- **Fontlar:** Inter, Playfair Display, Dancing Script, Merriweather, Montserrat.

### `/app/[slug]/page.tsx` (Misafir Deneyimi)
- **Tasarım:** Dinamik Font/Renk render edilir.
- **Kilit:** Giriş yapmamışsa galeri kilitli.
- **Sosyal Galeri (`PhotoGallery.tsx`):**
  - Fotoğraf Yükleme (Hızlı).
  - Beğeni (Kalp) Sayacı.
  - Yorum Yapma ve Listeleme.

## 4. KRİTİK İŞ KURALLARI
1. **Kredi:** Etkinlik oluştururken -1 düşer.
2. **Slug:** Türkçe karakterler temizlenir + Random ID eklenir.
3. **Google Fonts:** `layout.tsx` içinde tanımlı.