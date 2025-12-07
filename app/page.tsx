'use client'

import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import { QRCodeCanvas } from 'qrcode.react'
import Link from 'next/link'

export default function Dashboard() {
  const [session, setSession] = useState<any>(null)
  
  // LOGIN STATE
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  
  // DATA STATE
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

  useEffect(() => {
    setOrigin(window.location.origin)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchMyEvents(session.user.id)
        fetchCredits(session.user.id)
      }
    })
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
    if (!signInError) { window.location.reload(); return }
    
    console.log("Kayıt deneniyor...")
    const { error: signUpError } = await supabase.auth.signUp({ email: loginEmail, password: loginPassword })
    if (signUpError) alert('Hata: ' + signUpError.message)
    else { alert('Hesap oluşturuldu!'); window.location.reload(); }
    setLoginLoading(false)
  }

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

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6 text-indigo-700">Cereget Admin</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" required className="w-full border p-2 rounded" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="E-Posta"/>
            <input type="password" required className="w-full border p-2 rounded" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Şifre"/>
            <button type="submit" disabled={loginLoading} className="w-full bg-indigo-600 text-white py-3 rounded font-bold hover:bg-indigo-700 disabled:opacity-50">
              {loginLoading ? 'Giriş...' : 'Giriş Yap'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* ÜST BAR */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Cereget Dashboard</h1>
                <p className="text-gray-500 text-sm">Etkinliklerini buradan yönet.</p>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl font-bold border border-yellow-200 flex items-center gap-2">
                    💰 <span>{credits ?? '...'} Kredi</span>
                </div>
                {/* YENİ OLUŞTUR BUTONU ➕ */}
                <Link href="/create">
                    <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 hover:scale-105 transition transform">
                        + Yeni Etkinlik Oluştur
                    </button>
                </Link>
                <button onClick={() => supabase.auth.signOut()} className="text-gray-400 hover:text-black text-sm underline">Çıkış</button>
            </div>
        </div>

        {/* ETKİNLİK LİSTESİ */}
        <div className="space-y-4">
            {myEvents.length === 0 && <div className="text-center py-20 text-gray-400">Henüz hiç etkinliğin yok. Yukarıdan oluşturabilirsin.</div>}
            
            {myEvents.map(event => (
                <div key={event.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition hover:shadow-md">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                             <div className="w-2 h-12 rounded-full" style={{ backgroundColor: event.design_settings?.theme }}></div>
                             <div>
                                <h3 className="font-bold text-lg text-gray-800">{event.title}</h3>
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
                            <div className="p-3 bg-white rounded-lg shadow-sm mb-4"><QRCodeCanvas id={`qr-${event.slug}`} value={`${origin}/${event.slug}`} size={160} level={"H"}/></div>
                            <button onClick={() => downloadQRCode(event.slug)} className="text-indigo-600 font-bold hover:underline text-sm">📥 QR Kodunu İndir (.PNG)</button>
                        </div>
                    )}

                    {/* YÖNETİM PANELİ */}
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
                                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs"><tr><th className="px-4 py-2">İsim</th><th className="px-4 py-2">Email</th><th className="px-4 py-2">Durum</th><th className="px-4 py-2">Kişi</th></tr></thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {guests.map(g => (
                                                    <tr key={g.id}><td className="px-4 py-3 font-medium">{g.name}</td><td className="px-4 py-3 text-gray-500">{g.email}</td><td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${g.status==='katiliyor'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{g.status}</span></td><td className="px-4 py-3">+{g.plus_one}</td></tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {guests.length === 0 && <p className="text-gray-400 text-sm italic mt-2">Henüz yanıt yok.</p>}
                                    </div>
                                ) : (
                                    <div>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                            {photos.map(p => (
                                                <div key={p.id} className="relative group rounded-lg overflow-hidden shadow-sm aspect-square">
                                                    <img src={p.image_url} className="w-full h-full object-cover"/>
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center">
                                                        <button onClick={() => deletePhoto(p.id)} className="bg-red-600 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition transform scale-90 group-hover:scale-100">Sil 🗑️</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {photos.length === 0 && <p className="text-gray-400 text-sm italic mt-2">Henüz fotoğraf yok.</p>}
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
        
      </div>
      <footer className="mt-12 pt-6 border-t border-gray-200 max-w-6xl mx-auto text-center">
        <div className="flex justify-center space-x-6 text-sm text-gray-500">
          <Link href="/legal/terms" className="hover:text-indigo-600">Kullanım Şartları</Link>
          <Link href="/legal/privacy" className="hover:text-indigo-600">Gizlilik ve KVKK</Link>
          <button onClick={() => supabase.auth.signOut()} className="hover:text-indigo-600">Çıkış Yap</button>
        </div>
        <p className="mt-3 text-xs text-gray-400">© 2025 Cereget. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  )
}