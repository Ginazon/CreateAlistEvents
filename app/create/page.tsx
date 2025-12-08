'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import Link from 'next/link'

// --- SABİTLER ---
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

// Slug Oluşturucu
const turkishSlugify = (text: string) => {
  const trMap: { [key: string]: string } = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U' };
  return text.replace(/[çğıöşüÇĞİÖŞÜ]/g, (m) => trMap[m] || m).toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

function CreateEventContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const [session, setSession] = useState<any>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)

  // TEMEL BİLGİLER
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [locationName, setLocationName] = useState('')
  const [locationUrl, setLocationUrl] = useState('')
  
  // GÖRSELLER
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null)
  
  const [mainFile, setMainFile] = useState<File | null>(null)
  const [mainPreview, setMainPreview] = useState<string | null>(null)
  const [existingMainUrl, setExistingMainUrl] = useState<string | null>(null)

  // TASARIM
  const [message, setMessage] = useState('Bu özel günümüzde sizleri de aramızda görmekten mutluluk duyarız.')
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0].hex)
  const [titleFont, setTitleFont] = useState(FONT_OPTIONS[2].value)
  const [titleSize, setTitleSize] = useState(2.5)
  const [messageFont, setMessageFont] = useState(FONT_OPTIONS[0].value)
  const [messageSize, setMessageSize] = useState(1)

  // --- YENİ: ÖZEL FORM ALANLARI (CUSTOM FIELDS) ---
  interface FormField {
      id: string;
      label: string;
      type: 'text' | 'textarea' | 'select';
      options?: string; // Virgülle ayrılmış string olarak tutacağız
      required: boolean;
  }
  const [formFields, setFormFields] = useState<FormField[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/'); return }
      setSession(session)
      fetchCredits(session.user.id)
      if (editId) fetchEventData(editId, session.user.id)
    })
  }, [router, editId])

  const fetchCredits = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('credits').eq('id', userId).single()
    if (data) setCredits(data.credits)
  }

  const fetchEventData = async (id: string, userId: string) => {
      setLoadingData(true)
      const { data } = await supabase.from('events').select('*').eq('id', id).eq('user_id', userId).single()
      
      if (data) {
          setTitle(data.title)
          if(data.event_date) setEventDate(new Date(data.event_date).toISOString().slice(0, 16))
          setLocationName(data.location_name || '')
          setLocationUrl(data.location_url || '')
          setMessage(data.message || '')
          if(data.image_url) { setCoverPreview(data.image_url); setExistingCoverUrl(data.image_url); }
          if(data.main_image_url) { setMainPreview(data.main_image_url); setExistingMainUrl(data.main_image_url); }
          if(data.design_settings) {
              setThemeColor(data.design_settings.theme || THEME_COLORS[0].hex)
              setTitleFont(data.design_settings.titleFont || FONT_OPTIONS[2].value)
              setTitleSize(data.design_settings.titleSize || 2.5)
              setMessageFont(data.design_settings.messageFont || FONT_OPTIONS[0].value)
              setMessageSize(data.design_settings.messageSize || 1)
          }
          // Form Şemasını Yükle
          if(data.custom_form_schema) {
              setFormFields(data.custom_form_schema)
          }
      }
      setLoadingData(false)
  }

  // --- FORM BUILDER FONKSİYONLARI ---
  const addField = () => {
      setFormFields([...formFields, { 
          id: Date.now().toString(), 
          label: 'Yeni Soru', 
          type: 'text', 
          required: false,
          options: '' 
      }])
  }

  const removeField = (index: number) => {
      const newFields = [...formFields]
      newFields.splice(index, 1)
      setFormFields(newFields)
  }

  const updateField = (index: number, key: keyof FormField, value: any) => {
      const newFields = [...formFields]
      newFields[index] = { ...newFields[index], [key]: value }
      setFormFields(newFields)
  }

  // Dosya Yükleme
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'main') => {
      const file = e.target.files?.[0]
      if (!file) return
      if (type === 'cover') { setCoverFile(file); setCoverPreview(URL.createObjectURL(file)) }
      else { setMainFile(file); setMainPreview(URL.createObjectURL(file)) }
  }

  const handleSave = async () => {
    if (!title || !eventDate) return alert('Başlık ve Tarih zorunludur')
    if (!editId && credits !== null && credits < 1) return alert('Yetersiz Kredi!')

    setUploading(true)
    
    // Resim Yükleme (Aynı Mantık)
    let finalCoverUrl = existingCoverUrl
    if (coverFile && session) {
      const fileName = `cover-${Math.random()}.${coverFile.name.split('.').pop()}`
      const { error } = await supabase.storage.from('event-images').upload(`${session.user.id}/${fileName}`, coverFile)
      if (!error) { finalCoverUrl = (supabase.storage.from('event-images').getPublicUrl(`${session.user.id}/${fileName}`)).data.publicUrl }
    }
    let finalMainUrl = existingMainUrl
    if (mainFile && session) {
      const fileName = `main-${Math.random()}.${mainFile.name.split('.').pop()}`
      const { error } = await supabase.storage.from('event-images').upload(`${session.user.id}/${fileName}`, mainFile)
      if (!error) { finalMainUrl = (supabase.storage.from('event-images').getPublicUrl(`${session.user.id}/${fileName}`)).data.publicUrl }
    }

    const eventData = {
        title, event_date: eventDate, location_name: locationName, location_url: locationUrl, message, 
        image_url: finalCoverUrl, main_image_url: finalMainUrl,
        design_settings: { theme: themeColor, titleFont, titleSize, messageFont, messageSize },
        // YENİ: Form Şemasını Kaydet
        custom_form_schema: formFields 
    }

    if (editId) {
        await supabase.from('events').update(eventData).eq('id', editId)
        alert('Güncellendi! ✅')
        router.push('/')
    } else {
        const autoSlug = `${turkishSlugify(title)}-${Math.floor(1000 + Math.random() * 9000)}`
        await supabase.from('events').insert([{ ...eventData, slug: autoSlug, user_id: session?.user.id }])
        const newCredit = (credits || 0) - 1
        await supabase.from('profiles').update({ credits: newCredit }).eq('id', session.user.id)
        alert('Oluşturuldu! 🎉')
        router.push('/')
    }
    setUploading(false)
  }

  if(loadingData) return <div>Yükleniyor...</div>
  const formattedDate = eventDate ? new Date(eventDate).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' }) : '...'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">{editId ? 'Düzenle' : 'Tasarla'}</h1>
        <div className="flex items-center gap-4">
             {!editId && <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200">💰 {credits ?? '...'}</span>}
             <Link href="/" className="text-gray-500 text-sm">İptal</Link>
             <button onClick={handleSave} disabled={uploading} className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 transition">
                {uploading ? '...' : 'Kaydet'}
             </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* SOL PANEL (Editör) */}
        <div className="p-8 overflow-y-auto h-[calc(100vh-80px)] bg-white border-r">
            <div className="max-w-md mx-auto space-y-8">
                {/* 1. Görseller */}
                {/* 5. FORM BUILDER (GÜNCELLENDİ) */}
                <section className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <h3 className="text-sm font-black text-indigo-900 uppercase tracking-wider mb-4 border-b border-indigo-200 pb-2 flex justify-between items-center">
                        5. Kayıt Formu Soruları
                        <button onClick={addField} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700">+ Soru Ekle</button>
                    </h3>
                    
                    <div className="space-y-4">
                        
                        {/* 🔒 SABİT (STANDART) ALANLAR - Sadece Bilgi İçin */}
                        <div className="bg-gray-100 p-3 rounded border border-gray-200 opacity-70 select-none">
                            <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">🔒 Standart Alanlar (Otomatik Eklenir)</p>
                            <div className="space-y-2">
                                <div className="bg-white border p-2 rounded text-xs text-gray-400 flex justify-between"><span>Ad Soyad</span> <span className="text-[10px] bg-gray-200 px-1 rounded">Zorunlu</span></div>
                                <div className="bg-white border p-2 rounded text-xs text-gray-400 flex justify-between"><span>E-Posta</span> <span className="text-[10px] bg-gray-200 px-1 rounded">Zorunlu</span></div>
                                <div className="bg-white border p-2 rounded text-xs text-gray-400 flex justify-between"><span>Katılım Durumu (Evet/Hayır)</span> <span className="text-[10px] bg-gray-200 px-1 rounded">Zorunlu</span></div>
                                <div className="bg-white border p-2 rounded text-xs text-gray-400 flex justify-between"><span>+ Kişi Sayısı</span> <span className="text-[10px] bg-gray-200 px-1 rounded">Opsiyonel</span></div>
                                <div className="bg-white border p-2 rounded text-xs text-gray-400 flex justify-between"><span>Notunuz</span> <span className="text-[10px] bg-gray-200 px-1 rounded">Opsiyonel</span></div>
                            </div>
                        </div>

                        {/* EKSTRA SORULAR LİSTESİ */}
                        {formFields.length > 0 && <p className="text-xs font-bold text-indigo-800 mt-2">Eklediğiniz Özel Sorular:</p>}

                        {formFields.map((field, index) => (
                            <div key={field.id} className="bg-white p-3 rounded shadow-sm border relative group animate-fadeIn">
                                <button onClick={() => removeField(index)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 font-bold bg-red-50 w-6 h-6 rounded-full flex items-center justify-center">&times;</button>
                                
                                {/* Soru Başlığı */}
                                <input 
                                    type="text" 
                                    value={field.label} 
                                    onChange={(e) => updateField(index, 'label', e.target.value)}
                                    className="w-full font-bold text-sm border-b border-dashed border-gray-300 outline-none focus:border-indigo-500 mb-2 text-gray-900"
                                    placeholder="Sorunuzu yazın (Örn: Menü Tercihi)"
                                />

                                <div className="flex gap-2 mb-2">
                                    {/* Soru Tipi */}
                                    <select 
                                        value={field.type} 
                                        onChange={(e) => updateField(index, 'type', e.target.value)}
                                        className="text-xs border rounded p-1 bg-gray-50 text-gray-900"
                                    >
                                        <option value="text">Kısa Metin</option>
                                        <option value="textarea">Uzun Metin</option>
                                        <option value="select">Açılır Liste</option>
                                    </select>
                                    
                                    {/* Zorunlu Mu? */}
                                    <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer select-none">
                                        <input 
                                            type="checkbox" 
                                            checked={field.required}
                                            onChange={(e) => updateField(index, 'required', e.target.checked)}
                                        /> Zorunlu
                                    </label>
                                </div>

                                {/* Eğer Select ise Seçenekler */}
                                {field.type === 'select' && (
                                    <input 
                                        type="text"
                                        value={field.options}
                                        onChange={(e) => updateField(index, 'options', e.target.value)}
                                        placeholder="Seçenekleri virgülle ayırın (Tavuk, Et, Sebze)"
                                        className="w-full text-xs border p-2 rounded bg-yellow-50 text-gray-900"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>

        {/* SAĞ: ÖNİZLEME (Basit Mockup) */}
        <div className="bg-gray-100 flex items-center justify-center p-8 h-[calc(100vh-80px)] overflow-hidden">
            <div className="w-[375px] h-[700px] bg-white rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden relative flex flex-col">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>
                <div className="flex-1 overflow-y-auto pb-8 font-sans">
                     {/* Görsel */}
                    <div className="w-full h-48 bg-gray-200 relative">
                        {coverPreview && <img src={coverPreview} className="w-full h-full object-cover"/>}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundColor: themeColor }}></div>
                    </div>
                    
                    {/* İçerik */}
                    <div className="px-5 -mt-6 relative z-10">
                         <div className="bg-white rounded-xl shadow p-4 border-t-4" style={{ borderColor: themeColor }}>
                            <h1 className="text-center font-bold mb-2 leading-tight" style={{ color: themeColor, fontFamily: titleFont, fontSize: `${titleSize}rem` }}>{title || 'Başlık'}</h1>
                            {mainPreview && <img src={mainPreview} className="w-full h-32 object-cover rounded mb-4"/>}
                            <p className="text-center text-sm text-gray-600 whitespace-pre-line" style={{ fontFamily: messageFont, fontSize: `${messageSize}rem` }}>{message}</p>
                            <hr className="my-4"/>
                            <div className="text-center text-xs">
                                <p className="font-bold">📍 {locationName}</p>
                                <p className="text-gray-500">{formattedDate}</p>
                            </div>
                            
                            {/* FORM ÖNİZLEMESİ */}
                            <div className="mt-6 pt-4 border-t border-dashed">
                                <p className="text-center font-bold text-xs mb-3">LCV Formu Önizleme</p>
                                <div className="space-y-2 opacity-70 pointer-events-none">
                                    <input className="w-full border p-2 rounded text-xs" placeholder="Ad Soyad (Standart)"/>
                                    {formFields.map(f => (
                                        f.type === 'select' 
                                        ? <select key={f.id} className="w-full border p-2 rounded text-xs"><option>{f.label}</option></select>
                                        : <input key={f.id} className="w-full border p-2 rounded text-xs" placeholder={f.label}/>
                                    ))}
                                    <button className="w-full py-2 rounded text-xs text-white" style={{backgroundColor: themeColor}}>Gönder</button>
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

export default function CreateEventPage() {
    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <CreateEventContent />
        </Suspense>
    )
}