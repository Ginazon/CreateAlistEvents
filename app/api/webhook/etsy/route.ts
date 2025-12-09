import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// DİKKAT: Burası Service Role Key kullanmalı (Admin yetkisi için)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // .env.local dosyasında bu anahtarın olduğundan emin ol!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, listing_id } = body

    console.log("🔔 Webhook Tetiklendi!", { email, listing_id })

    // 1. Gelen veriyi kontrol et
    if (!email || !listing_id) {
      return NextResponse.json({ error: 'Eksik bilgi: Email veya Listing ID yok' }, { status: 400 })
    }

    // 2. Hangi paket satın alındı? (Kredi miktarını bul)
    // listing_id string gelebilir, veritabanı text ise sorun yok.
    const { data: packageData, error: packageError } = await supabaseAdmin
      .from('credit_packages')
      .select('credits_amount')
      .eq('etsy_listing_id', String(listing_id)) // String'e çevirerek ara
      .single()

    if (packageError || !packageData) {
      console.error("❌ Paket bulunamadı:", listing_id)
      return NextResponse.json({ error: 'Paket tanimli degil' }, { status: 400 })
    }

    const creditsToAdd = packageData.credits_amount
    console.log(`📦 Paket Bulundu: ${creditsToAdd} Kredi`)

    // 3. Kullanıcı sistemde kayıtlı mı? (Profiles tablosunda ara)
    // Not: Profiles tablosunda 'email' sütunu olmayabilir (Auth tablosundadır).
    // Ancak genellikle User ID'yi bulmak için Auth admin API kullanılır.
    
    // A. Auth kullanıcısını bulmaya çalış
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    const user = users?.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (user) {
      // --- SENARYO 1: KULLANICI VAR (Kredi Yükle) ---
      console.log("✅ Kullanıcı bulundu:", user.id)

      // Mevcut krediyi çek
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single()

      const currentCredits = profile?.credits || 0
      const newBalance = currentCredits + creditsToAdd

      // Yeni krediyi yaz
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ credits: newBalance })
        .eq('id', user.id)

      if (updateError) throw updateError
      
      return NextResponse.json({ success: true, message: `Kullanıcıya ${creditsToAdd} kredi yüklendi. Yeni bakiye: ${newBalance}` })

    } else {
      // --- SENARYO 2: KULLANICI YOK (Bekleyenlere Ekle) ---
      console.log("⚠️ Kullanıcı bulunamadı, Pending tablosuna yazılıyor...")

      const { error: insertError } = await supabaseAdmin
        .from('pending_credits')
        .insert([{
          email: email.toLowerCase(),
          credits_amount: creditsToAdd,
          source: 'etsy',
          is_claimed: false
        }])

      if (insertError) {
        console.error("❌ Pending Save Error:", insertError)
        return NextResponse.json({ error: 'Pending kayit hatasi: ' + insertError.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: `Kullanıcı yok. ${creditsToAdd} kredi 'pending_credits' tablosuna saklandı.` })
    }

  } catch (error: any) {
    console.error("🔥 Webhook Hatası:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}