'use client'

import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import { QRCodeCanvas } from 'qrcode.react'

const THEME_COLORS = [
  { name: 'Klasik Mavi', hex: '#4F46E5' },
  { name: 'Gold (Altın)', hex: '#D97706' },
  { name: 'Rose (Gül)', hex: '#E11D48' },
  { name: 'Zümrüt Yeşil', hex: '#059669' },
  { name: 'Simsiyah', hex: '#111827' },
]

export default function Dashboard() {
  const [session, setSession] = useState<any>(null)
  
  // YENİ: Kredi Bilgisi State'i 💰
  const [credits, setCredits] = useState<number | null>(null)

  // FORM GİRİŞLERİ
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [locationName, setLocationName] = useState('')
  const [locationUrl, setLocationUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0].hex)
  const [uploading, setUploading] = useState(false)

  // LİSTE VERİLERİ
  const [myEvents, setMyEvents] = useState<any[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [showQrId, setShowQrId] = useState<string | null>(null)
  
  // DETAYLAR
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
        fetchCredits(session.user.id) // Krediyi de çek
      }
    })
  }, [])

  const fetchMyEvents = async (userId: string) => {
    const { data } = await supabase.from('events').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (data) setMyEvents(data)
  }

  // YENİ: Kredi Çekme Fonksiyonu 💰
  const fetchCredits = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()
    
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

  const handleTestLogin = async () => {
    const email = 'test@example.com'; const password = 'password123'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) await supabase.auth.signUp({ email, password })
    // Giriş sonrası sayfa yenilenince trigger ile kredi zaten oluşmuş olacak
  }

  const createEvent = async () => {
    if (!title || !slug || !eventDate) return alert('Zorunlu alanları doldurun')
    
    // YENİ: Kredi Kontrolü 🛑
    if (credits !== null && credits < 1) {
        return alert('Yetersiz Kredi! Lütfen kredi yükleyin.')
    }

    setUploading(true)
    let uploadedImageUrl = null

    if (file) {
      const fileName = `${Math.random()}.${file.name.split('.').pop()}`
      const { error } = await supabase.storage.from('event-images').upload(`${session.user.id}/${fileName}`, file)
      if (!error) {
        const { data } = supabase.storage.from('event-images').getPublicUrl(`${session.user.id}/${fileName}`)
        uploadedImageUrl = data.publicUrl
      }
    }

    const { error } = await supabase.from('events').insert([{ 
        title, slug, user_id: session.user.id, image_url: uploadedImageUrl, 
        event_date: eventDate, location_name: locationName, location_url: locationUrl, 
        design_settings: { theme: themeColor } 
    }])

    if (error) {
      alert('Hata: ' + error.message)
    } else {
      // YENİ: Kredi Düşme İşlemi (Frontend'de gösterim için, backend'de trigger yapılabilir ama şimdilik manuel düşelim)
      // Not: Gerçek uygulamada bu işlem sunucuda (Postgres Function) yapılmalıdır.
      const newCredit = (credits || 0) - 1
      await supabase.from('profiles').update({ credits: newCredit }).eq('id', session.user.id)
      setCredits(newCredit)
      
      alert(`Etkinlik Oluşturuldu! 1 Kredi harcandı. Kalan: ${newCredit}`)
      fetchMyEvents(session.user.id)
      setTitle(''); setSlug('')
    }
    setUploading(false)
  }

  if (!session) return <div className="h-screen flex items-center justify-center"><button onClick={handleTestLogin} className="bg-indigo-600 text-white p-3 rounded">Admin Girişi</button></div>

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Cereget Dashboard</h1>
        
        {/* YENİ: KREDİ KARTI 💳 */}
        <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3">
            <div className="bg-yellow-100 text-yellow-700 p-2 rounded-full">💰</div>
            <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Kredilerim</p>
                <p className="text-xl font-bold text-gray-800">{credits !== null ? credits : '...'}</p>
            </div>
            <button className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-bold ml-2 hover:bg-indigo-100">
                + Yükle
            </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* SOL: YENİ ETKİNLİK FORMU */}
        <div className="md:col-span-1 bg-white p-6 rounded-xl shadow h-fit sticky top-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: themeColor }}>Yeni Etkinlik <span className="text-xs font-normal text-gray-400 ml-2">(-1 Kredi)</span></h2>
          <div className="space-y-3">
            <input type="text" placeholder="Etkinlik Adı" className="w-full border p-2 rounded" value={title} onChange={e => setTitle(e.target.value)}/>
            <input type="text" placeholder="slug" className="w-full border p-2 rounded" value={slug} onChange={e => setSlug(e.target.value)}/>
            <div><label className="text-xs text-gray-500">Tarih</label><input type="datetime-local" className="w-full border p-2 rounded" value={eventDate} onChange={e => setEventDate(e.target.value)}/></div>
            <input type="text" placeholder="Mekan Adı" className="w-full border p-2 rounded" value={locationName} onChange={e => setLocationName(e.target.value)}/>
            <input type="text" placeholder="Harita Linki" className="w-full border p-2 rounded" value={locationUrl} onChange={e => setLocationUrl(e.target.value)}/>
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full text-sm"/>
            <div className="flex gap-2 justify-center py-2">{THEME_COLORS.map(c => <button key={c.hex} onClick={() => setThemeColor(c.hex)} className={`w-6 h-6 rounded-full border-2 ${themeColor === c.hex ? 'border-black' : ''}`} style={{ backgroundColor: c.hex }}/>)}</div>

            <button onClick={createEvent} disabled={uploading || (credits || 0) < 1} className="w-full text-white py-3 rounded font-bold disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: themeColor }}>
              {(credits || 0) < 1 ? 'Yetersiz Kredi' : uploading ? 'İşleniyor...' : 'Oluştur (-1 Kredi)'}
            </button>
          </div>
        </div>

        {/* SAĞ: ETKİNLİK LİSTESİ (AYNI) */}
        <div className="md:col-span-2 space-y-4">
            {myEvents.map(event => (
                <div key={event.id} className="bg-white p-4 rounded shadow border-l-4" style={{ borderColor: event.design_settings?.theme }}>
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <div>
                             <h3 className="font-bold text-lg">{event.title}</h3>
                             <a href={`/${event.slug}`} target="_blank" className="text-blue-500 text-xs hover:underline">{origin}/{event.slug} ↗</a>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowQrId(showQrId === event.id ? null : event.id)} className="bg-gray-800 text-white px-3 py-1 rounded text-sm">📱 QR</button>
                            <button onClick={() => selectedEventId === event.id ? setSelectedEventId(null) : fetchEventDetails(event.id)} className="bg-gray-100 px-3 py-1 rounded text-sm">Yönet</button>
                        </div>
                    </div>
                    {showQrId === event.id && (
                        <div className="mt-4 p-4 bg-gray-50 rounded border flex flex-col items-center">
                            <div className="p-2 bg-white rounded shadow-sm"><QRCodeCanvas id={`qr-${event.slug}`} value={`${origin}/${event.slug}`} size={150} level={"H"}/></div>
                            <button onClick={() => downloadQRCode(event.slug)} className="mt-2 text-sm text-indigo-600 font-bold hover:underline">📥 İndir</button>
                        </div>
                    )}
                    {selectedEventId === event.id && (
                        <div className="mt-4 bg-gray-50 p-4 rounded border-t">
                            <div className="flex gap-4 border-b mb-2">
                                <button onClick={() => setActiveTab('guests')} className={`p-1 ${activeTab==='guests' && 'font-bold'}`}>Davetliler ({guests.length})</button>
                                <button onClick={() => setActiveTab('photos')} className={`p-1 ${activeTab==='photos' && 'font-bold'}`}>Fotolar ({photos.length})</button>
                            </div>
                            {loadingDetails ? 'Yükleniyor...' : (
                                activeTab === 'guests' ? (
                                    <ul className="text-sm">{guests.map(g => <li key={g.id} className="border-b py-1">{g.name} ({g.status})</li>)}</ul>
                                ) : (
                                    <div className="grid grid-cols-4 gap-2">{photos.map(p => (
                                        <div key={p.id} className="relative group">
                                            <img src={p.image_url} className="h-20 w-20 object-cover rounded"/>
                                            <button onClick={() => deletePhoto(p.id)} className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1">X</button>
                                        </div>
                                    ))}</div>
                                )
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  )
}