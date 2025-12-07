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

// Türkçe Karakter Temizleyici
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
  const [previewImage, setPreviewImage] = useState<string | null>(null) // Anlık önizleme için
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0].hex)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/'); return } // Giriş yoksa ana sayfaya at
      setSession(session)
      fetchCredits(session.user.id)
    })
  }, [router])

  const fetchCredits = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('credits').eq('id', userId).single()
    if (data) setCredits(data.credits)
  }

  // Resim seçilince anında önizleme oluştur
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreviewImage(URL.createObjectURL(selectedFile)) // Tarayıcı hafızasında geçici URL oluştur
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
        title, slug: autoSlug, user_id: session?.user.id, image_url: uploadedImageUrl, 
        event_date: eventDate, location_name: locationName, location_url: locationUrl, 
        design_settings: { theme: themeColor } 
    }])

    if (error) {
      alert('Hata: ' + error.message)
    } else {
      // Kredi Düş
      const newCredit = (credits || 0) - 1
      await supabase.from('profiles').update({ credits: newCredit }).eq('id', session.user.id)
      alert('Etkinlik Oluşturuldu! 🎉')
      router.push('/') // Ana sayfaya dön
    }
    setUploading(false)
  }

  // Tarih Formatlama (Önizleme İçin)
  const formattedDate = eventDate 
    ? new Date(eventDate).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' })
    : 'Tarih Seçilmedi'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Üst Bar */}
      <div className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold text-gray-800">Yeni Etkinlik Tasarla</h1>
        <div className="flex items-center gap-4">
             <span className="text-sm font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                💰 Kredi: {credits ?? '...'}
             </span>
             <Link href="/" className="text-gray-500 hover:text-black text-sm">İptal</Link>
             <button 
                onClick={createEvent} 
                disabled={uploading || (credits || 0) < 1}
                className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50"
             >
                {uploading ? 'Oluşturuluyor...' : 'Yayınla (-1 Kredi)'}
             </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        
        {/* SOL: EDİTÖR PANELİ */}
        <div className="p-8 overflow-y-auto h-[calc(100vh-80px)] bg-white border-r">
            <div className="max-w-md mx-auto space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">1. Etkinlik Başlığı</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Örn: Ayşe & Ali Düğün" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-black outline-none"/>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">2. Görsel Seçimi</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                        <p className="text-gray-500">Fotoğraf Yüklemek İçin Tıkla</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG (Max 5MB)</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">3. Tarih ve Saat</label>
                    <input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full border p-3 rounded-lg outline-none"/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Mekan Adı</label>
                        <input type="text" value={locationName} onChange={e => setLocationName(e.target.value)} placeholder="Grand Hotel" className="w-full border p-3 rounded-lg outline-none"/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Harita Linki</label>
                        <input type="text" value={locationUrl} onChange={e => setLocationUrl(e.target.value)} placeholder="Google Maps URL" className="w-full border p-3 rounded-lg outline-none"/>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">4. Tema Rengi</label>
                    <div className="flex gap-3">
                        {THEME_COLORS.map(c => (
                            <button 
                                key={c.hex} 
                                onClick={() => setThemeColor(c.hex)} 
                                className={`w-10 h-10 rounded-full border-4 transition transform hover:scale-110 ${themeColor === c.hex ? 'border-gray-300 scale-110 shadow-lg' : 'border-transparent'}`} 
                                style={{ backgroundColor: c.hex }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* SAĞ: CANLI ÖNİZLEME (TELEFON MODU) */}
        <div className="bg-gray-100 flex items-center justify-center p-8 h-[calc(100vh-80px)] overflow-hidden">
            
            {/* TELEFON ÇERÇEVESİ */}
            <div className="w-[375px] h-[750px] bg-white rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden relative flex flex-col">
                
                {/* Telefon Çentiği */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>

                {/* --- ÖNİZLEME İÇERİĞİ --- */}
                <div className="flex-1 overflow-y-auto pb-10 scrollbar-hide">
                    
                    {/* Görsel Alanı */}
                    <div className="w-full h-64 bg-gray-200 relative">
                        {previewImage ? (
                            <img src={previewImage} className="w-full h-full object-cover"/>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400" style={{ backgroundColor: themeColor }}>Görsel Yok</div>
                        )}
                        {/* Renk Katmanı */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundColor: themeColor }}></div>
                    </div>

                    {/* İçerik Kartı */}
                    <div className="px-6 -mt-8 relative z-10">
                        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 min-h-[400px]" style={{ borderColor: themeColor }}>
                            
                            <h1 className="text-2xl font-bold text-center mb-2 break-words" style={{ color: themeColor }}>
                                {title || 'Etkinlik Başlığı'}
                            </h1>
                            
                            <p className="text-center text-gray-500 text-xs mb-6">Sizleri aramızda görmekten mutluluk duyarız.</p>

                            {/* Sayaç Mockup */}
                            <div className="flex gap-2 justify-center mb-6 opacity-70 scale-90">
                                {['05','12','30','45'].map((n,i) => (
                                    <div key={i} className="flex flex-col items-center">
                                        <div className="w-10 h-10 flex items-center justify-center text-sm font-bold text-white rounded" style={{ backgroundColor: themeColor }}>{n}</div>
                                    </div>
                                ))}
                            </div>

                            <hr className="my-4 border-gray-100"/>

                            <div className="space-y-4 text-center">
                                <div className="p-3 bg-gray-50 rounded">
                                    <p className="font-bold text-gray-800 text-sm">📅 Tarih</p>
                                    <p className="text-gray-600 text-xs">{formattedDate}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded">
                                    <p className="font-bold text-gray-800 text-sm">📍 Konum</p>
                                    <p className="text-gray-600 text-xs mb-2">{locationName || 'Mekan Adı'}</p>
                                    {locationUrl && <span className="text-[10px] text-white px-2 py-1 rounded" style={{ backgroundColor: themeColor }}>Harita Butonu</span>}
                                </div>
                            </div>
                            
                            <div className="mt-6 p-4 bg-gray-50 rounded text-center border border-dashed text-xs text-gray-400">
                                LCV ve Fotoğraf Alanı Burada Görünecek
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