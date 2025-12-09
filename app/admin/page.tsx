'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

// Admin Panelinde Client-Side Auth yeterli
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ sales: 0, credits: 0, packages: 0 })
  
  // Paket Ekleme Form State'leri
  const [listingId, setListingId] = useState('')
  const [etsyLink, setEtsyLink] = useState('') // YENİ: Link State'i
  const [packageName, setPackageName] = useState('')
  const [credits, setCredits] = useState('')
  const [packages, setPackages] = useState<any[]>([])

  // Giriş Kontrolü
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        checkAdmin(session.user.email)
      } else {
        setLoading(false)
      }
    })
  }, [])

  const checkAdmin = async (email: string | undefined) => {
    if (email !== 'admin@cereget.com' && email !== 'onur.kaynar@hotmail.com') { // Admin maillerini buraya ekle
       alert('Yetkisiz Giriş!')
       window.location.href = '/'
    } else {
       fetchStats()
       fetchPackages()
       setLoading(false)
    }
  }

  const fetchStats = async () => {
      // Basit istatistikler (Geliştirilebilir)
      const { data: packs } = await supabase.from('credit_packages').select('sales_count, credits_amount')
      let totalSales = 0
      let totalCreditsDistributed = 0
      
      if (packs) {
          packs.forEach(p => {
              totalSales += (p.sales_count || 0)
              totalCreditsDistributed += (p.sales_count || 0) * p.credits_amount
          })
      }
      
      const { count } = await supabase.from('credit_packages').select('*', { count: 'exact' })

      setStats({
          sales: totalSales,
          credits: totalCreditsDistributed,
          packages: count || 0
      })
  }

  const fetchPackages = async () => {
      const { data } = await supabase.from('credit_packages').select('*').order('created_at', { ascending: false })
      if (data) setPackages(data)
  }

  const handleCreatePackage = async () => {
      if (!listingId || !packageName || !credits || !etsyLink) {
          alert('Lütfen tüm alanları doldurun!')
          return
      }

      const { error } = await supabase.from('credit_packages').insert([{
          etsy_listing_id: listingId,
          etsy_link: etsyLink, // YENİ: Linki kaydediyoruz
          package_name: packageName,
          credits_amount: parseInt(credits),
          sales_count: 0
      }])

      if (error) {
          alert('Hata: ' + error.message)
      } else {
          alert('Paket Başarıyla Oluşturuldu!')
          setListingId('')
          setEtsyLink('')
          setPackageName('')
          setCredits('')
          fetchPackages()
          fetchStats()
      }
  }

  const handleDeletePackage = async (id: string) => {
      if(!confirm('Bu paketi silmek istediğine emin misin?')) return
      await supabase.from('credit_packages').delete().eq('id', id)
      fetchPackages()
  }

  if (loading) return <div className="p-10">Yükleniyor...</div>
  if (!session) return <div className="p-10">Lütfen Giriş Yapın</div>

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">👑 Admin Paneli</h1>
                    <p className="text-gray-500">Etsy Entegrasyon ve Satış Takibi</p>
                </div>
                <Link href="/">
                    <button className="bg-white border border-gray-300 px-4 py-2 rounded shadow-sm hover:bg-gray-50 text-sm">
                        ← Uygulamaya Dön
                    </button>
                </Link>
            </div>

            {/* İSTATİSTİK KARTLARI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-gray-400 text-xs font-bold uppercase mb-1">Toplam Satış Adedi</h3>
                    <p className="text-3xl font-bold text-indigo-600">{stats.sales}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-gray-400 text-xs font-bold uppercase mb-1">Dağıtılan Toplam Kredi</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.credits}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-gray-400 text-xs font-bold uppercase mb-1">Aktif Paketler</h3>
                    <p className="text-3xl font-bold text-gray-800">{stats.packages}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* SOL: YENİ PAKET EKLEME */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">📦 Yeni Etsy Paketi Tanımla</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Etsy Listing ID</label>
                            <input 
                                type="text" 
                                value={listingId}
                                onChange={e => setListingId(e.target.value)}
                                placeholder="Örn: 12345678"
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <p className="text-xs text-gray-400 mt-1">Etsy ürün URL'sindeki sayıdır.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Etsy Ürün Linki (Tam URL)</label>
                            <input 
                                type="text" 
                                value={etsyLink}
                                onChange={e => setEtsyLink(e.target.value)}
                                placeholder="https://www.etsy.com/listing/..."
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Paket Adı (Bizim için)</label>
                            <input 
                                type="text" 
                                value={packageName}
                                onChange={e => setPackageName(e.target.value)}
                                placeholder="Örn: 50 Kredi Paketi"
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Verilecek Kredi</label>
                            <input 
                                type="number" 
                                value={credits}
                                onChange={e => setCredits(e.target.value)}
                                placeholder="Örn: 50"
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <button 
                            onClick={handleCreatePackage}
                            className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-black transition"
                        >
                            Paketi Kaydet
                        </button>
                    </div>
                </div>

                {/* SAĞ: MEVCUT PAKETLER LİSTESİ */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                     <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                         <h3 className="font-bold text-gray-700 text-sm">Tanımlı Paketler</h3>
                         <button onClick={fetchPackages} className="text-xs text-indigo-600 hover:underline">Yenile</button>
                     </div>
                     
                     <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                        {packages.length === 0 && <p className="p-6 text-center text-gray-400 italic">Henüz paket tanımlanmadı.</p>}
                        
                        {packages.map(pkg => (
                            <div key={pkg.id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center group">
                                <div>
                                    <div className="font-bold text-gray-800">{pkg.package_name}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        ID: {pkg.etsy_listing_id} • Kredi: <span className="text-green-600 font-bold">{pkg.credits_amount}</span>
                                    </div>
                                    {pkg.etsy_link && (
                                        <a href={pkg.etsy_link} target="_blank" className="text-[10px] text-blue-500 hover:underline block mt-1 truncate max-w-[200px]">
                                            {pkg.etsy_link}
                                        </a>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-center">
                                        <div className="text-xs text-gray-400 uppercase font-bold">Satış</div>
                                        <div className="font-bold">{pkg.sales_count || 0}</div>
                                    </div>
                                    <button 
                                        onClick={() => handleDeletePackage(pkg.id)}
                                        className="bg-red-50 text-red-600 p-2 rounded hover:bg-red-100 transition opacity-0 group-hover:opacity-100"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>

            </div>
        </div>
    </div>
  )
}