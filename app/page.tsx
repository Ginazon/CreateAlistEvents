'use client'

import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import { QRCodeCanvas } from 'qrcode.react'
import Link from 'next/link'
import { useRouter } from 'next/navigation' 

export default function Dashboard() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  
  // DATA/LISTE STATE
  const [credits, setCredits] = useState<number | null>(null)
  const [myEvents, setMyEvents] = useState<any[]>([])
  
  // UI STATE
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [showQrId, setShowQrId] = useState<string | null>(null)
  const [guests, setGuests] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'guests' | 'photos'>('guests')
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [origin, setOrigin] = useState('')

  // --- YENİ: DÜZENLEME (EDIT) STATE'LERİ ---
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  
  const [editTitle, setEditTitle] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editLocName, setEditLocName] = useState('')
  const [editLocUrl, setEditLocUrl] = useState('')
  const [editMessage, setEditMessage] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
        setOrigin(window.location.origin)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchMyEvents(session.user.id)
        fetchCredits(session.user.id)
      } else {
        router.push('/landing')
      }
    })
  }, [router])

  // --- FONKSİYONLAR ---

  const fetchMyEvents = async (userId: string) => {
    const { data } = await supabase.from('events').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (data) setMyEvents(data)
  }

  const fetchCredits = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('credits').eq('id', userId).single()
    if (data) setCredits(data.credits)
  }

  const fetchEventDetails = async (eventId: string) => {
    setSelectedEventId(eventId)
    setLoadingDetails(true)
    const { data: g } = await supabase.from('guests').select('*').eq('event_id', eventId).order('created_at', { ascending: false })
    if (g) setGuests(g)
    const { data: p } = await supabase.from('photos').select('*').eq('event_id', eventId).order('created_at', { ascending: false })
    if (p) setPhotos(p)
    setLoadingDetails(false)
  }

  const deletePhoto = async (id: string) => {
    if (!confirm('Silmek istediğine emin misin?')) return
    await supabase.from('photos').delete().eq('id', id)
    setPhotos(photos.filter(p => p.id !== id))
  }

  const downloadQRCode = (slug: string) => {
    const canvas = document.getElementById(`qr-${slug}`) as HTMLCanvasElement
    if (canvas) {
        const link = document.createElement("a"); link.href = canvas.toDataURL("image/png"); link.download = `${slug}-qr.png`; link.click();
    }
  }

  // --- YENİ: DÜZENLEME FONKSİYONLARI ---
  
  const openEditModal = (event: any) => {
    setEditingEventId(event.id)
    setEditTitle(event.title)
    // Tarih formatını input'a uygun hale getir (YYYY-MM-DDTHH:MM)
    const dateStr = event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : ''
    setEditDate(dateStr)
    setEditLocName(event.location_name || '')
    setEditLocUrl(event.location_url || '')
    setEditMessage(event.message || '')
    setShowEditModal(true)
  }

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    const { error } = await supabase.from('events').update({
        title: editTitle,
        event_date: editDate,
        location_name: editLocName,
        location_url: editLocUrl,
        message: editMessage
    }).eq('id', editingEventId)

    if (error) {
        alert('Hata: ' + error.message)
    } else {
        // Listeyi Yerel Olarak Güncelle (Tekrar fetch yapmaya gerek yok)
        setMyEvents(myEvents.map(ev => ev.id === editingEventId ? {
            ...ev, 
            title: editTitle, 
            event_date: editDate, 
            location_name: editLocName, 
            location_url: editLocUrl, 
            message: editMessage 
        } : ev))
        
        setShowEditModal(false)
        alert('Etkinlik güncellendi! ✅')
    }
    setIsUpdating(false)
  }

  // --- RENDER ---

  if (!session) {
    return <div className="h-screen flex items-center justify-center text-xl text-gray-500">Yönlendiriliyor...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* 1. ÜST BAŞLIK */}
        <div className="flex justify-between items-center bg-white p-6 rounded-t-xl shadow-sm border border-b-0">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Cereget Dashboard</h1>
                <p className="text-gray-500 text-sm">Etkinliklerini buradan yönet.</p>
            </div>
            <button onClick={() => supabase.auth.signOut()} className="text-gray-400 hover:text-black text-sm underline shrink-0">Çıkış</button>
        </div>
        
        {/* 2. AKSİYON BAR (Mobil Uyumlu) */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-b-xl shadow-lg border-b border-x mb-8 space-y-3 md:space-y-0">
            <div className="order-2 md:order-1 bg-yellow-50 text-yellow-700 px-6 py-3 rounded-xl font-bold border border-yellow-200 flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
                <div className="bg-yellow-200 text-yellow-800 p-1 rounded-full">💰</div>
                <div>
                  <p className="text-xs uppercase font-bold">Kredilerim</p>
                  <p className="text-xl font-bold text-gray-800">{credits !== null ? credits : '...'}</p>
                </div>
            </div>
            <div className="order-1 md:order-2 w-full md:w-auto">
                <Link href="/create" className="w-full">
                    <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 hover:scale-[1.01] transition w-full">
                        + Yeni Etkinlik Oluştur
                    </button>
                </Link>
            </div>
        </div>

        {/* 3. ETKİNLİK LİSTESİ */}
        <div className="space-y-4">
            {myEvents.length === 0 && <div className="text-center py-10 text-gray-400 bg-white rounded-xl border">Henüz hiç etkinliğin yok.</div>}
            
            {myEvents.map(event => (
                <div key={event.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition hover:shadow-md">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                             <div className="w-2 h-12 rounded-full" style={{ backgroundColor: event.design_settings?.theme }}></div>
                             <div>
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    {event.title}
                                    {/* YENİ: Düzenle Butonu (Kalem İkonu) */}
                                    <button onClick={() => openEditModal(event)} className="text-gray-400 hover:text-indigo-600 transition" title="Düzenle">
                                        ✏️
                                    </button>
                                </h3>
                                <a href={`/${event.slug}`} target="_blank" className="text-indigo-500 text-xs font-medium bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100">
                                    {origin}/{event.slug} ↗
                                </a>
                             </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowQrId(showQrId === event.id ? null : event.id)} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black transition">📱 QR Kod</button>
                            <button onClick={() => selectedEventId === event.id ? setSelectedEventId(null) : fetchEventDetails(event.id)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Yönet</button>
                        </div>
                    </div>

                    {/* QR PENCERESİ */}
                    {showQrId === event.id && (
                        <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200 flex flex-col items-center animate-fadeIn">
                            <div className="p-3 bg-white rounded shadow-sm mb-4"><QRCodeCanvas id={`qr-${event.slug}`} value={`${origin}/${event.slug}`} size={160} level={"H"}/></div>
                            <button onClick={() => downloadQRCode(event.slug)} className="mt-2 text-sm text-indigo-600 font-bold hover:underline">📥 İndir</button>
                        </div>
                    )}

                    {/* YÖNETİM PANELİ (Davetliler & Fotoğraflar) */}
                    {selectedEventId === event.id && (
                        <div className="mt-6 border-t pt-6">
                            <div className="flex gap-6 border-b border-gray-100 mb-4 pb-1">
                                <button onClick={() => setActiveTab('guests')} className={`pb-2 px-1 text-sm font-bold transition ${activeTab==='guests' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400'}`}>Davetliler ({guests.length})</button>
                                <button onClick={() => setActiveTab('photos')} className={`pb-2 px-1 text-sm font-bold transition ${activeTab==='photos' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400'}`}>Fotoğraflar ({photos.length})</button>
                            </div>

                            {loadingDetails ? <p className="text-gray-400 text-sm">Yükleniyor...</p> : (
                                activeTab === 'guests' ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-100 text-gray-500 uppercase text-xs"><tr><th className="px-4 py-2">İsim</th><th className="px-4 py-2">Email</th><th className="px-4 py-2">Durum</th><th className="px-4 py-2">Kişi</th></tr></thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {guests.map(g => (
                                                    <tr key={g.id}><td className="px-4 py-3 font-medium">{g.name}</td><td className="px-4 py-3 text-gray-500">{g.email}</td><td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${g.status==='katiliyor'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{g.status}</span></td><td className="px-4 py-3">+{g.plus_one}</td></tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {photos.map(p => (
                                            <div key={p.id} className="relative group">
                                                <img src={p.image_url} className="h-24 w-full object-cover rounded"/>
                                                <button onClick={() => deletePhoto(p.id)} className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded shadow">Sil</button>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>
      
       <footer className="mt-12 pt-6 border-t border-gray-200 max-w-5xl mx-auto text-center">
        <div className="flex justify-center space-x-6 text-sm text-gray-500">
          <Link href="/legal/terms" className="hover:text-black">Kullanım Şartları</Link>
          <Link href="/legal/privacy" className="hover:text-black">Gizlilik ve KVKK</Link>
          <button onClick={() => supabase.auth.signOut()} className="hover:text-black">Çıkış Yap</button>
        </div>
        <p className="mt-3 text-xs text-gray-400">© 2025 Cereget. Tüm hakları saklıdır.</p>
      </footer>

      {/* --- YENİ: DÜZENLEME MODALI --- */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Etkinliği Düzenle ✏️</h3>
                    <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-black text-2xl">&times;</button>
                </div>
                
                <form onSubmit={handleUpdateEvent} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">BAŞLIK</label>
                        <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full border p-2 rounded outline-none focus:border-indigo-500"/>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">DAVET MESAJI</label>
                        <textarea value={editMessage} onChange={e => setEditMessage(e.target.value)} className="w-full border p-2 rounded outline-none focus:border-indigo-500 h-20 text-sm"/>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-bold text-gray-500 mb-1">TARİH</label>
                             <input type="datetime-local" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full border p-2 rounded outline-none focus:border-indigo-500"/>
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 mb-1">MEKAN ADI</label>
                             <input type="text" value={editLocName} onChange={e => setEditLocName(e.target.value)} className="w-full border p-2 rounded outline-none focus:border-indigo-500"/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">HARİTA LİNKİ (URL)</label>
                        <input type="text" value={editLocUrl} onChange={e => setEditLocUrl(e.target.value)} className="w-full border p-2 rounded outline-none focus:border-indigo-500 text-sm"/>
                    </div>

                    <div className="pt-2">
                        <button type="submit" disabled={isUpdating} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50">
                            {isUpdating ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  )
}