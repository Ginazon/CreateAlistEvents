'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import RsvpForm from './RsvpForm'
import PhotoGallery from './PhotoGallery'
import Countdown from './Countdown'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation, LangType } from '../i18n'
import type { Event, DetailBlock } from '../types'

const DATE_DISPLAY_STYLES = [
  { 
    id: 'full', 
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
    format: (date: string): { line1: string; line2: string; line3?: string } => {
      const d = new Date(date)
      return {
        line1: `${d.toLocaleDateString('en-US', { month: 'long' })} ${d.getDate()}`,
        line2: d.getFullYear().toString()
      }
    }
  }
]

// Helper: Extract Google Maps coordinates from URL
const extractMapCoordinates = (url: string): { lat: number, lng: number } | null => {
  try {
    const match1 = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (match1) return { lat: parseFloat(match1[1]), lng: parseFloat(match1[2]) }
    
    const match2 = url.match(/place\/[^\/]+\/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (match2) return { lat: parseFloat(match2[1]), lng: parseFloat(match2[2]) }
    
    const match3 = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (match3) return { lat: parseFloat(match3[1]), lng: parseFloat(match3[2]) }
    
    return null
  } catch {
    return null
  }
}

export default function EventView({ slug }: { slug: string }) {
  const router = useRouter()
  const { t, language, setLanguage } = useTranslation()

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showMap, setShowMap] = useState(false)

  // Google Fonts URL - Same as Create Page
  const GOOGLE_FONTS_URL = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Inter:wght@400;700&family=Lobster&family=Merriweather:wght@400;700&family=Pacifico&family=Playfair+Display:wght@400;700&family=Roboto:wght@400;700&display=swap"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('events')
          .select('*')
          .eq('slug', slug)
          .single()

        if (fetchError || !data) {
          setError(t('public_not_found'))
          setLoading(false)
          return
        }

        setEvent(data)

        const { data: authData } = await supabase.auth.getSession()
        const currentUserId = authData.session?.user.id

        if (currentUserId && data.user_id === currentUserId) {
          setIsOwner(true)
        }

        if (typeof window !== 'undefined') {
          const savedEmail = localStorage.getItem(`guest_access_${slug}`)
          if (savedEmail) {
            setCurrentUserEmail(savedEmail)
          }
        }

        setLoading(false)
      } catch (err) {
        console.error('EventView fetch error:', err)
        setError(t('error.something_went_wrong') || 'Bir hata oluştu')
        setLoading(false)
      }
    }
    fetchData()
  }, [slug, t])

  const handleGuestLogin = (email: string) => {
    setCurrentUserEmail(email)
    setIsOwner(false)
    setIsEditing(false)

    if (typeof window !== 'undefined') {
      localStorage.setItem(`guest_access_${slug}`, email)
      localStorage.setItem('createalist_guest_email', email)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {error || t('public_not_found')}
          </h2>
          <Link href="/">
            <button className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
              {t('error.go_home') || 'Ana Sayfa'}
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const themeColor = event.design_settings?.theme || '#4F46E5'
  const titleFont = event.design_settings?.titleFont || "'Inter', sans-serif"
  const titleSize = event.design_settings?.titleSize || 2.5
  const messageFont = event.design_settings?.messageFont || "'Inter', sans-serif"
  const messageSize = event.design_settings?.messageSize || 1
  const showTitleOnImage = event.design_settings?.showTitleOnImage || false
  const showMessageOnImage = event.design_settings?.showMessageOnImage || false
  const showDateOnImage = event.design_settings?.showDateOnImage || false
  const dateDisplayStyle = event.design_settings?.dateDisplayStyle || 'full'

  const formattedDate = event.event_date
    ? new Date(event.event_date).toLocaleString(language === 'tr' ? 'tr-TR' : language, {
        dateStyle: 'long',
        timeStyle: 'short',
      })
    : '...'

  const detailBlocks = (event.event_details || []) as DetailBlock[]
  const canAccessGallery = currentUserEmail || isOwner
  const mapCoords = event.location_url ? extractMapCoordinates(event.location_url) : null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pb-20 font-sans">
      {/* Load Google Fonts */}
      <link href={GOOGLE_FONTS_URL} rel="stylesheet" />
      
      {/* LANGUAGE SELECTOR - Fixed Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value as LangType)}
          className="bg-white border border-gray-200 text-gray-700 text-xs rounded-lg px-3 py-2 shadow-md font-semibold uppercase cursor-pointer hover:bg-gray-50 transition focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="tr">TR</option>
          <option value="en">EN</option>
          <option value="de">DE</option>
          <option value="fr">FR</option>
          <option value="es">ES</option>
          <option value="it">IT</option>
          <option value="ru">RU</option>
          <option value="ar">AR</option>
        </select>
      </div>

      {/* COVER IMAGE */}
      {event.image_url ? (
        <div className="w-full max-h-[350px] overflow-hidden bg-gray-100 flex items-center justify-center relative">
          <img src={event.image_url} className="object-cover w-full h-full" alt={`${event.title} - Cover`} />
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
      ) : (
        <div className="w-full h-32 bg-gray-100"></div>
      )}

      {/* MAIN CARD */}
      <div className="max-w-xl w-full px-5 -mt-10 relative z-10">
        <div className="bg-white rounded-xl shadow-lg p-8 border-t-4" style={{ borderColor: themeColor }}>
        {!showTitleOnImage && (
            <h1
              className="font-bold text-center mb-6 leading-tight"
              style={{ color: themeColor, fontFamily: titleFont, fontSize: `${titleSize}rem` }}
            >
              {event.title}
            </h1>
          )}

{event.main_image_url && (
            <div className="relative mb-8 rounded-xl overflow-hidden shadow-sm">
              <img src={event.main_image_url} className="w-full h-auto object-cover" alt={`${event.title} - Main`} />
              
              {(showTitleOnImage || showMessageOnImage || showDateOnImage) && (
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40 flex flex-col justify-between p-8 text-white">
                  
                  {showTitleOnImage && (
                    <div className="text-center">
                      <h1 
                        className="font-bold drop-shadow-2xl" 
                        style={{ 
                          fontFamily: titleFont, 
                          fontSize: `${titleSize}rem`,
                          textShadow: '0 4px 8px rgba(0,0,0,0.8)'
                        }}
                      >
                        {event.title}
                      </h1>
                    </div>
                  )}
                  
                  {showMessageOnImage && event.message && (
                    <div className="flex-1 flex items-center justify-center">
                      <p 
                        className="text-center whitespace-pre-line drop-shadow-lg max-w-md" 
                        style={{ 
                          fontFamily: messageFont, 
                          fontSize: `${messageSize}rem`,
                          textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                        }}
                      >
                        {event.message}
                      </p>
                    </div>
                  )}
                  
                  {showDateOnImage && event.event_date && (
  <div className="text-center">
    {(() => {
      const style = DATE_DISPLAY_STYLES.find(s => s.id === dateDisplayStyle)
      if (!style) return null
      
      const formatted = style.format(event.event_date)
      
      return (
        <div className="space-y-1">
          <p className="text-base font-bold drop-shadow-lg" 
             style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            {formatted.line1}
          </p>
          <p className="text-xl font-bold drop-shadow-lg" 
             style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            {formatted.line2}
          </p>
          {formatted.line3 && (
            <p className="text-sm font-semibold drop-shadow-lg opacity-90" 
               style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
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
          )}

{!showMessageOnImage && event.message && (
            <p
              className="text-center text-gray-600 mb-8 whitespace-pre-line leading-relaxed"
              style={{ fontFamily: messageFont, fontSize: `${messageSize}rem` }}
            >
              {event.message}
            </p>
          )}
            {event.event_date && !showDateOnImage && (
            <div className="mb-8">
              <Countdown targetDate={event.event_date} themeColor={themeColor} />
            </div>
          )}
          <hr className="my-8 border-gray-200" />

          <div className="grid grid-cols-1 gap-4 text-center mb-10">
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
              <p className="font-bold text-gray-800 text-lg mb-1">{t('public_date_label')}</p>
              <p className="text-gray-600">{formattedDate}</p>
            </div>
            
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
              <p className="font-bold text-gray-800 text-lg mb-1">{t('public_location_label')}</p>
              <p className="text-gray-600 mb-4">{event.location_name || '...'}</p>
              
              {event.location_url && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="inline-block px-6 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition mr-2"
                  >
                    {showMap ? '🗺️ Haritayı Gizle' : '📍 Haritayı Göster'}
                  </button>
                  
                  <a
                    href={event.location_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-2 rounded-lg text-sm font-semibold text-white transition hover:opacity-90 shadow-sm"
                    style={{ backgroundColor: themeColor }}
                  >
                    {t('public_directions_btn')}
                  </a>
                </div>
              )}
              
              {/* MAP PREVIEW */}
              {showMap && event.location_url && (
                <div className="mt-4 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
                  <iframe
                    src={mapCoords 
                      ? `https://maps.google.com/maps?q=${mapCoords.lat},${mapCoords.lng}&z=15&output=embed`
                      : event.location_url.includes('/search/')
                      ? `https://maps.google.com/maps?q=${event.location_url.split('/search/')[1]}&output=embed`
                      : `https://maps.google.com/maps?q=${encodeURIComponent(event.location_name || '')}&output=embed`
                    }
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </div>
          </div>

          {/* DETAIL BLOCKS */}
          {detailBlocks.length > 0 && (
            <div className="space-y-8 mb-4">
              <h3 className="text-center font-bold text-gray-400 text-xs uppercase tracking-widest mb-4">
                {t('public_details_title')}
              </h3>

              {detailBlocks.map((block, index) => (
                <div key={block.id} className="animate-fadeIn">
                  {block.type === 'timeline' && (
                    <div className="flex group">
                      <div className="w-16 pt-1 text-right pr-4">
                        <span className="text-sm font-bold text-gray-500">{block.content}</span>
                      </div>
                      <div className="relative flex flex-col items-center">
                        <div
                          className="w-3 h-3 rounded-full border-2 bg-white z-10"
                          style={{ borderColor: themeColor }}
                        ></div>
                        {index !== detailBlocks.length - 1 && (
                          <div className="w-0.5 bg-gray-200 h-full absolute top-3"></div>
                        )}
                      </div>
                      <div className="flex-1 pl-4 pb-8">
                        <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                          {block.emoji && <span>{block.emoji}</span>}
                          {block.subContent}
                        </h4>
                      </div>
                    </div>
                  )}
                  
                  {block.type === 'note' && (
                    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm text-center mb-4">
                      {block.imageUrl && (
                        <div className="mb-4 rounded-lg overflow-hidden h-40 w-full">
                          <img src={block.imageUrl} className="w-full h-full object-cover" alt="Note" />
                        </div>
                      )}
                      <h3 className="font-bold text-lg mb-2 flex items-center justify-center gap-2" style={{ color: themeColor }}>
                        {block.emoji && <span>{block.emoji}</span>}
                        {block.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{block.content}</p>
                    </div>
                  )}
                  
                  {block.type === 'link' && (
                    <div className="mb-4">
                      <a
                        href={block.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center py-4 rounded-xl font-bold text-white shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                        style={{ backgroundColor: themeColor }}
                      >
                        {block.emoji && <span className="text-xl">{block.emoji}</span>}
                        {block.title} ↗
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RSVP FORM AND STATUS AREA */}
      <div className="max-w-xl w-full px-6 mt-12">
        {((!currentUserEmail && !isOwner) || isEditing) && (
          <RsvpForm
            eventId={event.id}
            themeColor={themeColor}
            onLoginSuccess={handleGuestLogin}
            initialEmail={currentUserEmail}
          />
        )}

        {!isEditing && (isOwner || currentUserEmail) && (
          <div className="bg-green-50 p-6 rounded-xl text-center border border-green-200 shadow-sm relative animate-fadeIn">
            <div className="text-3xl mb-2">🎉</div>
            <p className="text-green-800 font-bold text-lg">
              {isOwner ? t('owner_view_alert') : t('rsvp_registered_success')}
            </p>
            <p className="text-green-600 text-sm mt-1 mb-4">{t('public_gallery_hint')}</p>

            {isOwner && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-bold underline text-green-700 hover:text-green-900 cursor-pointer transition flex items-center justify-center gap-2 w-full"
                >
                  <span>📝</span> {t('rsvp_title')} {t('preview_submit_btn')} / {t('preview_rsvp_title')}
                </button>
                <p className="text-[10px] text-green-600 mt-2 opacity-70">({t('rsvp_already_registered')})</p>
              </div>
            )}

            {!isOwner && currentUserEmail && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-bold underline text-green-700 hover:text-green-900 cursor-pointer transition"
                >
                  {t('rsvp.edit_prompt')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PHOTO GALLERY */}
      <div className="max-w-xl w-full px-6 mt-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: themeColor }}>
          {t('public_memory_wall')}
        </h2>
        {canAccessGallery ? (
          <PhotoGallery eventId={event.id} currentUserEmail={isOwner ? 'owner' : currentUserEmail!} themeColor={themeColor} />
        ) : (
          <div className="bg-gray-50 rounded-xl p-10 text-center border-2 border-dashed border-gray-300">
            <div className="text-5xl mb-4 opacity-50">🔒</div>
            <h3 className="font-bold text-gray-800 text-lg">{t('public_gallery_locked')}</h3>
            <p className="text-sm text-gray-500 mt-2">{t('public_gallery_hint')}</p>
          </div>
        )}
      </div>

      {/* BOTTOM ACTION BUTTON */}
      <div className="max-w-xl w-full px-6 mt-12 pb-10">
        <div className="block w-full text-center">
          <button
            onClick={() => {
              const emailToSave = currentUserEmail || localStorage.getItem(`guest_access_${slug}`)

              if (emailToSave) {
                localStorage.setItem('createalist_guest_email', emailToSave)
                router.push('/')
              } else {
                router.push('/landing')
              }
            }}
            className="bg-gray-100 text-gray-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition text-sm w-full md:w-auto"
          >
            {isOwner
              ? t('public_back_dashboard')
              : currentUserEmail
              ? t('public_go_panel_create')
              : t('public_create_own')}
          </button>
        </div>
      </div>
    </div>
  )
}