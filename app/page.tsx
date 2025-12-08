'use client'

import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import { QRCodeCanvas } from 'qrcode.react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import GuestManager from './components/GuestManager'

export default function Dashboard() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  
  const [credits, setCredits] = useState<number | null>(null)
  const [myEvents, setMyEvents] = useState<any[]>([])
  
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [showQrId, setShowQrId] = useState<string | null>(null)
  const [guests, setGuests] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'guests' | 'photos'>('guests')
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin)

    supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
      const session = data.session
      setSession(session)
      if (session) {
        fetchMyEvents(session.user.id)
        fetchCredits(session.user.id)
      } else {
        router.push('/landing')
      }
    })
  }, [router])

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

  if (!session) return <div className="h-screen flex items-center justify-center text-xl text-gray-500">Yükleniyor...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center bg-white p-6 rounded-t-xl shadow-sm border border-b-0">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Cereget Yönetim Paneli</h1>
                <p className="text-gray-500 text-sm">Etkinliklerini buradan yönet.</p>
            </div>
            <button onClick={() => supabase.auth.signOut()} className="text-gray-400 hover:text-black text-sm underline shrink-0">Çıkış Yap</button>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-b-xl shadow-lg border-b border-x mb-8 space-y-3 md:space-y-0">
            <div className="order-2 md:order-1 bg-yellow-50 text-yellow-700 px-6 py-3 rounded-xl font-bold border border-yellow-200 flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
                <div className="bg-yellow-200 text-yellow-800 p-1 rounded-full">💰</div>
                <div><p className="text-xs uppercase font-bold">Kredilerim</p><p className="text-xl font-bold text-gray-800">{credits !== null ? credits : '...'}</p></div>
            </div>
            <div className="order-1 md:order-2 w-full md:w-auto">
                <Link href="/create" className="w-full">
                    <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 hover:scale-[1.01] transition w-full">+ Yeni Etkinlik Oluştur</button>
                </Link>
            </div>
        </div>

        <div className="space-y-4">
            {myEvents.length === 0 && <div className="text-center py-10 text-gray-400 bg-white rounded-xl border">Henüz hiç etkinliğin yok.</div>}
            
            {myEvents.map(event => (
                <div key={event.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition hover:shadow-md">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                             <div className="w-2 h-12 rounded-full" style={{ backgroundColor: event.design_settings?.theme }}></div>
                             <div>
                                <h3 className="font-bold text-lg">{event.title}</h3>
                                <a href={`/${event.slug}`} target="_blank" className="text-indigo-500 text-xs font-medium bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100">{origin}/{event.slug} ↗</a>
                             </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button onClick={() => setShowQrId(showQrId === event.id ? null : event.id)} className="bg-gray-800 text-white px-3 py-2 rounded text-sm font-medium hover:bg-black transition">📱 QR</button>
                            <Link href={`/create?edit=${event.id}`}><button className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition">✏️ Düzenle</button></Link>
                            <button onClick={() => selectedEventId === event.id ? setSelectedEventId(null) : fetchEventDetails(event.id)} className="bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm font-medium hover:bg-gray-200 transition">⚙️ Yönet</button>
                        </div>
                    </div>

                    {showQrId === event.id && (
                        <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200 flex flex-col items-center animate-fadeIn">
                            <div className="p-3 bg-white rounded shadow-sm mb-4"><QRCodeCanvas id={`qr-${event.slug}`} value={`${origin}/${event.slug}`} size={160} level={"H"}/></div>
                            <button onClick={() => downloadQRCode(event.slug)} className="mt-2 text-sm text-indigo-600 font-bold hover:underline">📥 İndir</button>
                        </div>
                    )}

                    {selectedEventId === event.id && (
                        <div className="mt-6 border-t pt-6">
                            <div className="flex gap-6 border-b border-gray-100 mb-6 pb-1">
                                <button onClick={() => setActiveTab('guests')} className={`pb-2 px-3 text-sm font-bold transition ${activeTab==='guests' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>📋 Davetli Listesi & Gönderim</button>
                                <button onClick={() => setActiveTab('photos')} className={`pb-2 px-3 text-sm font-bold transition ${activeTab==='photos' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>📸 Galeri ({photos.length})</button>
                            </div>
                            {loadingDetails ? <p className="text-gray-400 text-sm">Yükleniyor...</p> : (
                                activeTab === 'guests' ? (
                                    <GuestManager eventId={event.id} eventSlug={event.slug} eventTitle={event.title} />
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {photos.length === 0 && <p className="col-span-4 text-center text-gray-400 text-sm py-4">Henüz fotoğraf yüklenmemiş.</p>}
                                        {photos.map(p => (
                                            <div key={p.id} className="relative group">
                                                <img src={p.image_url} className="h-24 w-full object-cover rounded shadow-sm"/>
                                                <button onClick={() => deletePhoto(p.id)} className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded shadow hover:bg-red-700">Sil</button>
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
    </div>
  )
}