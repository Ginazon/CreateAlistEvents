import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Admin Yetkisi (Service Role) ile Supabase istemcisi
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, listing_id, order_id, quantity = 1 } = body

    console.log("🔔 Webhook Tetiklendi!", { email, listing_id, order_id, quantity })

    // ✅ 1. Zorunlu alanları kontrol et
    if (!email || !listing_id || !order_id) {
      console.error("❌ Eksik bilgi:", { email, listing_id, order_id })
      return NextResponse.json({ 
        error: 'Eksik bilgi: Email, Listing ID veya Order ID yok' 
      }, { status: 400 })
    }

    // ✅ 2. Bu order daha önce işlendi mi? (Duplicate kontrolü)
    const { data: existingTransaction } = await supabaseAdmin
      .from('credit_transactions')
      .select('id, credits_amount')
      .eq('order_id', order_id)
      .single()

    if (existingTransaction) {
      console.warn("⚠️ Duplicate Order! Bu sipariş zaten işlendi:", order_id)
      return NextResponse.json({ 
        success: false, 
        message: `Bu sipariş (${order_id}) zaten işlenmiş. ${existingTransaction.credits_amount} kredi daha önce eklendi.`,
        duplicate: true
      })
    }

    // ✅ 3. Hangi paket satın alındı?
    const { data: packageData, error: packageError } = await supabaseAdmin
      .from('credit_packages')
      .select('id, credits_amount, package_name, sales_count')
      .eq('etsy_listing_id', String(listing_id))
      .single()

    if (packageError || !packageData) {
      console.error("❌ Paket bulunamadı:", listing_id)
      return NextResponse.json({ 
        error: `Paket tanımlı değil (Listing ID: ${listing_id})` 
      }, { status: 400 })
    }

    // ✅ 4. Toplam krediyi hesapla (quantity ile çarp)
    const creditsPerItem = packageData.credits_amount
    const totalCredits = creditsPerItem * quantity

    console.log(`📦 Paket: ${packageData.package_name}`)
    console.log(`💳 Kredi/Adet: ${creditsPerItem} | Adet: ${quantity} | Toplam: ${totalCredits}`)

    // ✅ 5. Paketin satış sayısını güncelle
    await supabaseAdmin
      .from('credit_packages')
      .update({ sales_count: (packageData.sales_count || 0) + quantity })
      .eq('id', packageData.id)

    const normalizedEmail = email.toLowerCase().trim()

    // ✅ 6. Kullanıcı sistemde kayıtlı mı?
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
    const user = users?.find(u => u.email?.toLowerCase() === normalizedEmail)

    if (user) {
      // --- SENARYO 1: KULLANICI VAR (Hesaba Direkt Yükle) ---
      console.log("✅ Kullanıcı bulundu:", user.id)

      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single()

      const currentCredits = profile?.credits || 0
      const newBalance = currentCredits + totalCredits

      // Kredileri güncelle
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ credits: newBalance })
        .eq('id', user.id)

      if (updateError) {
        console.error("❌ Kredi güncelleme hatası:", updateError)
        throw updateError
      }

      // Transaction log'a kaydet
      await supabaseAdmin
        .from('credit_transactions')
        .insert([{
          user_id: user.id,
          email: normalizedEmail,
          credits_amount: totalCredits,
          transaction_type: 'purchase',
          source: 'etsy',
          order_id: order_id,
          listing_id: String(listing_id),
          quantity: quantity,
          metadata: {
            package_name: packageData.package_name,
            credits_per_item: creditsPerItem,
            old_balance: currentCredits,
            new_balance: newBalance
          }
        }])

      console.log(`✅ ${totalCredits} kredi eklendi. Yeni bakiye: ${newBalance}`)
      
      return NextResponse.json({ 
        success: true, 
        message: `${totalCredits} kredi eklendi (${quantity} x ${creditsPerItem})`,
        user_id: user.id,
        old_balance: currentCredits,
        new_balance: newBalance
      })

    } else {
      // --- SENARYO 2: KULLANICI YOK (Pending'e Ekle) ---
      console.log("⚠️ Kullanıcı bulunamadı, pending_credits'e ekleniyor...")

      // Aynı order_id ile pending'de var mı kontrol et
      const { data: existingPending } = await supabaseAdmin
        .from('pending_credits')
        .select('id')
        .eq('order_id', order_id)
        .single()

      if (existingPending) {
        console.warn("⚠️ Bu order zaten pending'de:", order_id)
        return NextResponse.json({ 
          success: false, 
          message: `Bu sipariş (${order_id}) zaten pending listesinde.`,
          duplicate: true
        })
      }

      const { error: insertError } = await supabaseAdmin
        .from('pending_credits')
        .insert([{
          email: normalizedEmail,
          credits_amount: totalCredits,
          source: 'etsy',
          is_claimed: false,
          listing_id: String(listing_id),
          order_id: order_id,
          quantity: quantity
        }])

      if (insertError) {
        console.error("❌ Pending kayıt hatası:", insertError)
        throw insertError
      }

      // Transaction log'a da kaydet (user_id olmadan)
      await supabaseAdmin
        .from('credit_transactions')
        .insert([{
          user_id: null,
          email: normalizedEmail,
          credits_amount: totalCredits,
          transaction_type: 'purchase',
          source: 'etsy',
          order_id: order_id,
          listing_id: String(listing_id),
          quantity: quantity,
          metadata: {
            package_name: packageData.package_name,
            credits_per_item: creditsPerItem,
            status: 'pending'
          }
        }])

      console.log(`✅ ${totalCredits} kredi pending'e eklendi (${quantity} x ${creditsPerItem})`)

      return NextResponse.json({ 
        success: true, 
        message: `Kullanıcı henüz kayıtlı değil. ${totalCredits} kredi pending listesine eklendi.`,
        pending: true,
        credits: totalCredits
      })
    }

  } catch (error: any) {
    console.error("🔥 Webhook Hatası:", error.message, error)
    return NextResponse.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 })
  }
}