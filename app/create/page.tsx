'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import Link from 'next/link'
import Countdown from '../components/Countdown'
import { useTranslation } from '../i18n'

const THEME_COLORS = [
  { name: 'Blue', hex: '#4F46E5' },
  { name: 'Sky Blue', hex: '#0EA5E9' },
  { name: 'Navy', hex: '#1E40AF' },
  { name: 'Gold', hex: '#D97706' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Rose', hex: '#E11D48' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Green', hex: '#059669' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Lime', hex: '#84CC16' },
  { name: 'Black', hex: '#111827' },
  { name: 'Slate', hex: '#475569' },
  { name: 'Gray', hex: '#6B7280' },
  { name: 'Purple', hex: '#7C3AED' },
  { name: 'Violet', hex: '#8B5CF6' },
  { name: 'Indigo', hex: '#6366F1' },
  { name: 'Teal', hex: '#0D9488' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Orange', hex: '#EA580C' },
]

const FONT_OPTIONS = [
  // Sans-serif
  { name: 'Inter', value: "'Inter', sans-serif" },
  { name: 'Roboto', value: "'Roboto', sans-serif" },
  { name: 'Open Sans', value: "'Open Sans', sans-serif" },
  { name: 'Lato', value: "'Lato', sans-serif" },
  { name: 'Montserrat', value: "'Montserrat', sans-serif" },
  { name: 'Poppins', value: "'Poppins', sans-serif" },
  
  // Serif
  { name: 'Playfair Display', value: "'Playfair Display', serif" },
  { name: 'Merriweather', value: "'Merriweather', serif" },
  { name: 'Lora', value: "'Lora', serif" },
  { name: 'Crimson Text', value: "'Crimson Text', serif" },
  { name: 'Cormorant', value: "'Cormorant', serif" },
  
  // Handwriting & Cursive
  { name: 'Dancing Script', value: "'Dancing Script', cursive" },
  { name: 'Great Vibes', value: "'Great Vibes', cursive" },
  { name: 'Pacifico', value: "'Pacifico', cursive" },
  { name: 'Caveat', value: "'Caveat', cursive" },
  { name: 'Sacramento', value: "'Sacramento', cursive" },
  { name: 'Allura', value: "'Allura', cursive" },
  { name: 'Satisfy', value: "'Satisfy', cursive" },
  { name: 'Cookie', value: "'Cookie', cursive" },
  { name: 'Courgette', value: "'Courgette', cursive" },
  { name: 'Alex Brush', value: "'Alex Brush', cursive" },
  { name: 'Tangerine', value: "'Tangerine', cursive" },
  { name: 'Pinyon Script', value: "'Pinyon Script', cursive" },
  { name: 'Kaushan Script', value: "'Kaushan Script', cursive" },
  { name: 'Parisienne', value: "'Parisienne', cursive" },
  { name: 'Rouge Script', value: "'Rouge Script', cursive" },
  
  // Display
  { name: 'Lobster', value: "'Lobster', display" },
  { name: 'Bebas Neue', value: "'Bebas Neue', display" },
  { name: 'Righteous', value: "'Righteous', display" },
  { name: 'Permanent Marker', value: "'Permanent Marker', display" },
]

const GOOGLE_FONTS_URL = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Inter:wght@400;700&family=Lobster&family=Merriweather:wght@400;700&family=Pacifico&family=Playfair+Display:wght@400;700&family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&family=Montserrat:wght@400;700&family=Lora:wght@400;700&family=Crimson+Text:wght@400;700&family=Bebas+Neue&family=Caveat:wght@400;700&family=Poppins:wght@400;700&family=Cormorant:wght@400;700&family=Sacramento&family=Allura&family=Satisfy&family=Cookie&family=Courgette&family=Alex+Brush&family=Tangerine:wght@400;700&family=Pinyon+Script&family=Kaushan+Script&family=Parisienne&family=Rouge+Script&family=Righteous&family=Permanent+Marker&display=swap"

const TITLE_SIZES = [
  { label: 'XXS', value: 0.75 },
  { label: 'XS', value: 1 },
  { label: 'S', value: 1.5 },
  { label: 'M', value: 2 },
  { label: 'L', value: 2.5 },
  { label: 'XL', value: 3 },
  { label: 'XXL', value: 3.5 },
  { label: '3XL', value: 4 },
]

const MESSAGE_SIZES = [
  { label: 'XXS', value: 0.4 },
  { label: 'XS', value: 0.6 },
  { label: 'S', value: 0.8 },
  { label: 'M', value: 1 },
  { label: 'L', value: 1.25 },
  { label: 'XL', value: 1.5 },
  { label: 'XXL', value: 1.75 },
  { label: '3XL', value: 2 },
]

const DATE_DISPLAY_STYLES = [
  { 
    id: 'full', 
    name: 'Full', 
    preview: 'Friday\n15 August 2025\nAT 4:30 PM',
    format: (date: string): { line1: string; line2: string; line3?: string } => {
      const d = new Date(date)
      return {
        line1: d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(),
        line2: `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        line3: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toUpperCase()
      }
    }
  },
  { 
    id: 'short', 
    name: 'Short', 
    preview: '15 AUG 2025\n4:30 PM',
    format: (date: string): { line1: string; line2: string; line3?: string } => {
      const d = new Date(date)
      return {
        line1: `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}`,
        line2: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toUpperCase()
      }
    }
  },
  { 
    id: 'elegant', 
    name: 'Elegant', 
    preview: '19th & 20th Feb 2024\nat 11:00 Am Onwards',
    format: (date: string): { line1: string; line2: string; line3?: string } => {
      const d = new Date(date)
      const day = d.getDate()
      const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th'
      return {
        line1: `${day}${suffix} ${d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
        line2: `at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
      }
    }
  },
  { 
    id: 'minimal', 
    name: 'Minimal', 
    preview: 'August 15\n2025',
    format: (date: string): { line1: string; line2: string; line3?: string } => {
      const d = new Date(date)
      return {
        line1: `${d.toLocaleDateString('en-US', { month: 'long' })} ${d.getDate()}`,
        line2: d.getFullYear().toString()
      }
    }
  }
]

const EMOJIS = ['😊', '❤️', '🎉', '🎊', '💐', '🎈', '🎁', '💍', '👰', '🤵', '🍾', '🥂', '🎵', '🎶', '⭐', '✨', '💫', '🌟', '🔔', '📅', '📍', '🏠', '🌸', '🌹', '🌺', '🌻', '🌷', '🎂', '🍰', '🥳', '🎭', '🎪', '🎨', '🎬', '📸', '💌', '💝', '💖', '💗', '💓', '💞', '💕', '🌈', '☀️', '🌙', '⭐', '💎', '👑', '🦋', '🌺']

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

// Helper: Extract Google Maps coordinates from URL
const extractMapCoordinates = (url: string): { lat: number, lng: number } | null => {
  try {
    // Format 1: google.com/maps/@lat,lng
    const match1 = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (match1) return { lat: parseFloat(match1[1]), lng: parseFloat(match1[2]) }
    
    // Format 2: google.com/maps/place/.../@lat,lng
    const match2 = url.match(/place\/[^\/]+\/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (match2) return { lat: parseFloat(match2[1]), lng: parseFloat(match2[2]) }
    
    // Format 3: q=lat,lng
    const match3 = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (match3) return { lat: parseFloat(match3[1]), lng: parseFloat(match3[2]) }
    
    return null
  } catch {
    return null
  }
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
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-xl pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  )
}

// Emoji Modal Component
const EmojiModal = ({ isOpen, onClose, onSelect }: { isOpen: boolean, onClose: () => void, onSelect: (emoji: string) => void }) => {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Emoji Seç</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="grid grid-cols-8 gap-2 max-h-80 overflow-y-auto">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onSelect(emoji)
                onClose()
              }}
              className="text-2xl hover:bg-gray-100 rounded-lg p-2 transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Google Maps Location Picker with Search and Click
const MapLocationPicker = ({ 
  locationName, 
  locationUrl, 
  onLocationNameChange, 
  onLocationUrlChange 
}: { 
  locationName: string
  locationUrl: string
  onLocationNameChange: (name: string) => void
  onLocationUrlChange: (url: string) => void 
}) => {
  const [showMap, setShowMap] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mapKey, setMapKey] = useState(0) // Force iframe reload

  const handleSearch = () => {
    if (!searchQuery.trim()) return
    
    // Google Maps URL'si oluştur
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`
    
    // Adres bilgisini güncelle
    onLocationNameChange(searchQuery)
    onLocationUrlChange(mapsUrl)
    
    // Haritayı yeniden yükle
    setMapKey(prev => prev + 1)
  }

  const handleManualUrl = (url: string) => {
    onLocationUrlChange(url)
    setMapKey(prev => prev + 1)
  }

  const getEmbedUrl = () => {
    if (!locationUrl) {
      // Default: Istanbul
      return 'https://maps.google.com/maps?q=41.0082,28.9784&z=12&output=embed'
    }
    
    // Eğer search URL ise
    if (locationUrl.includes('/search/')) {
      const query = locationUrl.split('/search/')[1]
      return `https://maps.google.com/maps?q=${query}&output=embed`
    }
    
    // Eğer koordinat varsa
    const coords = extractMapCoordinates(locationUrl)
    if (coords) {
      return `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`
    }
    
    // Eğer place URL ise
    if (locationUrl.includes('place/')) {
      const match = locationUrl.match(/place\/([^\/]+)/)
      if (match) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(match[1])}&output=embed`
      }
    }
    
    // Default
    return 'https://maps.google.com/maps?q=41.0082,28.9784&z=12&output=embed'
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-medium transition flex items-center gap-2"
        >
          {showMap ? '🗺️ Haritayı Gizle' : '📍 Haritadan Seç'}
        </button>
        {locationUrl && (
          <a
            href={locationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
          >
            Google Maps'te Aç ↗
          </a>
        )}
      </div>
      
      {showMap && (
        <div className="border-2 border-indigo-100 rounded-xl overflow-hidden bg-white">
          {/* Search Box */}
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="🔍 Adres ara... (örn: Taksim Meydanı, İstanbul)"
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg text-sm bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
              >
                Ara
              </button>
            </div>
            
            <div className="text-xs text-gray-600 space-y-1">
              <p>💡 <strong>İpucu:</strong> Arama yaptıktan sonra haritada konumu görebilirsiniz</p>
              <p>📍 Haritayı kaydırarak istediğiniz yeri bulun ve Google Maps'te açın</p>
            </div>
          </div>
          
          {/* Interactive Map */}
          <div className="h-96 relative bg-gray-100">
            <iframe
              key={mapKey}
              src={getEmbedUrl()}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          
          {/* Info Box */}
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-start gap-2">
              <span className="text-xl">ℹ️</span>
              <div className="flex-1 text-xs text-gray-600">
                <p className="font-semibold mb-1">Konum Nasıl Seçilir?</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Yukarıdaki arama kutusuna adres yazın ve "Ara" butonuna tıklayın</li>
                  <li>Harita istediğiniz konumu gösterdiğinde "Google Maps'te Aç" butonuna tıklayın</li>
                  <li>Açılan sayfadan URL'yi kopyalayıp aşağıdaki alana yapıştırın</li>
                  <li>Veya manuel olarak Google Maps URL'si girebilirsiniz</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Manual URL Input */}
      <div>
        <label className="text-xs font-semibold text-gray-700 mb-1 block">
          Manuel Google Maps URL (Opsiyonel)
        </label>
        <input 
          type="text" 
          value={locationUrl} 
          onChange={e => handleManualUrl(e.target.value)} 
          placeholder="https://www.google.com/maps/place/..."
          className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
        />
        {locationUrl && (
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            ✓ URL kaydedildi - Misafirler haritaya yönlendirilecek
          </p>
        )}
      </div>
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
  const [emojiModalOpen, setEmojiModalOpen] = useState(false)
  const [emojiTarget, setEmojiTarget] = useState<{ type: string, index?: number } | null>(null)
  const [isEventLocked, setIsEventLocked] = useState(false) // YENİ: Etkinlik kilidi

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
  
  // Image Overlay Settings
  const [showTitleOnImage, setShowTitleOnImage] = useState(false)
  const [showMessageOnImage, setShowMessageOnImage] = useState(false)
  const [showDateOnImage, setShowDateOnImage] = useState(false)
  const [dateDisplayStyle, setDateDisplayStyle] = useState('full') // 'full', 'short', 'elegant', 'minimal'

  interface FormField { id: string; label: string; type: 'text' | 'textarea' | 'select' | 'checkbox' | 'emoji'; options?: string; required: boolean; emoji?: string; }
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

  const handleEmojiSelect = (emoji: string) => {
    if (!emojiTarget) return
    
    if (emojiTarget.type === 'title') {
      setTitle(title + emoji)
    } else if (emojiTarget.type === 'message') {
      setMessage(message + emoji)
    } else if (emojiTarget.type === 'field' && emojiTarget.index !== undefined) {
      updateField(emojiTarget.index, 'emoji', emoji)
    } else if (emojiTarget.type === 'block' && emojiTarget.index !== undefined) {
      updateBlock(emojiTarget.index, 'emoji', emoji)
    }
    
    setEmojiModalOpen(false)
    setEmojiTarget(null)
  }

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
          // Etkinlik kilidi kontrolü
          const eventDate = data.event_date ? new Date(data.event_date) : null
          const isPast = eventDate && eventDate <= new Date()
          setIsEventLocked(!!isPast)
          
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
              setShowTitleOnImage(data.design_settings.showTitleOnImage || false)
              setShowMessageOnImage(data.design_settings.showMessageOnImage || false)
              setShowDateOnImage(data.design_settings.showDateOnImage || false)
              setDateDisplayStyle(data.design_settings.dateDisplayStyle || 'full')
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
            design_settings: { 
              theme: themeColor, 
              titleFont, 
              titleSize, 
              messageFont, 
              messageSize,
              showTitleOnImage,
              showMessageOnImage,
              showDateOnImage,
              dateDisplayStyle
            },
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">{t('common.loading_suspense')}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <EmojiModal 
        isOpen={emojiModalOpen} 
        onClose={() => setEmojiModalOpen(false)} 
        onSelect={handleEmojiSelect}
      />
      
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <link href={GOOGLE_FONTS_URL} rel="stylesheet" />

        {/* HEADER */}
        <div className="bg-white border-b px-8 py-4 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">
                {editId ? t('edit_event_title') : t('design_studio_title')}
              </h1>
              {!editId && (
                <div className="flex items-center gap-2">
                  <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-gray-500">{progress}%</span>
                </div>
              )}
              {isEventLocked && (
                <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                  🔒 Etkinlik tarihi geçti - Sadece görüntüleme
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
               {!editId && (
                 <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">
                   {credits ?? '...'} {t('dashboard.credits')}
                 </span>
               )}
               <Link href="/" className="text-gray-500 text-sm hover:text-gray-700 transition">
                 {t('cancel')}
               </Link>
               <button 
                 onClick={handleSave} 
                 disabled={uploading || isEventLocked} 
                 className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                 title={isEventLocked ? 'Etkinlik tarihi geçti, düzenlenemez' : ''}
               >
                  {uploading ? t('loading') : (editId ? t('save_changes_btn') : t('publish_btn'))}
               </button>
            </div>
          </div>
        </div>

        {/* LOCK WARNING BANNER */}
        {isEventLocked && (
          <div className="bg-amber-50 border-b border-amber-200 px-8 py-3">
            <div className="max-w-7xl mx-auto flex items-center gap-3">
              <span className="text-2xl">🔒</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900">
                  Bu etkinlik tamamlandı
                </p>
                <p className="text-xs text-amber-700">
                  Etkinlik tarihi geçtiği için artık düzenlenemez. Ancak davetiye hala görüntülenebilir ve misafirler fotoğraf galerisine erişmeye devam edebilir.
                </p>
              </div>
              <Link href="/" className="text-xs text-amber-800 hover:text-amber-900 font-medium underline">
                Dashboard'a Dön
              </Link>
            </div>
          </div>
        )}

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
          {/* LEFT PANEL */}
          <div className={`p-8 overflow-y-auto h-[calc(100vh-80px)] bg-white ${isEventLocked ? 'pointer-events-none opacity-60' : ''}`}>
              <div className="max-w-xl mx-auto space-y-8">
                  
                  {/* IMAGES */}
                  <section>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{t('section_images')}</h3>
                        <Tooltip text="Davetiye için kapak ve ana görseli yükleyin">
                          <span className="text-gray-400 hover:text-gray-600 cursor-help">ℹ️</span>
                        </Tooltip>
                      </div>
                      
                      <div className="space-y-4">
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <label className="text-xs font-semibold text-gray-700 mb-2 block">{t('label_cover')}</label>
                              <div className="flex items-center gap-4">
                                  <div className="w-20 h-20 bg-white rounded-lg border-2 border-dashed border-gray-300 overflow-hidden flex-shrink-0">
                                      {coverPreview ? (
                                        <img src={coverPreview} className="w-full h-full object-cover"/>
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                                          Görsel
                                        </div>
                                      )}
                                  </div>
                                  <label className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                                    {coverPreview ? 'Değiştir' : t('file_btn_cover')}
                                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} className="hidden" />
                                  </label>
                              </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <label className="text-xs font-semibold text-gray-700 mb-2 block">{t('label_main')}</label>
                              <div className="flex items-center gap-4">
                                  <div className="w-20 h-20 bg-white rounded-lg border-2 border-dashed border-gray-300 overflow-hidden flex-shrink-0">
                                      {mainPreview ? (
                                        <img src={mainPreview} className="w-full h-full object-cover"/>
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                                          Image
                                        </div>
                                      )}
                                  </div>
                                  <label className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                                    {mainPreview ? 'Change' : t('file_btn_main')}
                                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'main')} className="hidden" />
                                  </label>
                              </div>
                          </div>
                      </div>
                  </section>

                  {/* CONTENT */}
                  <section>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">{t('section_content')}</h3>
                      
                      {/* TITLE */}
                      <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-gray-700">{t('label_title')}</label>
                            <button
                              type="button"
                              onClick={() => {
                                setEmojiTarget({ type: 'title' })
                                setEmojiModalOpen(true)
                              }}
                              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                              Emoji Ekle
                            </button>
                          </div>
                          <input 
                            type="text" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            placeholder="Örn: Düğünümüze Davetlisiniz"
                            className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition mb-3"
                          />
                          <div className="flex gap-2">
                              <select 
                                value={titleFont} 
                                onChange={e => setTitleFont(e.target.value)} 
                                className="flex-1 border border-gray-300 p-2 rounded-lg text-sm bg-white text-gray-900"
                              >
                                  {FONT_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value} style={{fontFamily: o.value.replace(/'/g, "")}}>
                                      {o.name}
                                    </option>
                                  ))}
                              </select>
                              <div className="flex gap-1">
                                {TITLE_SIZES.map(s => (
                                  <button
                                    key={s.value}
                                    type="button"
                                    onClick={() => setTitleSize(s.value)}
                                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                                      titleSize === s.value 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    {s.label}
                                  </button>
                                ))}
                              </div>
                          </div>
                      </div>

                      {/* MESSAGE */}
                      <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-gray-700">{t('label_message')}</label>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEmojiTarget({ type: 'message' })
                                  setEmojiModalOpen(true)
                                }}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                              >
                                Emoji Ekle
                              </button>
                              <div className="relative group">
                                <button
                                  type="button"
                                  className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 transition"
                                >
                                  Örnekler
                                </button>
                                <div className="absolute hidden group-hover:block top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-64 z-10">
                                  {Object.entries(SAMPLE_MESSAGES).map(([key, msg]) => (
                                    <button
                                      key={key}
                                      type="button"
                                      onClick={() => setMessage(msg)}
                                      className="w-full text-left text-xs p-2 hover:bg-gray-50 rounded transition"
                                    >
                                      {msg.substring(0, 40)}...
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <textarea 
                            value={message} 
                            onChange={e => setMessage(e.target.value)} 
                            placeholder="Misafirlerinize özel mesajınızı buraya yazın..."
                            className="w-full border border-gray-300 p-3 rounded-lg mb-3 h-24 text-sm bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                          />
                          <div className="flex gap-2">
                              <select 
                                value={messageFont} 
                                onChange={e => setMessageFont(e.target.value)} 
                                className="flex-1 border border-gray-300 p-2 rounded-lg text-sm bg-white text-gray-900"
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
                                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                                      messageSize === s.value 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    {s.label}
                                  </button>
                                ))}
                              </div>
                          </div>
                      </div>
                  </section>

                  {/* DATE & LOCATION */}
                  <section>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">{t('section_details')}</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-700 mb-1 block">{t('label_date')}</label>
                          <input 
                            type="datetime-local" 
                            value={eventDate} 
                            onChange={e => setEventDate(e.target.value)} 
                            className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs font-semibold text-gray-700 mb-1 block">{t('label_location_name')}</label>
                          <input 
                            type="text" 
                            value={locationName} 
                            onChange={e => setLocationName(e.target.value)} 
                            placeholder="Örn: Hilton Otel, İstanbul"
                            className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs font-semibold text-gray-700 mb-1 block">{t('label_location_url')}</label>
                          <MapLocationPicker 
                            locationName={locationName}
                            locationUrl={locationUrl}
                            onLocationNameChange={setLocationName}
                            onLocationUrlChange={setLocationUrl}
                          />
                        </div>
                      </div>
                  </section>

                  {/* TEXT OVERLAY SETTINGS */}
                  {mainPreview && (
                    <section>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Text Overlay</h3>
                      
                      <div className="space-y-4">
                        {/* TOGGLE OPTIONS */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900">
                            <input
                              type="checkbox"
                              checked={showTitleOnImage}
                              onChange={(e) => setShowTitleOnImage(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="font-medium">Show Title on Image</span>
                            <span className="text-xs text-gray-500">(top)</span>
                          </label>
                          
                          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900">
                            <input
                              type="checkbox"
                              checked={showMessageOnImage}
                              onChange={(e) => setShowMessageOnImage(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="font-medium">Show Message on Image</span>
                            <span className="text-xs text-gray-500">(center)</span>
                          </label>
                          
                          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900">
                            <input
                              type="checkbox"
                              checked={showDateOnImage}
                              onChange={(e) => setShowDateOnImage(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="font-medium">Show Date on Image</span>
                            <span className="text-xs text-gray-500">(bottom)</span>
                          </label>
                        </div>
                        
                        {/* DATE STYLE SELECTOR */}
                        <div>
                          <label className="text-xs font-semibold text-gray-700 mb-2 block">Date Display Style</label>
                          <div className="grid grid-cols-2 gap-2">
                            {DATE_DISPLAY_STYLES.map(style => (
                              <button
                                key={style.id}
                                type="button"
                                onClick={() => setDateDisplayStyle(style.id)}
                                className={`p-3 rounded-lg border-2 text-left transition ${
                                  dateDisplayStyle === style.id
                                    ? 'border-indigo-600 bg-indigo-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <p className="font-bold text-gray-900 text-sm">{style.name}</p>
                                <p className="text-[10px] text-gray-500 mt-1 whitespace-pre-line leading-tight">{style.preview}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {(showTitleOnImage || showMessageOnImage || showDateOnImage) && (
                          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-800">
                            <span className="font-semibold">💡 Preview:</span> Text will appear on your main image below
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {/* THEME COLOR */}
                  <section>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">{t('section_color')}</h3>
                      <div className="grid grid-cols-7 gap-2">
                        {THEME_COLORS.map(c => (
                          <Tooltip key={c.hex} text={c.name}>
                            <button 
                              onClick={() => setThemeColor(c.hex)} 
                              className={`w-full h-10 rounded-lg border-2 transition ${
                                themeColor === c.hex ? 'border-gray-900 scale-110 shadow-lg' : 'border-gray-200 hover:scale-105'
                              }`} 
                              style={{ backgroundColor: c.hex }}
                            />
                          </Tooltip>
                        ))}
                      </div>
                  </section>

                  {/* ADDITIONAL DETAILS FIELDS */}
                  <section className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Additional Details</h3>
                        <button 
                          onClick={addField} 
                          className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition font-medium"
                        >
                          Add Field
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                          <div className="bg-white/70 p-3 rounded-lg border border-gray-200 opacity-60">
                              <p className="text-xs font-semibold text-gray-700 mb-2">RSVP Form (Fixed)</p>
                              <div className="space-y-1 text-xs text-gray-500">
                                  <div>{t('preview_ph_name')}</div>
                                  <div>{t('preview_ph_email')}</div>
                                  <div>{t('preview_ph_status')}</div>
                              </div>
                          </div>
                          
                          {formFields.map((field, index) => (
                              <div key={field.id} className="bg-white p-3 rounded-lg border border-gray-200 relative">
                                  <button 
                                    onClick={() => removeField(index)} 
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-lg leading-none"
                                  >
                                    ×
                                  </button>
                                  
                                  <input 
                                    type="text" 
                                    value={field.label} 
                                    onChange={(e) => updateField(index, 'label', e.target.value)} 
                                    className="w-full font-semibold text-sm border-b border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 outline-none pb-2 mb-2" 
                                    placeholder="e.g. Which events will you attend?"
                                  />
                                  
                                  <div className="flex gap-2 items-center flex-wrap">
                                      <select 
                                        value={field.type} 
                                        onChange={(e) => updateField(index, 'type', e.target.value)} 
                                        className="text-xs border border-gray-200 rounded-lg p-2 bg-white text-gray-900 flex-1 min-w-[120px]"
                                      >
                                          <option value="text">Short Text</option>
                                          <option value="textarea">Long Text</option>
                                          <option value="select">Dropdown (Single)</option>
                                          <option value="checkbox">Checkboxes (Multiple)</option>
                                          <option value="emoji">Emoji Picker</option>
                                      </select>
                                      <label className="flex items-center gap-1 text-xs text-gray-700 cursor-pointer">
                                          <input 
                                            type="checkbox" 
                                            checked={field.required} 
                                            onChange={(e) => updateField(index, 'required', e.target.checked)}
                                            className="rounded"
                                          />
                                          Required
                                      </label>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEmojiTarget({ type: 'field', index })
                                          setEmojiModalOpen(true)
                                        }}
                                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                                      >
                                        {field.emoji || '+ Icon'}
                                      </button>
                                  </div>
                                  
                                  {(field.type === 'select' || field.type === 'checkbox') && (
                                    <div className="mt-2">
                                      <input 
                                        type="text" 
                                        value={field.options} 
                                        onChange={(e) => updateField(index, 'options', e.target.value)} 
                                        placeholder={field.type === 'checkbox' 
                                          ? "e.g. Ceremony, Reception, After Party (comma separated)" 
                                          : t('option_placeholder')
                                        }
                                        className="w-full text-xs border border-gray-200 p-2 rounded-lg bg-gray-50 text-gray-900 placeholder:text-gray-400"
                                      />
                                      <p className="text-[10px] text-gray-400 mt-1">
                                        {field.type === 'checkbox' 
                                          ? "Users can select multiple options" 
                                          : "Users can select one option"
                                        }
                                      </p>
                                    </div>
                                  )}
                              </div>
                          ))}
                      </div>
                  </section>

                  {/* DETAIL BLOCKS */}
                  <section className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">{t('section_extra')}</h3>
                      
                      <div className="flex gap-2 mb-4 flex-wrap">
                          <button 
                            onClick={() => addBlock('timeline')} 
                            className="text-xs bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
                          >
                            {t('add_timeline_btn')}
                          </button>
                          <button 
                            onClick={() => addBlock('note')} 
                            className="text-xs bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
                          >
                            {t('add_note_btn')}
                          </button>
                          <button 
                            onClick={() => addBlock('link')} 
                            className="text-xs bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
                          >
                            {t('add_link_btn')}
                          </button>
                      </div>

                      <div className="space-y-3">
                          {detailBlocks.length === 0 && (
                            <p className="text-xs text-gray-500 italic text-center py-6">
                              {t('create.details_empty_msg')}
                            </p>
                          )}
                          
                          {detailBlocks.map((block, index) => (
                              <div key={block.id} className="bg-white p-3 rounded-lg border border-gray-200 relative">
                                  <button 
                                    onClick={() => removeBlock(index)} 
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-lg leading-none"
                                  >
                                    ×
                                  </button>
                                  
                                  {block.type === 'timeline' && (
                                      <div className="space-y-2">
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-semibold text-gray-700">Timeline</span>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setEmojiTarget({ type: 'block', index })
                                                setEmojiModalOpen(true)
                                              }}
                                              className="text-sm"
                                            >
                                              {block.emoji || '😊'}
                                            </button>
                                          </div>
                                          <div className="flex gap-2">
                                            <input 
                                              type="text" 
                                              value={block.content} 
                                              onChange={(e) => updateBlock(index, 'content', e.target.value)} 
                                              placeholder={t('timeline_time_ph')} 
                                              className="w-1/3 text-sm border border-gray-200 p-2 rounded-lg bg-white text-gray-900 placeholder:text-gray-400"
                                            />
                                            <input 
                                              type="text" 
                                              value={block.subContent} 
                                              onChange={(e) => updateBlock(index, 'subContent', e.target.value)} 
                                              placeholder={t('timeline_title_ph')} 
                                              className="flex-1 text-sm border border-gray-200 p-2 rounded-lg bg-white text-gray-900 placeholder:text-gray-400"
                                            />
                                          </div>
                                      </div>
                                  )}

                                  {block.type === 'note' && (
                                      <div className="space-y-2">
                                          <div className="flex justify-between items-center mb-2">
                                              <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-gray-700">Not</span>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setEmojiTarget({ type: 'block', index })
                                                    setEmojiModalOpen(true)
                                                  }}
                                                  className="text-sm"
                                                >
                                                  {block.emoji || '😊'}
                                                </button>
                                              </div>
                                              <label className="text-xs cursor-pointer text-indigo-600 hover:text-indigo-700">
                                                  {block.imageUrl ? t('create.btn_change_image') : t('image_upload_btn')}
                                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleBlockImageUpload(index, e)}/>
                                              </label>
                                          </div>
                                          <input 
                                            type="text" 
                                            value={block.title} 
                                            onChange={(e) => updateBlock(index, 'title', e.target.value)} 
                                            placeholder={t('note_title_ph')} 
                                            className="w-full text-sm border border-gray-200 p-2 rounded-lg bg-white text-gray-900 placeholder:text-gray-400"
                                          />
                                          <textarea 
                                            value={block.content} 
                                            onChange={(e) => updateBlock(index, 'content', e.target.value)} 
                                            placeholder={t('note_desc_ph')} 
                                            className="w-full text-xs border border-gray-200 p-2 rounded-lg h-16 resize-none bg-white text-gray-900 placeholder:text-gray-400"
                                          />
                                          {block.imageUrl && (
                                            <div className="relative h-20 w-20 bg-gray-100 rounded-lg overflow-hidden">
                                              <img src={block.imageUrl} className="object-cover w-full h-full"/>
                                              <button 
                                                onClick={() => updateBlock(index, 'imageUrl', '')} 
                                                className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1"
                                              >
                                                ×
                                              </button>
                                            </div>
                                          )}
                                      </div>
                                  )}

                                  {block.type === 'link' && (
                                      <div className="space-y-2">
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-semibold text-gray-700">Link</span>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setEmojiTarget({ type: 'block', index })
                                                setEmojiModalOpen(true)
                                              }}
                                              className="text-sm"
                                            >
                                              {block.emoji || '😊'}
                                            </button>
                                          </div>
                                          <input 
                                            type="text" 
                                            value={block.title} 
                                            onChange={(e) => updateBlock(index, 'title', e.target.value)} 
                                            placeholder={t('link_title_ph')} 
                                            className="w-full text-sm border border-gray-200 p-2 rounded-lg bg-white text-gray-900 placeholder:text-gray-400"
                                          />
                                          <input 
                                            type="text" 
                                            value={block.content} 
                                            onChange={(e) => updateBlock(index, 'content', e.target.value)} 
                                            placeholder={t('link_url_ph')} 
                                            className="w-full text-xs border border-gray-200 p-2 rounded-lg bg-white text-gray-900 placeholder:text-gray-400"
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
          <div className="bg-gray-100 flex items-center justify-center p-8 h-[calc(100vh-80px)] overflow-hidden sticky top-[80px]">
              <div className="w-[375px] h-[700px] bg-white rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden flex flex-col">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>
                  <div className="flex-1 overflow-y-auto pb-8 scrollbar-hide">
                        
                      {/* COVER */}
                      <div className="w-full h-36 bg-gray-200 relative">
                          {coverPreview ? (
                            <img src={coverPreview} className="w-full h-full object-cover"/>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                              {t('preview_cover_placeholder')}
                            </div>
                          )}
                          <div className="absolute inset-0 opacity-10" style={{ backgroundColor: themeColor }}></div>
                      </div>
                      
                      <div className="px-5 -mt-6 relative z-10">
                           <div className="bg-white rounded-xl shadow-lg p-4 border-t-4" style={{ borderColor: themeColor }}>
                              
                              {/* TITLE - Only if not on image */}
                              {!showTitleOnImage && (
                                <h1 className="text-center font-bold mb-2 leading-tight break-words" style={{ color: themeColor, fontFamily: titleFont, fontSize: `${titleSize}rem` }}>
                                  {title || t('preview_title_placeholder')}
                                </h1>
                              )}
                              
                              {/* MAIN IMAGE with OVERLAY */}
                              {mainPreview ? (
                                <div className="relative w-full h-96 min-h-[400px] sm:h-80 rounded-lg overflow-hidden mb-4">
                                  <img src={mainPreview} className="w-full h-full object-cover"/>
                                  
                                  {/* TEXT OVERLAY */}
                                  {(showTitleOnImage || showMessageOnImage || showDateOnImage) && (
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40 flex flex-col justify-between p-3 sm:p-6 text-white">
                                      
                                      {/* TOP - TITLE */}
                                      {showTitleOnImage && (
                                        <div className="text-center">
                                          <h1 
                                            className="font-bold drop-shadow-2xl" 
                                            style={{ 
                                              fontFamily: titleFont, 
                                              fontSize: `${titleSize * 0.8}rem`,
                                              textShadow: '0 4px 8px rgba(0,0,0,0.8)'
                                            }}
                                          >
                                            {title || 'Your Title'}
                                          </h1>
                                        </div>
                                      )}
                                      
                                      {/* CENTER - MESSAGE */}
                                      {showMessageOnImage && (
                                        <div className="flex-1 flex items-center justify-center py-2">
                                          <p 
                                            className="text-center whitespace-pre-line drop-shadow-lg max-w-xs" 
                                            style={{ 
                                              fontFamily: messageFont, 
                                              fontSize: `${messageSize * 0.9}rem`,
                                              textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                                            }}
                                          >
                                            {message || 'Your message here...'}
                                          </p>
                                        </div>
                                      )}
                                      
                                      {/* Empty spacer to push date to bottom if no message */}
                                      {!showMessageOnImage && <div className="flex-1 min-h-[20px]"></div>}
                                      
                                      {/* BOTTOM - DATE (Always at bottom when enabled) */}
                                      {showDateOnImage && eventDate && (
                                        <div className="text-center">
                                          {(() => {
                                            const style = DATE_DISPLAY_STYLES.find(s => s.id === dateDisplayStyle)
                                            const formatted = style?.format(eventDate)
                                            if (!formatted) return null
                                            return (
                                              <div className="space-y-0.5 sm:space-y-1">
                                                <p className="text-xs sm:text-sm font-bold drop-shadow-lg" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                                  {formatted.line1}
                                                </p>
                                                <p className="text-base sm:text-lg font-bold drop-shadow-lg" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                                  {formatted.line2}
                                                </p>
                                                {formatted.line3 && (
                                                  <p className="text-[10px] sm:text-xs font-semibold drop-shadow-lg opacity-90" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                                    {formatted.line3}
                                                  </p>
                                                )}
                                              </div>
                                            )
                                          })()}
                                        </div>
                                      )}
                                      
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="w-full h-80 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-xs text-gray-400">
                                  {t('preview_main_placeholder')}
                                </div>
                              )}
                              
                              {/* MESSAGE - Only if not on image */}
                              {!showMessageOnImage && (
                                <p className="text-center text-sm text-gray-600 whitespace-pre-line mb-4" style={{ fontFamily: messageFont, fontSize: `${messageSize}rem` }}>
                                  {message || 'Write your special message for your guests here...'}
                                </p>
                              )}
                              
                              {/* COUNTDOWN - Always show */}
                              {eventDate && (
                                <div className="my-4"><Countdown targetDate={eventDate} themeColor={themeColor} /></div>
                              )}

                              <hr className="my-4"/>
                              
                              <div className="text-center text-xs space-y-2 mb-6">
                                  <div className="p-2 bg-gray-50 rounded">
                                      <p className="font-bold">{locationName || t('preview_location_placeholder')}</p>
                                  </div>
                                  {locationUrl && (
                                    <div className="text-white text-xs py-1 px-2 rounded inline-block" style={{backgroundColor: themeColor}}>
                                      {t('preview_map_btn')}
                                    </div>
                                  )}
                                  <div className="p-2 bg-gray-50 rounded">
                                      <p className="text-gray-500">{formattedDate}</p>
                                  </div>
                              </div>

                              <div className="space-y-3 mb-6">
                                  {detailBlocks.map((block) => (
                                      <div key={block.id}>
                                          {block.type === 'timeline' && (
                                              <div className="flex items-center gap-3">
                                                  <div className="w-12 text-right text-xs font-bold text-gray-500">{block.content}</div>
                                                  <div className="w-2 h-2 rounded-full" style={{backgroundColor:themeColor}}></div>
                                                  <div className="flex-1 text-xs font-bold text-gray-800">
                                                    {block.emoji && <span className="mr-1">{block.emoji}</span>}
                                                    {block.subContent}
                                                  </div>
                                              </div>
                                          )}

                                          {block.type === 'note' && (
                                              <div className="bg-gray-50 p-3 rounded-lg text-center">
                                                  {block.imageUrl && <img src={block.imageUrl} className="w-full h-32 object-cover rounded mb-2"/>}
                                                  <h4 className="font-bold text-sm mb-1" style={{color:themeColor}}>
                                                    {block.emoji && <span className="mr-1">{block.emoji}</span>}
                                                    {block.title}
                                                  </h4>
                                                  <p className="text-xs text-gray-600">{block.content}</p>
                                              </div>
                                          )}

                                          {block.type === 'link' && (
                                              <div className="text-center">
                                                  <button className="w-full py-3 rounded-lg font-bold text-white text-sm" style={{backgroundColor: themeColor}}>
                                                      {block.emoji && <span className="mr-1">{block.emoji}</span>}
                                                      {block.title} ↗
                                                  </button>
                                              </div>
                                          )}
                                      </div>
                                  ))}
                              </div>
                              
                              <div className="mt-6 pt-4 border-t">
                                  <p className="text-center font-bold text-xs mb-3 text-gray-500">{t('preview_rsvp_title')}</p>
                                  <div className="space-y-2 pointer-events-none">
                                      <input className="w-full border p-2 rounded text-xs bg-gray-50" placeholder={t('preview_ph_name')}/>
                                      <input className="w-full border p-2 rounded text-xs bg-gray-50" placeholder={t('preview_ph_email')}/>
                                      <select className="w-full border p-2 rounded text-xs bg-gray-50">
                                        <option>{t('preview_ph_status')}</option>
                                      </select>
                                      
                                      {formFields.map(f => (
                                        <div key={f.id} className="flex items-start gap-2">
                                          {f.emoji && <span className="text-sm mt-2">{f.emoji}</span>}
                                          {f.type === 'select' 
                                            ? <select className="flex-1 border p-2 rounded text-xs bg-gray-50"><option>{f.label}</option></select>
                                            : f.type === 'checkbox'
                                            ? <div className="flex-1 space-y-1.5">
                                                <p className="text-xs font-semibold text-gray-700 mb-1">{f.label}</p>
                                                {f.options?.split(',').map((opt, i) => (
                                                  <label key={i} className="flex items-center gap-2 text-xs text-gray-600">
                                                    <input type="checkbox" className="rounded" />
                                                    <span>{opt.trim()}</span>
                                                  </label>
                                                ))}
                                              </div>
                                            : f.type === 'emoji'
                                            ? <div className="flex-1 border p-2 rounded text-xs bg-gray-50">{f.label} (Emoji)</div>
                                            : f.type === 'textarea'
                                            ? <textarea className="flex-1 border p-2 rounded text-xs h-16 bg-gray-50" placeholder={f.label}/>
                                            : <input className="flex-1 border p-2 rounded text-xs bg-gray-50" placeholder={f.label}/>
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
    </>
  )
}

export default function CreateEventPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Yükleniyor...</p>
                </div>
            </div>
        }>
            <CreateEventContent />
        </Suspense>
    )
}