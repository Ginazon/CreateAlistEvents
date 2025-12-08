import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// DİKKAT: .env.local dosyasında SUPABASE_SERVICE_ROLE_KEY olduğundan emin ol!
// Bu işlem gizli olduğu için Service Key kullanıyoruz.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! 

export async function POST(req: NextRequest) {
  try {
    // 1. Güvenlik Kontrolü
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: 'Server Config Error: Service Key missing' }, { status: 500 })
    }

    // Admin yetkili Supabase istemcisi
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 2. Make.com'dan gelen veriyi al
    const body = await req.json()
    const { email, listing_id } = body

    if (!email || !listing_id) {
      return NextResponse.json({ error: 'Eksik bilgi: Email veya Listing ID yok' }, { status: 400 })
    }

    console.log(`Webhook Tetiklendi: ${email} için ürün ${listing_id}`)

    // 3. Bu ürün Admin Panelinde tanımlı mı? (credit_packages tablosuna bakıyoruz)
    // DÜZELTME: Eski 'etsy_products' yerine yeni 'credit_packages' tablosunu kullanıyoruz.
    const { data: packageData, error: packageError } = await supabase
      .from('credit_packages') 
      .select('*')
      .eq('etsy_listing_id', listing_id.toString()) 
      .single()

    if (packageError || !packageData) {
      console.log('Tanımsız Paket:', listing_id)
      return NextResponse.json({ error: 'Bu Etsy ürünü için kredi paketi tanımlanmamış.' }, { status: 404 })
    }

    // 4. Kullanıcıyı Bul
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    // Kullanıcı yoksa ne yapalım? (Şimdilik hata dönelim)
    if (userError || !userData) {
      console.log('Kullanıcı Bulunamadı:', email)
      // İstersen burada "Pending Credits" tablosuna yazma mantığı eklenebilir (önceki konuşmalarımızda vardı)
      return NextResponse.json({ message: 'Kullanıcı henüz sisteme kayıtlı değil.' }, { status: 200 }) 
    }

    // 5. Krediyi Yükle
    const newCredits = (userData.credits || 0) + packageData.credits_amount
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userData.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // 6. İstatistik Güncelle
    // (Satış sayısını artırmak için basit bir SQL tetikleyici veya manuel update yapılabilir, şimdilik geçiyoruz)

    return NextResponse.json({ 
      success: true, 
      message: `${packageData.credits_amount} kredi yüklendi. Yeni bakiye: ${newCredits}`,
      user: email 
    })

  } catch (error: any) {
    console.error('Webhook Hatası:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}