# CEREGET - PROJECT MASTER CONTEXT
Tarih: 07.12.2025
Durum: v1.5 - Satış Sayfası ve Yönlendirme Mantığı Eklendi

## 1. TEKNOLOJİ STACK'İ
- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend/DB:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Email/Password - Auto Signup/Login logic)
- **Storage:** Supabase Storage (Resimler için)
- **Ek Kütüphaneler:** qrcode.react (QR Üretimi), react-icons (Landing Page)

## 2. VERİTABANI ŞEMASI (SQL)

### Tablo: `profiles` (Kullanıcı & Kredi)
- id (UUID, PK) -> auth.users.id
- email (TEXT)
- credits (INT) -> Trigger ile otomatik oluşur. RLS: Update izni açık.
- is_premium (BOOLEAN) -> Sınırsız paket için eklenebilir.

### Tablo: `events` (Etkinlikler)
- id (UUID, PK), user_id (FK), title, slug (otomatik), event_date, location_name, location_url
- image_url (Kapak), main_image_url (İçerik)
- message (Davet metni)
- design_settings (JSONB): { theme, titleFont, titleSize, messageFont, messageSize }
* **Kural:** Public SELECT açık.

### Tablo: `photo_comments` (Yorumlar)
- id (UUID), photo_id (FK), guest_email (TEXT), message (TEXT), created_at
- **status (TEXT):** Moderasyon için eklenmiştir. Şu an için filtre kaldırıldı.

### Tablo: `etsy_products` (Ürün Kataloğu)
- listing_id (TEXT, PK), name (TEXT), credits (INT), is_unlimited (BOOLEAN)

## 3. SAYFA YAPISI

### `/app/page.tsx` (Admin Router / Dashboard - GÜNCELLENDİ)
- **Kullanım:** Ana sayfa, Admin'in giriş durumunu kontrol eder.
- **Yönlendirme:** Giriş yapılmamışsa otomatik olarak **`/landing`**'e yönlendirir. Giriş yapılmışsa etkinlik listesini gösterir.
- Yönetim Paneli: Etkinlik Listesi, QR Kod, Kredi Gösterimi, Moderasyon.
- **Yasal Linkler:** Footer'da mevcut.

### `/app/landing/page.tsx` (Satış Sayfası - YENİ)
- **Kullanım:** Müşterileri ikna etmeye yönelik, satış odaklı sayfa.
- **Login:** Admin Girişi, Modaldan (Pop-up) yapılır.

### `/app/create/page.tsx` (Tasarım Stüdyosu)
- Split View (Editör / Önizleme).

### `/app/[slug]/page.tsx` (Misafir Deneyimi)
- Dinamik Tasarım. Kilitli Galeri, Sosyal Galeri.

## 4. KRİTİK İŞ KURALLARI
1. **Kredi Tüketimi:** Etkinlik oluştururken -1 düşer.
2. **Slug:** Türkçe karakterler temizlenir + Random ID eklenir.
3. **Etsy Webhook (Make.com):** Etsy satışı -> Vercel API (`/api/webhook/etsy`) -> Supabase Kredi Yükleme.
4. **Yorum Moderasyonu:** Status filtresi kaldırılmıştır, tüm yorumlar anında yayınlanır.