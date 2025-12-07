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

// YENİ: Font Seçenekleri 🔡
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

  // FORM GİRDİLERİ
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [locationName, setLocationName] = useState('')
  const [locationUrl, setLocationUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  // YENİ STATE'LER
  const [message, setMessage] = useState('Bu özel günümüzde sizleri de aramızda görmekten mutluluk duyarız.')
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].value)
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0].hex)

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreviewImage(URL.createObjectURL(selectedFile))
    }
  }

  const createEvent = async () => {
    if (!title || !eventDate) return alert('Başlık ve Tarih zorunludur')
    if (credits !== null && credits < 1) return alert('Yetersiz Kredi!')

    const autoSlug = `${turkishSlugify(title)}-${Math.floor(1000 + Math.random() * 9000)}`
    setUploading(true)
    
    let uploadedImageUrl = null
    if (file && session) {
      const fileName = `${Math.random()}.${file.name.split('.').pop()}`
      const { error } = await supabase.storage.from('event-images').upload(`${session.user.id}/${fileName}`, file)
      if (!error) {
        const { data } = supabase.storage.from('event-images').getPublicUrl(`${session.user.id}/${fileName}`)
        uploadedImageUrl = data.publicUrl
      }
    }

    const { error } = await supabase.from('events').insert([{ 
        title, 
        slug: autoSlug, 
        user_id: session?.user.id, 
        image_url: uploadedImageUrl, 
        event_date: eventDate, 
        location_name: locationName, 
        location_url: locationUrl, 
        message: message, // YENİ: Mesajı kaydet
        design_settings: { 
            theme: themeColor,
            font: selectedFont // YENİ: Fontu kaydet
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

  const formattedDate = eventDate 
    ? new Date(eventDate).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' })
    : 'Tarih Seçilmedi'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold text-gray-800">Yeni Etkinlik Tasarla</h1>
        <div className="flex items-center gap-4">
             <span className="text-sm font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">💰 Kredi: {credits ?? '...'}</span>
             <Link href="/" className="text-gray-500 hover:text-black text-sm">İptal</Link>
             <button onClick={createEvent} disabled={uploading || (credits || 0) < 1} className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50">
                {uploading ? 'Oluşturuluyor...' : 'Yayınla (-1 Kredi)'}
             </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* SOL: EDİTÖR PANELİ */}
        <div className="p-8 overflow-y-auto h-[calc(100vh-80px)] bg-white border-r">
            <div className="max-w-md mx-auto space-y-6">
                
                {/* 1. Başlık ve Görsel */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">1. Başlık & Görsel</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Örn: Ayşe & Ali" className="w-full border p-3 rounded-lg mb-3 focus:ring-2 focus:ring-black outline-none"/>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer relative">
                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                        <p className="text-sm text-gray-500">{file ? 'Görsel Seçildi ✅' : 'Kapak Görseli Yükle 📸'}</p>
                    </div>
                </div>

                {/* 2. Font ve Mesaj (YENİ KISIM) */}
                <div className="bg-gray-50 p-4 rounded-xl border">
                    <label className="block text-sm font-bold text-gray-700 mb-2">2. Yazı & Tipografi ✍️</label>
                    
                    <label className="text-xs text-gray-500 mb-1 block">Yazı Tipi Seçin</label>
                    <select 
                        value={selectedFont} 
                        onChange={(e) => setSelectedFont(e.target.value)}
                        className="w-full border p-2 rounded mb-3 bg-white"
                        style={{ fontFamily: selectedFont }} // Seçeneklerin kendisi de o fontta görünsün
                    >
                        {FONT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.name}</option>
                        ))}
                    </select>

                    <label className="text-xs text-gray-500 mb-1 block">Davet Mesajınız</label>
                    <textarea 
                        value={message} 
                        onChange={(e) => setMessage(e.target.value)} 
                        className="w-full border p-3 rounded-lg h-24 text-sm focus:ring-2 focus:ring-black outline-none"
                    />
                </div>

                {/* 3. Tarih ve Mekan */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">3. Detaylar</label>
                    <input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full border p-3 rounded-lg mb-3 outline-none"/>
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" value={locationName} onChange={e => setLocationName(e.target.value)} placeholder="Mekan Adı" className="w-full border p-3 rounded-lg outline-none"/>
                        <input type="text" value={locationUrl} onChange={e => setLocationUrl(e.target.value)} placeholder="Harita Linki" className="w-full border p-3 rounded-lg outline-none"/>
                    </div>
                </div>

                {/* 4. Renk */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">4. Tema Rengi</label>
                    <div className="flex gap-3">
                        {THEME_COLORS.map(c => (
                            <button key={c.hex} onClick={() => setThemeColor(c.hex)} className={`w-8 h-8 rounded-full border-2 ${themeColor === c.hex ? 'border-gray-400 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c.hex }}/>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* SAĞ: CANLI ÖNİZLEME */}
        <div className="bg-gray-100 flex items-center justify-center p-8 h-[calc(100vh-80px)] overflow-hidden">
            <div className="w-[375px] h-[700px] bg-white rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden relative flex flex-col scrollbar-hide">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>

                <div className="flex-1 overflow-y-auto pb-8 font-sans">
                    <div className="w-full h-64 bg-gray-200 relative">
                        {previewImage ? <img src={previewImage} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-gray-400" style={{ backgroundColor: themeColor }}>Görsel</div>}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundColor: themeColor }}></div>
                    </div>

                    <div className="px-6 -mt-8 relative z-10">
                        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 min-h-[400px]" style={{ borderColor: themeColor }}>
                            
                            {/* BAŞLIK (SEÇİLEN FONT İLE) */}
                            <h1 className="text-3xl font-bold text-center mb-4 leading-tight" 
                                style={{ color: themeColor, fontFamily: selectedFont }}>
                                {title || 'Etkinlik Başlığı'}
                            </h1>
                            
                            {/* MESAJ (SEÇİLEN FONT İLE) */}
                            <p className="text-center text-gray-600 mb-6 whitespace-pre-line"
                               style={{ fontFamily: selectedFont, fontSize: '1.1rem' }}>
                               {message}
                            </p>

                            <hr className="my-4 border-gray-100"/>

                            <div className="space-y-4 text-center font-sans"> {/* Bilgiler okunabilir kalsın diye font-sans bıraktım */}
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