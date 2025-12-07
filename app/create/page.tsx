'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import Link from 'next/link'

const THEME_COLORS = [
  { name: 'Klasik Mavi', hex: '#4F46E5' },
  { name: 'Gold (Altın)', hex: '#D97706' },
  { name: 'Rose (Gül)', hex: '#E11D48' },
  { name: 'Zümrüt Yeşil', hex: '#059669' },
  { name: 'Simsiyah', hex: '#111827' },
]

const FONT_OPTIONS = [
  { name: 'Modern (Inter)', value: "'Inter', sans-serif" },
  { name: 'Şık (Playfair Display)', value: "'Playfair Display', serif" },
  { name: 'El Yazısı (Dancing Script)', value: "'Dancing Script', cursive" },
  { name: 'Okunaklı (Merriweather)', value: "'Merriweather', serif" },
  { name: 'Güçlü (Montserrat)', value: "'Montserrat', sans-serif" },
]

const turkishSlugify = (text: string) => {
  const trMap: { [key: string]: string } = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U' };
  return text.replace(/[çğıöşüÇĞİÖŞÜ]/g, (m) => trMap[m] || m).toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

export default function CreateEventPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)

  // TEMEL BİLGİLER
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [locationName, setLocationName] = useState('')
  const [locationUrl, setLocationUrl] = useState('')
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0].hex)

  // GÖRSELLER
  const [coverFile, setCoverFile] = useState<File | null>(null) // Kapak (Üst)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  
  const [mainFile, setMainFile] = useState<File | null>(null) // Ana (İçerik)
  const [mainPreview, setMainPreview] = useState<string | null>(null)

  // METİN AYARLARI
  const [message, setMessage] = useState('Bu özel günümüzde sizleri de aramızda görmekten mutluluk duyarız.')
  
  // Font & Boyut State'leri
  const [titleFont, setTitleFont] = useState(FONT_OPTIONS[2].value) // Varsayılan: Dancing Script
  const [titleSize, setTitleSize] = useState(2.5) // rem cinsinden

  const [messageFont, setMessageFont] = useState(FONT_OPTIONS[0].value) // Varsayılan: Inter
  const [messageSize, setMessageSize] = useState(1) // rem cinsinden

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/'); return }
      setSession(session)
      fetchCredits(session.user.id)
    })
  }, [router])

  const fetchCredits = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('credits').eq('id', userId).single()
    if (data) setCredits(data.credits)
  }

  // Dosya Seçiciler
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setCoverFile(file); setCoverPreview(URL.createObjectURL(file)) }
  }
  const handleMainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setMainFile(file); setMainPreview(URL.createObjectURL(file)) }
  }

  const createEvent = async () => {
    if (!title || !eventDate) return alert('Başlık ve Tarih zorunludur')
    if (credits !== null && credits < 1) return alert('Yetersiz Kredi!')

    setUploading(true)
    const autoSlug = `${turkishSlugify(title)}-${Math.floor(1000 + Math.random() * 9000)}`
    
    // 1. Kapak Resmi Yükle
    let coverUrl = null
    if (coverFile && session) {
      const fileName = `cover-${Math.random()}.${coverFile.name.split('.').pop()}`
      const { error } = await supabase.storage.from('event-images').upload(`${session.user.id}/${fileName}`, coverFile)
      if (!error) {
        const { data } = supabase.storage.from('event-images').getPublicUrl(`${session.user.id}/${fileName}`)
        coverUrl = data.publicUrl
      }
    }

    // 2. Ana Resim Yükle
    let mainUrl = null
    if (mainFile && session) {
      const fileName = `main-${Math.random()}.${mainFile.name.split('.').pop()}`
      const { error } = await supabase.storage.from('event-images').upload(`${session.user.id}/${fileName}`, mainFile)
      if (!error) {
        const { data } = supabase.storage.from('event-images').getPublicUrl(`${session.user.id}/${fileName}`)
        mainUrl = data.publicUrl
      }
    }

    // 3. Veritabanına Kaydet
    const { error } = await supabase.from('events').insert([{ 
        title, 
        slug: autoSlug, 
        user_id: session?.user.id, 
        image_url: coverUrl,      // Kapak
        main_image_url: mainUrl,  // Ana Görsel (Yeni)
        event_date: eventDate, 
        location_name: locationName, 
        location_url: locationUrl, 
        message: message, 
        design_settings: { 
            theme: themeColor,
            titleFont, 
            titleSize,
            messageFont,
            messageSize
        } 
    }])

    if (error) {
      alert('Hata: ' + error.message)
    } else {
      const newCredit = (credits || 0) - 1
      await supabase.from('profiles').update({ credits: newCredit }).eq('id', session.user.id)
      alert('Etkinlik Oluşturuldu! 🎉')
      router.push('/')
    }
    setUploading(false)
  }

  const formattedDate = eventDate ? new Date(eventDate).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' }) : '...'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* ÜST BAR */}
      <div className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Tasarım Stüdyosu</h1>
        <div className="flex items-center gap-4">
             <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200">💰 {credits ?? '...'} Kredi</span>
             <Link href="/" className="text-gray-500 hover:text-black text-sm">İptal</Link>
             <button onClick={createEvent} disabled={uploading || (credits || 0) < 1} className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 transition">
                {uploading ? 'Yayınlanıyor...' : 'Yayınla (-1 Kredi)'}
             </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        
        {/* SOL: EDİTÖR PANELİ */}
        <div className="p-8 overflow-y-auto h-[calc(100vh-80px)] bg-white border-r">
            <div className="max-w-md mx-auto space-y-8">
                
                {/* BÖLÜM 1: GÖRSELLER */}
                <section>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">1. Görseller</h3>
                    
                    <div className="mb-4">
                        <label className="text-xs font-bold text-gray-500 mb-1 block">Kapak Görseli (En Üst)</label>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded border overflow-hidden shrink-0">
                                {coverPreview ? <img src={coverPreview} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-gray-300">📷</div>}
                            </div>
                            <input type="file" accept="image/*" onChange={handleCoverChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"/>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block">Ana Görsel (Başlık Altı - Opsiyonel)</label>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded border overflow-hidden shrink-0">
                                {mainPreview ? <img src={mainPreview} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-gray-300">🖼️</div>}
                            </div>
                            <input type="file" accept="image/*" onChange={handleMainChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"/>
                        </div>
                    </div>
                </section>

                {/* BÖLÜM 2: İÇERİK VE TİPOGRAFİ */}
                <section>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">2. İçerik & Yazı</h3>
                    
                    {/* BAŞLIK AYARLARI */}
                    <div className="bg-gray-50 p-4 rounded-xl border mb-4">
                        <label className="block text-sm font-bold text-gray-800 mb-2">Başlık</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Örn: Ayşe & Ali" className="w-full border p-2 rounded mb-3 outline-none focus:border-black"/>
                        
                        <div className="flex gap-2 mb-2">
                            <div className="w-2/3">
                                <label className="text-[10px] text-gray-500 font-bold">FONT</label>
                                <select value={titleFont} onChange={e => setTitleFont(e.target.value)} className="w-full border p-1 rounded text-sm bg-white">
                                    {FONT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.name}</option>)}
                                </select>
                            </div>
                            <div className="w-1/3">
                                <label className="text-[10px] text-gray-500 font-bold">BOYUT: {titleSize}</label>
                                <input type="range" min="1.5" max="5" step="0.1" value={titleSize} onChange={e => setTitleSize(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
                            </div>
                        </div>
                    </div>

                    {/* MESAJ AYARLARI */}
                    <div className="bg-gray-50 p-4 rounded-xl border">
                        <label className="block text-sm font-bold text-gray-800 mb-2">Davet Mesajı (Opsiyonel)</label>
                        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Mesajınızı buraya yazın..." className="w-full border p-2 rounded mb-3 h-20 text-sm outline-none focus:border-black"/>
                        
                        <div className="flex gap-2">
                            <div className="w-2/3">
                                <label className="text-[10px] text-gray-500 font-bold">FONT</label>
                                <select value={messageFont} onChange={e => setMessageFont(e.target.value)} className="w-full border p-1 rounded text-sm bg-white">
                                    {FONT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.name}</option>)}
                                </select>
                            </div>
                            <div className="w-1/3">
                                <label className="text-[10px] text-gray-500 font-bold">BOYUT: {messageSize}</label>
                                <input type="range" min="0.8" max="2" step="0.1" value={messageSize} onChange={e => setMessageSize(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
                            </div>
                        </div>
                    </div>
                </section>

                {/* BÖLÜM 3: DETAYLAR */}
                <section>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">3. Tarih & Mekan</h3>
                    <input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full border p-3 rounded-lg mb-3 outline-none"/>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <input type="text" value={locationName} onChange={e => setLocationName(e.target.value)} placeholder="Mekan Adı" className="w-full border p-3 rounded-lg outline-none"/>
                        <input type="text" value={locationUrl} onChange={e => setLocationUrl(e.target.value)} placeholder="Harita Linki" className="w-full border p-3 rounded-lg outline-none"/>
                    </div>
                </section>

                {/* BÖLÜM 4: RENK */}
                <section>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">4. Tema Rengi</h3>
                    <div className="flex gap-3">
                        {THEME_COLORS.map(c => (
                            <button key={c.hex} onClick={() => setThemeColor(c.hex)} className={`w-10 h-10 rounded-full border-4 transition transform hover:scale-110 ${themeColor === c.hex ? 'border-gray-400 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c.hex }}/>
                        ))}
                    </div>
                </section>
            </div>
        </div>

        {/* SAĞ: CANLI ÖNİZLEME */}
        <div className="bg-gray-100 flex items-center justify-center p-8 h-[calc(100vh-80px)] overflow-hidden">
            <div className="w-[375px] h-[720px] bg-white rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden relative flex flex-col scrollbar-hide">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>

                <div className="flex-1 overflow-y-auto pb-8 font-sans">
                    
                    {/* KAPAK GÖRSELİ */}
                    <div className="w-full h-56 bg-gray-200 relative">
                        {coverPreview ? <img src={coverPreview} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-gray-400" style={{ backgroundColor: themeColor }}>Kapak</div>}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundColor: themeColor }}></div>
                    </div>

                    <div className="px-5 -mt-6 relative z-10">
                        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 min-h-[400px]" style={{ borderColor: themeColor }}>
                            
                            {/* BAŞLIK */}
                            <h1 className="font-bold text-center mb-4 leading-tight break-words" 
                                style={{ color: themeColor, fontFamily: titleFont, fontSize: `${titleSize}rem` }}>
                                {title || 'Başlık'}
                            </h1>

                            {/* ANA GÖRSEL (OPSİYONEL) */}
                            {mainPreview && (
                                <div className="mb-6 rounded-lg overflow-hidden shadow-sm">
                                    <img src={mainPreview} className="w-full h-auto object-cover" />
                                </div>
                            )}
                            
                            {/* MESAJ (OPSİYONEL) */}
                            {message && (
                                <p className="text-center text-gray-600 mb-6 whitespace-pre-line"
                                   style={{ fontFamily: messageFont, fontSize: `${messageSize}rem` }}>
                                   {message}
                                </p>
                            )}

                            <hr className="my-4 border-gray-100"/>

                            <div className="space-y-4 text-center font-sans">
                                <div className="p-3 bg-gray-50 rounded">
                                    <p className="font-bold text-gray-800 text-xs uppercase tracking-wider">Tarih</p>
                                    <p className="text-gray-600 text-sm">{formattedDate}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded">
                                    <p className="font-bold text-gray-800 text-xs uppercase tracking-wider">Konum</p>
                                    <p className="text-gray-600 text-sm">{locationName || 'Mekan Adı'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}