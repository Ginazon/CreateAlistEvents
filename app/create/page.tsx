'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import Link from 'next/link'
import Countdown from '../components/Countdown'
import { useTranslation } from '../i18n'

const THEME_COLORS = [
  { name: 'Blue', hex: '#4F46E5', emoji: '💙' },
  { name: 'Gold', hex: '#D97706', emoji: '✨' },
  { name: 'Rose', hex: '#E11D48', emoji: '🌹' },
  { name: 'Green', hex: '#059669', emoji: '🌿' },
  { name: 'Black', hex: '#111827', emoji: '🖤' },
  { name: 'Purple', hex: '#7C3AED', emoji: '💜' },
  { name: 'Teal', hex: '#0D9488', emoji: '🌊' },
]

const FONT_OPTIONS = [
  { name: 'Inter', value: "'Inter', sans-serif", category: 'modern' },
  { name: 'Roboto', value: "'Roboto', sans-serif", category: 'modern' },
  { name: 'Playfair Display', value: "'Playfair Display', serif", category: 'elegant' },
  { name: 'Merriweather', value: "'Merriweather', serif", category: 'elegant' },
  { name: 'Dancing Script', value: "'Dancing Script', cursive", category: 'handwritten' },
  { name: 'Great Vibes', value: "'Great Vibes', cursive", category: 'handwritten' },
  { name: 'Pacifico', value: "'Pacifico', cursive", category: 'fun' },
  { name: 'Lobster', value: "'Lobster', display", category: 'fun' },
]

const GOOGLE_FONTS_URL = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Inter:wght@400;700&family=Lobster&family=Merriweather:wght@400;700&family=Pacifico&family=Playfair+Display:wght@400;700&family=Roboto:wght@400;700&display=swap"

const TITLE_SIZES = [
  { label: 'XS', value: 1, emoji: '🔹' },
  { label: 'S', value: 1.5, emoji: '🔸' },
  { label: 'M', value: 2, emoji: '🔶' },
  { label: 'L', value: 2.5, emoji: '🔷' },
  { label: 'XL', value: 3, emoji: '💎' },
]

const MESSAGE_SIZES = [
  { label: 'XS', value: 0.5, emoji: '📝' },
  { label: 'S', value: 1, emoji: '📄' },
  { label: 'M', value: 1.5, emoji: '📃' },
  { label: 'L', value: 2, emoji: '📋' },
]

const EMOJI_PICKER = ['😊', '❤️', '🎉', '🎊', '💐', '🎈', '🎁', '💍', '👰', '🤵', '🍾', '🥂', '🎵', '🎶', '⭐', '✨', '💫', '🌟', '🔔', '📅', '📍', '🏠', '🌸', '🌹', '🌺', '🌻', '🌷']

const SAMPLE_MESSAGES = {
  wedding: "Hayatımızın en özel günü! Sizleri düğünümüze davet ediyoruz. Mutluluğumuza ortak olmanızı isteriz.",
  birthday: "Bir yaş daha büyüyorum! Doğum günü partimde yanımda olmanı istiyorum. Eğlence garantili!",
  engagement: "Aşkımızı kutlamak için bir araya geliyoruz. Nişanımızda bizimle olur musunuz?",
  baby: "Küçük prensimiz/prensesimiz dünyaya geliyor! Baby shower'ımızda buluşalım.",
  graduation: "Mezuniyet sevincimi sizinle paylaşmak istiyorum. Kutlamaya davetlisiniz!",
}

const turkishSlugify = (text: string) => {
  const trMap: { [key: string]: string } = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U' };
  return text.replace(/[çğıöşüÇĞİÖŞÜ]/g, (m) => trMap[m] || m).toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

// Tooltip Component
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => {
  const [show, setShow] = useState(false)
  return (
    <div className="relative inline-block">
      <div onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
        {children}
      </div>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-xl">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  )
}

// Emoji Picker Component
const EmojiPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="text-lg hover:scale-110 transition"
      >
        😊
      </button>
      {show && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-white border rounded-lg shadow-xl p-2 grid grid-cols-7 gap-1 max-w-xs">
          {EMOJI_PICKER.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onSelect(emoji)
                setShow(false)
              }}
              className="text-xl hover:scale-125 transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function CreateEventContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const { t } = useTranslation()

  const [session, setSession] = useState<any>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)

  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [locationName, setLocationName] = useState('')
  const [locationUrl, setLocationUrl] = useState('')
  
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null)
  
  const [mainFile, setMainFile] = useState<File | null>(null)
  const [mainPreview, setMainPreview] = useState<string | null>(null)
  const [existingMainUrl, setExistingMainUrl] = useState<string | null>(null)

  const [message, setMessage] = useState('')
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0].hex)
  const [titleFont, setTitleFont] = useState(FONT_OPTIONS[0].value)
  const [titleSize, setTitleSize] = useState(2)
  const [messageFont, setMessageFont] = useState(FONT_OPTIONS[0].value)
  const [messageSize, setMessageSize] = useState(1)

  interface FormField { id: string; label: string; type: 'text' | 'textarea' | 'select'; options?: string; required: boolean; emoji?: string; }
  const [formFields, setFormFields] = useState<FormField[]>([])

  interface DetailBlock {
      id: string;
      type: 'timeline' | 'note' | 'link';
      title?: string;
      content?: string; 
      subContent?: string;
      imageUrl?: string;
      emoji?: string;
  }
  const [detailBlocks, setDetailBlocks] = useState<DetailBlock[]>([])

  // Progress calculation
  const progress = useMemo(() => {
    let completed = 0
    const total = 5
    if (title) completed++
    if (eventDate) completed++
    if (coverPreview || existingCoverUrl) completed++
    if (message) completed++
    if (locationName) completed++
    return Math.round((completed / total) * 100)
  }, [title, eventDate, coverPreview, existingCoverUrl, message, locationName])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { 
        router.push('/')
        return 
      }
      
      setSession(session)
      
      const initData = async () => {
        const userCredits = await fetchCredits(session.user.id)
        
        if (editId) {
          fetchEventData(editId, session.user.id)
        } else {
          if (userCredits !== null && userCredits < 1) {
            alert(t('create.alert_no_credits_redirect'))
            router.push('/')
          }
        }
      }
      
      initData()
    })
  }, [router, editId, t])

  const fetchCredits = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('credits').eq('id', userId).single()
    if (data) {
      setCredits(data.credits)
      return data.credits
    }
    return null
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
              setTitleFont(data.design_settings.titleFont || FONT_OPTIONS[0].value)
              setTitleSize(data.design_settings.titleSize || 2)
              setMessageFont(data.design_settings.messageFont || FONT_OPTIONS[0].value)
              setMessageSize(data.design_settings.messageSize || 1)
          }
          if(data.custom_form_schema) setFormFields(data.custom_form_schema)
          if(data.event_details) setDetailBlocks(data.event_details)
      }
      setLoadingData(false)
  }

  const addBlock = (type: 'timeline' | 'note' | 'link') => {
      setDetailBlocks([...detailBlocks, { id: Date.now().toString(), type, title: '', content: '' }])
  }
  const removeBlock = (index: number) => { const newB = [...detailBlocks]; newB.splice(index, 1); setDetailBlocks(newB) }
  const updateBlock = (index: number, key: keyof DetailBlock, value: any) => { const newB = [...detailBlocks]; newB[index] = { ...newB[index], [key]: value }; setDetailBlocks(newB) }
  
  const handleBlockImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if(file && session) {
          const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
          const fileName = `block-${Date.now()}-${crypto.randomUUID()}.${fileExt}`
          const { error } = await supabase.storage.from('event-images').upload(`${session.user.id}/${fileName}`, file)
          if(!error) {
              const url = supabase.storage.from('event-images').getPublicUrl(`${session.user.id}/${fileName}`).data.publicUrl
              updateBlock(index, 'imageUrl', url)
          }
      }
  }

  const addField = () => setFormFields([...formFields, { id: Date.now().toString(), label: '', type: 'text', required: false, options: '' }])
  const removeField = (index: number) => { const newFields = [...formFields]; newFields.splice(index, 1); setFormFields(newFields) }
  const updateField = (index: number, key: keyof FormField, value: any) => { const newFields = [...formFields]; newFields[index] = { ...newFields[index], [key]: value }; setFormFields(newFields) }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'main') => {
      const file = e.target.files?.[0]; if (!file) return;
      if (type === 'cover') { setCoverFile(file); setCoverPreview(URL.createObjectURL(file)) }
      else { setMainFile(file); setMainPreview(URL.createObjectURL(file)) }
  }

  const handleSave = async () => {
    if (!title || !eventDate) {
        alert(t('create.alert_required_fields'))
        return
    }
    
    if (!editId && credits !== null && credits < 1) {
        alert(t('create.alert_insufficient_credits'))
        return
    }
    
    setUploading(true)
    
    try {
        let finalCoverUrl = existingCoverUrl
        if (coverFile && session) {
            const fileExt = coverFile.name.split('.').pop()?.toLowerCase() || 'jpg'
            const fileName = `cover-${Date.now()}-${crypto.randomUUID()}.${fileExt}`
            const { error } = await supabase.storage.from('event-images').upload(`${session.user.id}/${fileName}`, coverFile)
            if (!error) finalCoverUrl = (supabase.storage.from('event-images').getPublicUrl(`${session.user.id}/${fileName}`)).data.publicUrl
        }
        
        let finalMainUrl = existingMainUrl
        if (mainFile && session) {
            const fileExt = mainFile.name.split('.').pop()?.toLowerCase() || 'jpg'
            const fileName = `main-${Date.now()}-${crypto.randomUUID()}.${fileExt}`
            const { error } = await supabase.storage.from('event-images').upload(`${session.user.id}/${fileName}`, mainFile)
            if (!error) finalMainUrl = (supabase.storage.from('event-images').getPublicUrl(`${session.user.id}/${fileName}`)).data.publicUrl
        }

        const eventData = {
            title, 
            event_date: eventDate, 
            location_name: locationName, 
            location_url: locationUrl, 
            message, 
            image_url: finalCoverUrl, 
            main_image_url: finalMainUrl,
            design_settings: { theme: themeColor, titleFont, titleSize, messageFont, messageSize },
            custom_form_schema: formFields,
            event_details: detailBlocks
        }

        if (editId) {
            const { error } = await supabase
                .from('events')
                .update(eventData)
                .eq('id', editId)
            
            if (error) throw error
            
            alert(t('create.alert_updated'))
            router.push('/')
        } else {
            const autoSlug = `${turkishSlugify(title)}-${Math.floor(1000 + Math.random() * 9000)}`
            
            const { data, error } = await supabase
                .from('events')
                .insert([{ 
                    ...eventData, 
                    slug: autoSlug, 
                    user_id: session?.user.id 
                }])
                .select()
            
            if (error) {
                console.error('Insert error:', error)
                
                if (error.message.includes('Insufficient credits') || 
                    error.message.includes('check_user_credits') ||
                    error.code === 'P0001') {
                    alert(t('dashboard.alert_insufficient_credits'))
                } else {
                    alert(t('error.something_went_wrong') + ': ' + error.message)
                }
                
                setUploading(false)
                return
            }
            
            await fetchCredits(session.user.id)
            
            alert(t('create.alert_created'))
            router.push('/')
        }
    } catch (error: any) {
        console.error('Save error:', error)
    } finally {
        setUploading(false)
    }
  }

  const formattedDate = useMemo(() => 
    eventDate ? new Date(eventDate).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' }) : '...',
    [eventDate]
  )

  if(loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">{t('common.loading_suspense')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex flex-col font-sans">
      <link href={GOOGLE_FONTS_URL} rel="stylesheet" />

      {/* HEADER with Progress */}
      <div className="bg-white/80 backdrop-blur-sm border-b px-8 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
              {editId ? '✏️ ' + t('edit_event_title') : '✨ ' + t('design_studio_title')}
            </h1>
            {!editId && (
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-gray-500">{progress}%</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
             {!editId && (
               <span className="text-sm font-bold text-amber-700 bg-amber-100 px-4 py-2 rounded-full border-2 border-amber-200 shadow-sm">
                 💰 {credits ?? '...'} {t('dashboard.credits')}
               </span>
             )}
             <Link href="/" className="text-gray-500 text-sm hover:text-gray-700 transition font-medium">
               ← {t('cancel')}
             </Link>
             <button 
               onClick={handleSave} 
               disabled={uploading} 
               className="bg-gradient-to-r from-indigo-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg disabled:opacity-50 transition transform hover:scale-105 disabled:hover:scale-100"
             >
                {uploading ? '⏳ ' + t('loading') : (editId ? '💾 ' + t('save_changes_btn') : '🚀 ' + t('publish_btn'))}
             </button>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* LEFT PANEL - Form */}
        <div className="p-8 overflow-y-auto h-[calc(100vh-100px)] bg-white/50 backdrop-blur-sm">
            <div className="max-w-lg mx-auto space-y-6">
                
                {/* IMAGES SECTION */}
                <section className="bg-white rounded-2xl shadow-lg p-6 border-2 border-indigo-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        📸 {t('section_images')}
                      </h3>
                      <Tooltip text="Davetiye için kapak ve ana görseli yükleyin">
                        <span className="text-gray-400 hover:text-indigo-600 cursor-help text-lg">💡</span>
                      </Tooltip>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4">
                            <label className="text-xs font-bold text-indigo-900 mb-2 block flex items-center gap-2">
                              🎨 {t('label_cover')}
                              <Tooltip text="Davetiyenin üst kısmında görünecek kapak görseli">
                                <span className="text-xs text-indigo-400">ℹ️</span>
                              </Tooltip>
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 bg-white rounded-xl border-2 border-dashed border-indigo-300 overflow-hidden shrink-0 relative shadow-sm hover:shadow-md transition">
                                    {coverPreview ? (
                                      <img src={coverPreview} className="w-full h-full object-cover"/>
                                    ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center text-indigo-300">
                                        <span className="text-3xl">📷</span>
                                        <span className="text-[10px] mt-1">Görsel Yok</span>
                                      </div>
                                    )}
                                </div>
                                <label className="cursor-pointer bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2">
                                  <span className="text-lg">📤</span>
                                  {coverPreview ? 'Değiştir' : t('file_btn_cover')}
                                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} className="hidden" />
                                </label>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4">
                            <label className="text-xs font-bold text-pink-900 mb-2 block flex items-center gap-2">
                              🖼️ {t('label_main')}
                              <Tooltip text="Davetiye içeriğinde büyük olarak görünecek ana görsel">
                                <span className="text-xs text-pink-400">ℹ️</span>
                              </Tooltip>
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 bg-white rounded-xl border-2 border-dashed border-pink-300 overflow-hidden shrink-0 relative shadow-sm hover:shadow-md transition">
                                    {mainPreview ? (
                                      <img src={mainPreview} className="w-full h-full object-cover"/>
                                    ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center text-pink-300">
                                        <span className="text-3xl">🖼️</span>
                                        <span className="text-[10px] mt-1">Görsel Yok</span>
                                      </div>
                                    )}
                                </div>
                                <label className="cursor-pointer bg-pink-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-pink-700 transition shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2">
                                  <span className="text-lg">📤</span>
                                  {mainPreview ? 'Değiştir' : t('file_btn_main')}
                                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'main')} className="hidden" />
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CONTENT SECTION */}
                <section className="bg-white rounded-2xl shadow-lg p-6 border-2 border-pink-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        ✍️ {t('section_content')}
                      </h3>
                      <Tooltip text="Davetiyenizin başlığı ve mesajını özelleştirin">
                        <span className="text-gray-400 hover:text-pink-600 cursor-help text-lg">💡</span>
                      </Tooltip>
                    </div>
                    
                    {/* TITLE */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 mb-4">
                        <label className="block text-sm font-bold text-purple-900 mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            🏷️ {t('label_title')}
                            <Tooltip text="Davetiyenizin ana başlığı (örn: Düğünümüz)">
                              <span className="text-xs text-purple-400">ℹ️</span>
                            </Tooltip>
                          </span>
                          <EmojiPicker onSelect={(emoji) => setTitle(title + emoji)} />
                        </label>
                        <input 
                          type="text" 
                          value={title} 
                          onChange={e => setTitle(e.target.value)} 
                          placeholder="Örn: Düğünümüze Davetlisiniz 💍"
                          className="w-full border-2 border-purple-300 p-3 rounded-xl mb-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        />
                        <div className="flex gap-2">
                            <select 
                              value={titleFont} 
                              onChange={e => setTitleFont(e.target.value)} 
                              className="w-2/3 border-2 border-purple-300 p-2 rounded-xl text-xs bg-white text-gray-900 font-bold hover:border-purple-500 transition"
                            >
                                {FONT_OPTIONS.map(o => (
                                  <option key={o.value} value={o.value} style={{fontFamily: o.value.replace(/'/g, "")}}>
                                    {o.name} ({o.category})
                                  </option>
                                ))}
                            </select>
                            <div className="flex gap-1">
                              {TITLE_SIZES.map(s => (
                                <button
                                  key={s.value}
                                  type="button"
                                  onClick={() => setTitleSize(s.value)}
                                  className={`px-3 py-2 rounded-lg text-sm font-bold transition ${
                                    titleSize === s.value 
                                      ? 'bg-purple-600 text-white shadow-md' 
                                      : 'bg-white text-purple-600 border-2 border-purple-300 hover:bg-purple-50'
                                  }`}
                                  title={s.emoji}
                                >
                                  {s.label}
                                </button>
                              ))}
                            </div>
                        </div>
                    </div>

                    {/* MESSAGE */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                        <label className="block text-sm font-bold text-blue-900 mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            💬 {t('label_message')}
                            <Tooltip text="Misafirlerinize iletmek istediğiniz mesaj">
                              <span className="text-xs text-blue-400">ℹ️</span>
                            </Tooltip>
                          </span>
                          <div className="flex items-center gap-2">
                            <EmojiPicker onSelect={(emoji) => setMessage(message + emoji)} />
                            <div className="relative group">
                              <button
                                type="button"
                                className="text-xs bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 transition"
                              >
                                📝 Örnekler
                              </button>
                              <div className="absolute hidden group-hover:block top-full right-0 mt-1 bg-white border-2 border-blue-200 rounded-xl shadow-xl p-2 w-64 z-10">
                                {Object.entries(SAMPLE_MESSAGES).map(([key, msg]) => (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() => setMessage(msg)}
                                    className="w-full text-left text-xs p-2 hover:bg-blue-50 rounded-lg transition"
                                  >
                                    {msg.substring(0, 40)}...
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </label>
                        <textarea 
                          value={message} 
                          onChange={e => setMessage(e.target.value)} 
                          placeholder="Misafirlerinize özel mesajınızı buraya yazın..."
                          className="w-full border-2 border-blue-300 p-3 rounded-xl mb-3 h-24 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                        />
                        <div className="flex gap-2">
                            <select 
                              value={messageFont} 
                              onChange={e => setMessageFont(e.target.value)} 
                              className="w-2/3 border-2 border-blue-300 p-2 rounded-xl text-xs bg-white text-gray-900 font-bold hover:border-blue-500 transition"
                            >
                                {FONT_OPTIONS.map(o => (
                                  <option key={o.value} value={o.value} style={{fontFamily: o.value.replace(/'/g, "")}}>
                                    {o.name}
                                  </option>
                                ))}
                            </select>
                            <div className="flex gap-1">
                              {MESSAGE_SIZES.map(s => (
                                <button
                                  key={s.value}
                                  type="button"
                                  onClick={() => setMessageSize(s.value)}
                                  className={`px-3 py-2 rounded-lg text-sm font-bold transition ${
                                    messageSize === s.value 
                                      ? 'bg-blue-600 text-white shadow-md' 
                                      : 'bg-white text-blue-600 border-2 border-blue-300 hover:bg-blue-50'
                                  }`}
                                  title={s.emoji}
                                >
                                  {s.label}
                                </button>
                              ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* DATE & LOCATION */}
                <section className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        📅 {t('section_details')}
                      </h3>
                      <Tooltip text="Etkinliğinizin tarih ve mekan bilgileri">
                        <span className="text-gray-400 hover:text-green-600 cursor-help text-lg">💡</span>
                      </Tooltip>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-green-900 font-bold mb-1 block flex items-center gap-2">
                          🕐 {t('label_date')}
                          <Tooltip text="Etkinlik tarih ve saati">
                            <span className="text-xs text-green-400">ℹ️</span>
                          </Tooltip>
                        </label>
                        <input 
                          type="datetime-local" 
                          value={eventDate} 
                          onChange={e => setEventDate(e.target.value)} 
                          className="w-full border-2 border-green-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs text-green-900 font-bold mb-1 block flex items-center gap-2">
                          📍 {t('label_location_name')}
                          <Tooltip text="Etkinlik mekanının adı">
                            <span className="text-xs text-green-400">ℹ️</span>
                          </Tooltip>
                        </label>
                        <input 
                          type="text" 
                          value={locationName} 
                          onChange={e => setLocationName(e.target.value)} 
                          placeholder="Örn: Hilton Otel, İstanbul"
                          className="w-full border-2 border-green-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs text-green-900 font-bold mb-1 block flex items-center gap-2">
                          🗺️ {t('label_location_url')}
                          <Tooltip text="Google Maps linki (opsiyonel)">
                            <span className="text-xs text-green-400">ℹ️</span>
                          </Tooltip>
                        </label>
                        <input 
                          type="text" 
                          value={locationUrl} 
                          onChange={e => setLocationUrl(e.target.value)} 
                          placeholder="https://maps.google.com/..."
                          className="w-full border-2 border-green-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                        />
                      </div>
                    </div>
                </section>

                {/* THEME COLOR */}
                <section className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        🎨 {t('section_color')}
                      </h3>
                      <Tooltip text="Davetiyenizin ana renk temasını seçin">
                        <span className="text-gray-400 hover:text-amber-600 cursor-help text-lg">💡</span>
                      </Tooltip>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {THEME_COLORS.map(c => (
                        <Tooltip key={c.hex} text={c.name}>
                          <button 
                            onClick={() => setThemeColor(c.hex)} 
                            className={`relative group w-14 h-14 rounded-2xl border-4 transition-all transform hover:scale-110 shadow-md hover:shadow-xl ${
                              themeColor === c.hex ? 'border-gray-900 scale-110 shadow-xl' : 'border-white'
                            }`} 
                            style={{ backgroundColor: c.hex }}
                          >
                            <span className="absolute inset-0 flex items-center justify-center text-2xl opacity-0 group-hover:opacity-100 transition">
                              {c.emoji}
                            </span>
                            {themeColor === c.hex && (
                              <span className="absolute -top-1 -right-1 text-xl">✓</span>
                            )}
                          </button>
                        </Tooltip>
                      ))}
                    </div>
                </section>

                {/* FORM BUILDER */}
                <section className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl shadow-lg p-6 border-2 border-indigo-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-black text-indigo-900 flex items-center gap-2">
                        📝 {t('section_form')}
                        <Tooltip text="Misafirlerinizden ek bilgi toplamak için özel sorular ekleyin">
                          <span className="text-indigo-400 cursor-help text-lg">💡</span>
                        </Tooltip>
                      </h3>
                      <button 
                        onClick={addField} 
                        className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition shadow-md hover:shadow-lg transform hover:scale-105 font-bold flex items-center gap-2"
                      >
                        ➕ {t('add_question_btn')}
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="bg-white/70 p-3 rounded-xl border border-indigo-200 opacity-70 select-none">
                            <p className="text-xs font-bold text-indigo-900 mb-2 flex items-center gap-1">
                              🔒 {t('locked_fields')}
                            </p>
                            <div className="space-y-2 text-xs text-indigo-400">
                                <div>✓ {t('preview_ph_name')}</div>
                                <div>✓ {t('preview_ph_email')}</div>
                                <div>✓ {t('preview_ph_status')}</div>
                            </div>
                        </div>
                        
                        {formFields.map((field, index) => (
                            <div key={field.id} className="bg-white p-4 rounded-xl shadow-sm border-2 border-indigo-200 relative group hover:shadow-md transition animate-fadeIn">
                                <button 
                                  onClick={() => removeField(index)} 
                                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold bg-red-100 w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-200 transition"
                                >
                                  ✕
                                </button>
                                
                                <div className="flex items-center gap-2 mb-2">
                                  <input 
                                    type="text" 
                                    value={field.label} 
                                    onChange={(e) => updateField(index, 'label', e.target.value)} 
                                    className="flex-1 font-bold text-sm border-b-2 border-dashed border-indigo-300 text-gray-900 outline-none focus:border-indigo-600 transition py-1" 
                                    placeholder={t('question_place_holder')}
                                  />
                                  <EmojiPicker onSelect={(emoji) => updateField(index, 'emoji', emoji)} />
                                  {field.emoji && <span className="text-xl">{field.emoji}</span>}
                                </div>
                                
                                <div className="flex gap-2 mb-2">
                                    <select 
                                      value={field.type} 
                                      onChange={(e) => updateField(index, 'type', e.target.value)} 
                                      className="text-xs border-2 border-indigo-200 rounded-lg p-2 bg-white text-gray-900 hover:border-indigo-400 transition"
                                    >
                                        <option value="text">📝 {t('create.field_type_text')}</option>
                                        <option value="textarea">📄 {t('create.field_type_textarea')}</option>
                                        <option value="select">📋 {t('create.field_type_dropdown')}</option>
                                    </select>
                                    <label className="flex items-center gap-1 text-xs text-gray-700 bg-indigo-50 px-3 py-2 rounded-lg border-2 border-indigo-200 hover:bg-indigo-100 transition cursor-pointer">
                                        <input 
                                          type="checkbox" 
                                          checked={field.required} 
                                          onChange={(e) => updateField(index, 'required', e.target.checked)}
                                          className="rounded"
                                        />
                                        <span className="font-bold">⚠️ {t('required_checkbox')}</span>
                                    </label>
                                </div>
                                
                                {field.type === 'select' && (
                                  <input 
                                    type="text" 
                                    value={field.options} 
                                    onChange={(e) => updateField(index, 'options', e.target.value)} 
                                    placeholder={t('option_placeholder')} 
                                    className="w-full text-xs border-2 border-amber-300 p-2 rounded-lg bg-amber-50 text-gray-900 focus:ring-2 focus:ring-amber-500 transition"
                                  />
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* DETAIL BLOCKS */}
                <section className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-lg p-6 border-2 border-yellow-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-black text-yellow-900 flex items-center gap-2">
                        ⭐ {t('section_extra')}
                        <Tooltip text="Timeline, notlar ve linkler ekleyerek davetiyenizi zenginleştirin">
                          <span className="text-yellow-600 cursor-help text-lg">💡</span>
                        </Tooltip>
                      </h3>
                    </div>
                    
                    <div className="flex gap-2 mb-4 flex-wrap">
                        <button 
                          onClick={() => addBlock('timeline')} 
                          className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl shadow hover:shadow-lg transition transform hover:scale-105 font-bold flex items-center gap-2"
                        >
                          🕐 {t('add_timeline_btn')}
                        </button>
                        <button 
                          onClick={() => addBlock('note')} 
                          className="text-xs bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-xl shadow hover:shadow-lg transition transform hover:scale-105 font-bold flex items-center gap-2"
                        >
                          📝 {t('add_note_btn')}
                        </button>
                        <button 
                          onClick={() => addBlock('link')} 
                          className="text-xs bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl shadow hover:shadow-lg transition transform hover:scale-105 font-bold flex items-center gap-2"
                        >
                          🔗 {t('add_link_btn')}
                        </button>
                    </div>

                    <div className="space-y-3">
                        {detailBlocks.length === 0 && (
                          <p className="text-xs text-yellow-600 italic text-center py-8 bg-white/50 rounded-xl border-2 border-dashed border-yellow-300">
                            {t('create.details_empty_msg')}
                          </p>
                        )}
                        
                        {detailBlocks.map((block, index) => (
                            <div key={block.id} className="bg-white p-4 rounded-xl shadow-sm border-2 border-yellow-200 relative group hover:shadow-md transition animate-fadeIn">
                                <button 
                                  onClick={() => removeBlock(index)} 
                                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold bg-red-100 w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-200 transition z-10"
                                >
                                  ✕
                                </button>
                                
                                {block.type === 'timeline' && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="bg-purple-100 text-purple-800 text-[10px] px-2 py-1 rounded-lg font-bold">
                                            🕐 {t('create.badge_timeline')}
                                          </div>
                                          <EmojiPicker onSelect={(emoji) => updateBlock(index, 'emoji', emoji)} />
                                          {block.emoji && <span className="text-lg">{block.emoji}</span>}
                                        </div>
                                        <div className="flex gap-2">
                                          <input 
                                            type="text" 
                                            value={block.content} 
                                            onChange={(e) => updateBlock(index, 'content', e.target.value)} 
                                            placeholder={t('timeline_time_ph')} 
                                            className="w-1/3 text-sm border-2 border-purple-300 p-2 rounded-lg font-mono focus:ring-2 focus:ring-purple-500 transition"
                                          />
                                          <input 
                                            type="text" 
                                            value={block.subContent} 
                                            onChange={(e) => updateBlock(index, 'subContent', e.target.value)} 
                                            placeholder={t('timeline_title_ph')} 
                                            className="w-2/3 text-sm border-2 border-purple-300 p-2 rounded-lg font-bold focus:ring-2 focus:ring-purple-500 transition"
                                          />
                                        </div>
                                    </div>
                                )}

                                {block.type === 'note' && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                              <div className="bg-blue-100 text-blue-800 text-[10px] px-2 py-1 rounded-lg font-bold">
                                                📝 {t('create.badge_note')}
                                              </div>
                                              <EmojiPicker onSelect={(emoji) => updateBlock(index, 'emoji', emoji)} />
                                              {block.emoji && <span className="text-lg">{block.emoji}</span>}
                                            </div>
                                            <label className="text-[10px] cursor-pointer text-blue-600 hover:text-blue-800 font-bold bg-blue-100 px-2 py-1 rounded-lg hover:bg-blue-200 transition flex items-center gap-1">
                                                📷 {block.imageUrl ? t('create.btn_change_image') : t('image_upload_btn')}
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleBlockImageUpload(index, e)}/>
                                            </label>
                                        </div>
                                        <input 
                                          type="text" 
                                          value={block.title} 
                                          onChange={(e) => updateBlock(index, 'title', e.target.value)} 
                                          placeholder={t('note_title_ph')} 
                                          className="w-full text-sm border-2 border-blue-300 p-2 rounded-lg font-bold focus:ring-2 focus:ring-blue-500 transition"
                                        />
                                        <textarea 
                                          value={block.content} 
                                          onChange={(e) => updateBlock(index, 'content', e.target.value)} 
                                          placeholder={t('note_desc_ph')} 
                                          className="w-full text-xs border-2 border-blue-300 p-2 rounded-lg h-16 focus:ring-2 focus:ring-blue-500 transition resize-none"
                                        />
                                        {block.imageUrl && (
                                          <div className="relative h-20 w-20 bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-300 shadow-sm">
                                            <img src={block.imageUrl} className="object-cover w-full h-full"/>
                                            <button 
                                              onClick={() => updateBlock(index, 'imageUrl', '')} 
                                              className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-bl-lg transition font-bold"
                                            >
                                              ✕
                                            </button>
                                          </div>
                                        )}
                                    </div>
                                )}

                                {block.type === 'link' && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="bg-green-100 text-green-800 text-[10px] px-2 py-1 rounded-lg font-bold">
                                            🔗 {t('create.badge_link')}
                                          </div>
                                          <EmojiPicker onSelect={(emoji) => updateBlock(index, 'emoji', emoji)} />
                                          {block.emoji && <span className="text-lg">{block.emoji}</span>}
                                        </div>
                                        <input 
                                          type="text" 
                                          value={block.title} 
                                          onChange={(e) => updateBlock(index, 'title', e.target.value)} 
                                          placeholder={t('link_title_ph')} 
                                          className="w-full text-sm border-2 border-green-300 p-2 rounded-lg font-bold focus:ring-2 focus:ring-green-500 transition"
                                        />
                                        <input 
                                          type="text" 
                                          value={block.content} 
                                          onChange={(e) => updateBlock(index, 'content', e.target.value)} 
                                          placeholder={t('link_url_ph')} 
                                          className="w-full text-xs border-2 border-green-300 p-2 rounded-lg text-blue-600 focus:ring-2 focus:ring-green-500 transition"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </div>

        {/* RIGHT PANEL - Preview */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-8 h-[calc(100vh-100px)] overflow-hidden sticky top-[100px]">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-[4rem] opacity-20 blur-xl animate-pulse"></div>
              <div className="relative w-[375px] h-[700px] bg-white rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden flex flex-col">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>
                  <div className="flex-1 overflow-y-auto pb-8 scrollbar-hide">
                        
                      {/* COVER */}
                      <div className="w-full h-36 bg-gradient-to-br from-gray-200 to-gray-300 relative">
                          {coverPreview ? (
                            <img src={coverPreview} className="w-full h-full object-cover"/>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                              <span className="text-3xl mb-1">📷</span>
                              {t('preview_cover_placeholder')}
                            </div>
                          )}
                          <div className="absolute inset-0 opacity-10" style={{ backgroundColor: themeColor }}></div>
                      </div>
                      
                      <div className="px-5 -mt-6 relative z-10">
                           <div className="bg-white rounded-xl shadow-lg p-4 border-t-4" style={{ borderColor: themeColor }}>
                              
                              {/* TITLE */}
                              <h1 className="text-center font-bold mb-2 leading-tight break-words" style={{ color: themeColor, fontFamily: titleFont, fontSize: `${titleSize}rem` }}>
                                {title || t('preview_title_placeholder')}
                              </h1>
                              
                              {/* MAIN IMAGE */}
                              {mainPreview ? (
                                <img src={mainPreview} className="w-full h-80 object-cover rounded-lg mb-4 shadow-md"/>
                              ) : (
                                <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex flex-col items-center justify-center text-xs text-gray-400 shadow-inner">
                                  <span className="text-4xl mb-2">🖼️</span>
                                  {t('preview_main_placeholder')}
                                </div>
                              )}
                              
                              {/* MESSAGE */}
                              <p className="text-center text-sm text-gray-600 whitespace-pre-line mb-4" style={{ fontFamily: messageFont, fontSize: `${messageSize}rem` }}>
                                {message || 'Mesajınızı buraya yazın...'}
                              </p>
                              
                              {/* COUNTDOWN */}
                              {eventDate && <div className="my-4"><Countdown targetDate={eventDate} themeColor={themeColor} /></div>}

                              <hr className="my-4 border-gray-200"/>
                              
                              {/* LOCATION */}
                              <div className="text-center text-xs space-y-2 mb-6">
                                  <div className="p-2 bg-gray-50 rounded-lg">
                                      <p className="font-bold">📍 {locationName || t('preview_location_placeholder')}</p>
                                  </div>
                                  {locationUrl && (
                                    <div className="text-white text-[10px] py-1 px-2 rounded-lg inline-block" style={{backgroundColor: themeColor}}>
                                      🗺️ {t('preview_map_btn')}
                                    </div>
                                  )}
                                  <div className="p-2 bg-gray-50 rounded-lg">
                                      <p className="text-gray-500">{formattedDate}</p>
                                  </div>
                              </div>

                              {/* DETAIL BLOCKS PREVIEW */}
                              <div className="space-y-3 mb-6">
                                  {detailBlocks.map((block) => (
                                      <div key={block.id}>
                                          
                                          {block.type === 'timeline' && (
                                              <div className="flex items-center gap-3">
                                                  <div className="w-12 text-right text-xs font-bold text-gray-500">{block.content}</div>
                                                  <div className="w-2 h-2 rounded-full" style={{backgroundColor:themeColor}}></div>
                                                  <div className="flex-1 text-xs font-bold text-gray-800 flex items-center gap-1">
                                                    {block.emoji && <span>{block.emoji}</span>}
                                                    {block.subContent}
                                                  </div>
                                              </div>
                                          )}

                                          {block.type === 'note' && (
                                              <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-100">
                                                  {block.imageUrl && <img src={block.imageUrl} className="w-full h-32 object-cover rounded mb-2"/>}
                                                  <h4 className="font-bold text-sm mb-1 flex items-center justify-center gap-1" style={{color:themeColor}}>
                                                    {block.emoji && <span>{block.emoji}</span>}
                                                    {block.title}
                                                  </h4>
                                                  <p className="text-xs text-gray-600">{block.content}</p>
                                              </div>
                                          )}

                                          {block.type === 'link' && (
                                              <div className="text-center">
                                                  <button className="w-full py-3 rounded-lg font-bold text-white text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2" style={{backgroundColor: themeColor}}>
                                                      {block.emoji && <span className="text-lg">{block.emoji}</span>}
                                                      {block.title} ↗
                                                  </button>
                                              </div>
                                          )}
                                      </div>
                                  ))}
                              </div>
                              
                              {/* FORM PREVIEW */}
                              <div className="mt-6 pt-4 border-t border-dashed border-gray-300">
                                  <p className="text-center font-bold text-xs mb-3 text-gray-500">{t('preview_rsvp_title')}</p>
                                  <div className="space-y-2 pointer-events-none">
                                      <input className="w-full border p-2 rounded text-xs bg-gray-50" placeholder={t('preview_ph_name')}/>
                                      <input className="w-full border p-2 rounded text-xs bg-gray-50" placeholder={t('preview_ph_email')}/>
                                      <select className="w-full border p-2 rounded text-xs bg-gray-50">
                                        <option>{t('preview_ph_status')}</option>
                                      </select>
                                      
                                      {formFields.map(f => (
                                        <div key={f.id} className="flex items-center gap-2">
                                          {f.emoji && <span className="text-sm">{f.emoji}</span>}
                                          {f.type === 'select' 
                                            ? <select className="flex-1 border p-2 rounded text-xs"><option>{f.label}</option></select>
                                            : <input className="flex-1 border p-2 rounded text-xs" placeholder={f.label}/>
                                          }
                                        </div>
                                      ))}
                                      
                                      <textarea className="w-full border p-2 rounded text-xs h-12" placeholder={t('preview_ph_note')}/>
                                      <button className="w-full py-2 rounded text-xs text-white font-bold" style={{backgroundColor: themeColor}}>
                                        {t('preview_submit_btn')}
                                      </button>
                                  </div>
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
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">✨ Yükleniyor...</p>
                </div>
            </div>
        }>
            <CreateEventContent />
        </Suspense>
    )
}