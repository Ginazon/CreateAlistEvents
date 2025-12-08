import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! 

export async function POST(req: NextRequest) {
  try {
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: 'Server Config Error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await req.json()
    const { email, listing_id } = body

    if (!email || !listing_id) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 })
    }

    console.log(`Webhook Tetiklendi: ${email} - Ürün ${listing_id}`)

    // 1. Paket Bilgisini Al
    const { data: packageData, error: packageError } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('etsy_listing_id', listing_id.toString())
      .single()

    if (packageError || !packageData) {
      return NextResponse.json({ error: 'Tanımsız Paket ID' }, { status: 404 })
    }

    // 2. Kullanıcı Var mı?
    const { data: userData } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    // SENARYO A: Kullanıcı Zaten Üye -> Direkt Yükle
    if (userData) {
      const newCredits = (userData.credits || 0) + packageData.credits_amount
      await supabase.from('profiles').update({ credits: newCredits }).eq('id', userData.id)
      
      // Satış sayacını artır
      await supabase.rpc('increment_sales_count', { row_id: packageData.id })

      return NextResponse.json({ 
        success: true, 
        message: `Mevcut kullanıcıya ${packageData.credits_amount} kredi yüklendi.`,
        status: 'DIRECT_LOAD'
      })
    } 
    
    // SENARYO B: Kullanıcı Yok -> Emanet Kasasına (Pending) Yaz
    else {
      const { error: pendingError } = await supabase.from('pending_credits').insert([{
        email: email,
        credits_amount: packageData.credits_amount,
        listing_id: listing_id.toString()
      }])

      if (pendingError) {
        console.error('Pending Kayıt Hatası:', pendingError)
        return NextResponse.json({ error: 'Pending kayıt hatası' }, { status: 500 })
      }

      // Satış sayacını yine de artır (Para alındı sonuçta)
      await supabase.rpc('increment_sales_count', { row_id: packageData.id })

      return NextResponse.json({ 
        success: true, 
        message: `Kullanıcı bulunamadı. ${packageData.credits_amount} kredi 'Bekleyen' olarak kaydedildi. Üye olunca yüklenecek.`,
        status: 'PENDING_LOAD'
      })
    }

  } catch (error: any) {
    console.error('Webhook Hatası:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}