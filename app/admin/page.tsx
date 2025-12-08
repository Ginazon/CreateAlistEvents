'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'

// 🔒 GÜVENLİK: Sadece bu mailler girebilir
const ADMIN_EMAILS = ['onur.kaynar38@gmail.com', 'onur.kaynar@hotmail.com'] 

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [packages, setPackages] = useState<any[]>([])
  
  // Form State
  const [listingId, setListingId] = useState('')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState(10)

  useEffect(() => {
    checkAdmin()
    fetchPackages()
  }, [])

  const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !ADMIN_EMAILS.includes(session.user.email || '')) {
          // Admin değilse ana sayfaya at
          router.push('/') 
      } else {
          setLoading(false)
      }
  }

  const fetchPackages = async () => {
      const { data } = await supabase.from('credit_packages').select('*').order('created_at', { ascending: false })
      if(data) setPackages(data)
  }

  const handleAddPackage = async (e: React.FormEvent) => {
      e.preventDefault()
      const { error } = await supabase.from('credit_packages').insert([{
          etsy_listing_id: listingId,
          package_name: name,
          credits_amount: amount
      }])

      if (error) alert('Hata: ' + error.message)
      else {
          alert('Paket Eklendi! 🚀')
          setListingId(''); setName(''); setAmount(10)
          fetchPackages()
      }
  }

  const handleDelete = async (id: string) => {
      if(!confirm('Bu paketi silmek istediğine emin misin?')) return
      await supabase.from('credit_packages').delete().eq('id', id)
      fetchPackages()
  }

  if (loading) return <div className="h-screen flex items-center justify-center text-gray-500">Yetki Kontrolü...</div>

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">👑 Admin Paneli</h1>
                <p className="text-gray-500">Etsy Entegrasyon ve Satış Takibi</p>
            </div>
            <button onClick={() => router.push('/')} className="bg-white border px-4 py-2 rounded shadow-sm text-sm hover:bg-gray-50">
                ← Uygulamaya Dön
            </button>
        </div>

        {/* ÖZET KARTLARI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-gray-500 text-xs font-bold uppercase">Toplam Satış Adedi</h3>
                <p className="text-3xl font-bold text-indigo-600 mt-2">
                    {packages.reduce((acc, curr) => acc + (curr.sales_count || 0), 0)}
                </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-gray-500 text-xs font-bold uppercase">Dağıtılan Toplam Kredi</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">
                    {packages.reduce((acc, curr) => acc + ((curr.sales_count || 0) * curr.credits_amount), 0)}
                </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-gray-500 text-xs font-bold uppercase">Aktif Paketler</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">{packages.length}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* SOL: YENİ PAKET EKLEME */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100 h-fit">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    📦 Yeni Etsy Paketi Tanımla
                </h2>
                <form onSubmit={handleAddPackage} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Etsy Listing ID</label>
                        <input required type="text" value={listingId} onChange={e => setListingId(e.target.value)} 
                               className="w-full border p-2 rounded text-sm font-mono bg-gray-50" placeholder="Örn: 14829301" />
                        <p className="text-[10px] text-gray-400 mt-1">Etsy ürün URL'sindeki sayıdır.</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Paket Adı (Bizim için)</label>
                        <input required type="text" value={name} onChange={e => setName(e.target.value)} 
                               className="w-full border p-2 rounded text-sm" placeholder="Örn: Başlangıç Paketi" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Verilecek Kredi</label>
                        <input required type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} 
                               className="w-full border p-2 rounded text-sm" placeholder="10" />
                    </div>
                    <button type="submit" className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition">
                        Paketi Kaydet
                    </button>
                </form>
            </div>

            {/* SAĞ: LİSTE */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-bold border-b">
                        <tr>
                            <th className="px-6 py-4">Paket Adı</th>
                            <th className="px-6 py-4">Etsy ID</th>
                            <th className="px-6 py-4">Kredi</th>
                            <th className="px-6 py-4">Satış</th>
                            <th className="px-6 py-4 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {packages.map(pkg => (
                            <tr key={pkg.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 font-bold text-gray-800">{pkg.package_name}</td>
                                <td className="px-6 py-4 font-mono text-xs text-indigo-600 bg-indigo-50 w-fit rounded px-2">{pkg.etsy_listing_id}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                                        {pkg.credits_amount} Kredi
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-600">{pkg.sales_count}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(pkg.id)} className="text-red-500 hover:text-red-700 font-bold text-xs border border-red-200 px-3 py-1 rounded hover:bg-red-50">
                                        Sil
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {packages.length === 0 && (
                            <tr><td colSpan={5} className="text-center py-10 text-gray-400 italic">Henüz paket tanımlanmadı.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
      </div>
    </div>
  )
}