# CEREGET - PROJECT MASTER CONTEXT
Tarih: 07.12.2025
Durum: v1.4 - Ticari Entegrasyon (Etsy/Make.com) ve Yasal Altyapı Eklendi

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
- is_premium (BOOLEAN) -> Sınırsız paket için eklenebilir.

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

### Tablo: `photo_likes` (Beğeniler)
- id (UUID), photo_id (FK), guest_email (TEXT)
- UNIQUE(photo_id, guest_email)
* **Kural:** Public INSERT/DELETE açık.

### Tablo: `photo_comments` (Yorumlar)
- id (UUID), photo_id (FK), guest_email (TEXT), message (TEXT), created_at
- **status (TEXT):** Moderasyon için eklenmiştir (`pending`, `approved`, `rejected`). Şu an için filtre kaldırıldı.
* **Kural:** Public INSERT/SELECT açık.

### Tablo: `etsy_products` (YENİ - Ürün Kataloğu)
- listing_id (TEXT, PK) -> Etsy Ürün Numarası
- name (TEXT)
- credits (INT) -> Verilecek Kredi Miktarı
- is_unlimited (BOOLEAN) -> Sınırsız paket mi?
* **Kural:** Sadece admin erişebilir.

## 3. SAYFA YAPISI

### `/app/page.tsx` (Dashboard)
- Etkinlik Listesi, QR Kod, Kredi Gösterimi.
- Yönetim Paneli: Davetli Listesi + Galeri Moderasyonu (Silme).
- **Yasal Linkler:** Footer'da `/legal/terms` ve `/legal/privacy` linkleri mevcut.

### `/app/create/page.tsx` (Tasarım Stüdyosu)
- Split View (Editör / Önizleme).

### `/app/[slug]/page.tsx` (Misafir Deneyimi)
- Dinamik Tasarım.
- Kilitli Galeri.
- Sosyal Galeri (Yükleme, Beğeni, Yorumlar).

### `/app/legal/terms/page.tsx`
- Kullanım Şartları (Placeholder).

### `/app/legal/privacy/page.tsx`
- Gizlilik Politikası ve KVKK (Placeholder).

## 4. KRİTİK İŞ KURALLARI
1. **Kredi Tüketimi:** Etkinlik oluştururken -1 düşer.
2. **Slug:** Türkçe karakterler temizlenir + Random ID eklenir.
3. **Etsy Webhook (Make.com):** Etsy satışı -> Vercel API (`/api/webhook/etsy`) -> Supabase Kredi Yükleme (Otomatik).
4. **Yorum Moderasyonu:** Status filtresi kaldırılmıştır, tüm yorumlar anında yayınlanır.