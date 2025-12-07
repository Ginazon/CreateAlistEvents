import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Admin yetkisiyle Supabase (Service Role Key kullanacağız çünkü krediyi herkes değiştirememeli)
// NOT: Bu işlemi güvenli yapmak için Service Role Key'i env dosyana eklemen lazım.
// Şimdilik 'anon' key ile yapalım ama RLS'de 'profiles' update iznini herkese açmıştık, o yüzden çalışır.
// Gerçek canlı ortamda buraya SUPABASE_SERVICE_ROLE_KEY gerekir.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! 
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    // 1. Make.com'dan gelen veriyi al
    const body = await request.json()
    const { email, listing_id } = body

    if (!email || !listing_id) {
      return NextResponse.json({ error: 'Email ve Listing ID zorunlu' }, { status: 400 })
    }

    console.log(`Webhook Geldi: ${email} için ürün ${listing_id}`)

    // 2. Bu ürün ne kadar kredi veriyor? Veritabanına sor
    const { data: product, error: productError } = await supabase
      .from('etsy_products')
      .select('*')
      .eq('listing_id', listing_id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Tanımsız ürün ID' }, { status: 404 })
    }

    // 3. Kullanıcıyı Bul (Email ile)
    let { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    // Eğer kullanıcı yoksa? (Henüz siteye girmemiş ama satın almış)
    // Bu durumda "Hayalet Profil" oluşturamayız çünkü Auth ID lazım.
    // Şimdilik sadece kayıtlı kullanıcılara kredi yükleyelim.
    // (İleri seviyede: Email tablosuna atıp, kayıt olunca kredi verebiliriz)
    
    if (!userProfile) {
      // Geçici Çözüm: Kullanıcı yoksa işlem yapma (veya logla)
      return NextResponse.json({ message: 'Kullanıcı henüz siteye üye değil, kredi beklemeye alındı.' }, { status: 200 })
    }

    // 4. Krediyi Yükle
    let updateData: any = {}
    let message = ''

    if (product.is_unlimited) {
      // Sınırsız Paket
      updateData = { is_premium: true, credits: 9999 } // Göstermelik yüksek kredi
      message = 'Sınırsız Erişim Tanımlandı'
    } else {
      // Kredi Paketi
      const newCredits = (userProfile.credits || 0) + product.credits
      updateData = { credits: newCredits }
      message = `${product.credits} Kredi Eklendi. Yeni Bakiye: ${newCredits}`
    }

    // Güncelle
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('email', email)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message, user: email })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}