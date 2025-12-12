'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import RsvpForm from './RsvpForm'
import PhotoGallery from './PhotoGallery'
import Countdown from './Countdown'
import { useRouter } from 'next/navigation' 
import Link from 'next/link'
import { useTranslation } from '../i18n'

export default function EventView({ slug }: { slug: string }) {
  const router = useRouter()
  const { t, language } = useTranslation()
  
  // STATE TANIMLARI
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false) 
  const [isEditing, setIsEditing] = useState(false) // YENİ: Düzenleme modu state'i

  // 1. BAŞLANGIÇ KONTROLLERİ
  useEffect(() => {
    const fetchData = async () => {
      // A. Etkinlik Verisini Çek
      const { data, error } = await supabase.from('events').select('*').eq('slug', slug).single()
      
      if (error || !data) {
        setLoading(false)
        return
      }

      setEvent(data)

      // B. Giriş Yapan Kişi "Etkinlik Sahibi" mi?
      const { data: authData } = await supabase.auth.getSession()
      const currentUserId = authData.session?.user.id
      
      if (currentUserId && data.user_id === currentUserId) {
          setIsOwner(true) 
      }

      // C. Misafir Daha Önce Giriş Yapmış mı? (LocalStorage Kontrolü)
      if (typeof window !== 'undefined') {
          const savedEmail = localStorage.getItem(`guest_access_${slug}`)
          if (savedEmail) {
              setCurrentUserEmail(savedEmail)
          }
      }

      setLoading(false)
    }
    fetchData()
  }, [slug, router]) 

  // 2. MİSAFİR GİRİŞ YAPINCA VEYA GÜNCELLEME YAPINCA ÇALIŞACAK FONKSİYON
  const handleGuestLogin = (email: string) => {
    setCurrentUserEmail(email)
    setIsOwner(false)
    setIsEditing(false) // YENİ: Başarılı işlem sonrası düzenleme modunu kapat
    
    if (typeof window !== 'undefined') {
        localStorage.setItem(`guest_access_${slug}`, email)
        localStorage.setItem('cereget_guest_email', email)
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center">{t('loading')}</div>
  if (!event) return <div className="h-screen flex items-center justify-center">{t('public_not_found')}</div>

  // Stil ve Tema Ayarları
  const themeColor = event.design_settings?.theme || '#4F46E5'
  const titleFont = event.design_settings?.titleFont || "'Inter', sans-serif"
  const titleSize = event.design_settings?.titleSize || 2.5
  const messageFont = event.design_settings?.messageFont || "'Inter', sans-serif"
  const messageSize = event.design_settings?.messageSize || 1
  
  const formattedDate = event.event_date 
    ? new Date(event.event_date).toLocaleString(language === 'tr' ? 'tr-TR' : language, { dateStyle: 'long', timeStyle: 'short' })
    : '...'

  const detailBlocks = event.event_details || []
  
  const canAccessGallery = currentUserEmail || isOwner

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pb-20 font-sans">
      
      {/* 1. KAPAK GÖRSELİ */}
      {event.image_url ? (
        <div className="w-full max-h-[350px] overflow-hidden bg-gray-100 flex items-center justify-center relative" style={{ backgroundColor: themeColor + '10' }}>
          <img src={event.image_url} className="object-cover w-full h-full" alt="Event Cover" />
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
      ) : (
        <div className="w-full h-32 bg-gray-50"></div>
      )}

      {/* 2. ANA KART (Başlık, Detaylar vs.) */}
      <div className="max-w-xl w-full px-5 -mt-10 relative z-10">
        <div className="bg-white rounded-xl shadow-xl p-8 border-t-4" style={{ borderColor: themeColor }}>
          
          <h1 className="font-bold text-center mb-6 leading-tight" style={{ color: themeColor, fontFamily: titleFont, fontSize: `${titleSize}rem` }}>{event.title}</h1>

          {event.main_image_url && (
            <div className="mb-8 rounded-xl overflow-hidden shadow-md">
                <img src={event.main_image_url} className="w-full h-auto object-cover" alt="Main Event" />
            </div>
          )}

          {event.message && (
            <p className="text-center text-gray-600 mb-8 whitespace-pre-line leading-relaxed" style={{ fontFamily: messageFont, fontSize: `${messageSize}rem` }}>{event.message}</p>
          )}

          {event.event_date && <div className="mb-8"><Countdown targetDate={event.event_date} themeColor={themeColor} /></div>}

          <hr className="my-8 border-gray-100"/>
          
          <div className="grid grid-cols-1 gap-4 text-center mb-10">
             <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                <p className="font-bold text-gray-800 text-lg mb-1">{t('public_date_label')}</p>
                <p className="text-gray-600">{formattedDate}</p>
             </div>
             <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                <p className="font-bold text-gray-800 text-lg mb-1">{t('public_location_label')}</p>
                <p className="text-gray-600 mb-4">{event.location_name || '...'}</p>
                {event.location_url && (
                    <a href={event.location_url} target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-2 rounded-full text-sm font-bold text-white transition hover:opacity-90 shadow-md transform hover:scale-105" style={{ backgroundColor: themeColor }}>
                        {t('public_directions_btn')}
                    </a>
                )}
             </div>
          </div>

          {/* DETAY BLOKLARI */}
          {detailBlocks.length > 0 && (
            <div className="space-y-8 mb-4">
                <h3 className="text-center font-bold text-gray-400 text-xs uppercase tracking-widest mb-4">{t('public_details_title')}</h3>
                
                {detailBlocks.map((block: any, index: number) => (
                    <div key={index} className="animate-fadeIn">
                        {block.type === 'timeline' && (
                            <div className="flex group">
                                <div className="w-16 pt-1 text-right pr-4"><span className="text-sm font-bold text-gray-500">{block.content}</span></div>
                                <div className="relative flex flex-col items-center">
                                    <div className="w-3 h-3 rounded-full border-2 bg-white z-10" style={{ borderColor: themeColor }}></div>
                                    {index !== detailBlocks.length - 1 && <div className="w-0.5 bg-gray-200 h-full absolute top-3"></div>}
                                </div>
                                <div className="flex-1 pl-4 pb-8"><h4 className="font-bold text-gray-800 text-lg">{block.subContent}</h4></div>
                            </div>
                        )}
                        {block.type === 'note' && (
                            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm text-center mb-4">
                                {block.imageUrl && <div className="mb-4 rounded-lg overflow-hidden h-40 w-full"><img src={block.imageUrl} className="w-full h-full object-cover" alt="Note" /></div>}
                                <h3 className="font-bold text-lg mb-2" style={{ color: themeColor }}>{block.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{block.content}</p>
                            </div>
                        )}
                        {block.type === 'link' && (
                            <div className="mb-4">
                                <a href={block.content} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-4 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1" style={{ backgroundColor: themeColor }}>
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

      {/* --- 3. RSVP FORM VE DURUM ALANI --- */}
      <div className="max-w-xl w-full px-6 mt-12">
          
          {/* DURUM 1: Form Gösterilecekse (Sahip değilse VE (Giriş yapmamışsa YA DA Düzenleme Modundaysa)) */}
          {!isOwner && (!currentUserEmail || isEditing) && (
            <RsvpForm 
                eventId={event.id} 
                themeColor={themeColor} 
                onLoginSuccess={handleGuestLogin}
                initialEmail={currentUserEmail} // Düzenleme modunda e-posta gönderilir
            />
          )}

          {/* DURUM 2: Bilgi Mesajı Gösterilecekse (Sahipse YA DA (Giriş yapmışsa VE Düzenleme Modunda Değilse)) */}
          {(isOwner || (currentUserEmail && !isEditing)) && (
              <div className="bg-green-50 p-6 rounded-xl text-center border border-green-100 shadow-sm relative animate-fadeIn">
                  <div className="text-3xl mb-2">🎉</div>
                  <p className="text-green-800 font-bold text-lg">
                      {isOwner ? t('owner_view_alert') : t('rsvp_registered_success')}
                  </p>
                  <p className="text-green-600 text-sm mt-1 mb-4">
                      {t('public_gallery_hint') || "Aşağıdaki alandan fotoğraflara bakabilirsiniz."}
                  </p>
                  
                  {/* SADECE MİSAFİRLER İÇİN DÜZENLEME BUTONU */}
                  {!isOwner && currentUserEmail && (
                    <div className="mt-4 pt-4 border-t border-green-100">
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="text-xs font-bold underline text-green-700 hover:text-green-900 cursor-pointer transition"
                        >
                            Daha önce formu doldurdunuz.<br/>Değişiklik yapmak için tıklayın.
                        </button>
                    </div>
                  )}
              </div>
          )}
      </div>
      {/* --- RSVP BÖLÜMÜ SONU --- */}

      {/* 4. FOTOĞRAF GALERİSİ (MEMORY WALL) */}
      <div className="max-w-xl w-full px-6 mt-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: themeColor }}>
            {t('public_memory_wall')}
        </h2>
        {canAccessGallery ? (
             <PhotoGallery 
                eventId={event.id} 
                currentUserEmail={isOwner ? 'owner' : currentUserEmail!} 
                themeColor={themeColor} 
             />
        ) : (
            <div className="bg-gray-50 rounded-2xl p-10 text-center border-2 border-dashed border-gray-200">
                <div className="text-5xl mb-4 opacity-50">🔒</div>
                <h3 className="font-bold text-gray-800 text-lg">{t('public_gallery_locked')}</h3>
                <p className="text-sm text-gray-500 mt-2">{t('public_gallery_hint')}</p>
            </div>
        )}
      </div>

      {/* 5. ALT AKSİYON BUTONU */}
      <div className="max-w-xl w-full px-6 mt-12 pb-10">
          <div className="block w-full text-center">
          <button 
                onClick={() => {
                    const emailToSave = currentUserEmail || localStorage.getItem(`guest_access_${slug}`)
                    
                    if (emailToSave) {
                        localStorage.setItem('cereget_guest_email', emailToSave)
                        router.push('/')
                    } else {
                        router.push('/landing')
                    }
                }}
                className="bg-gray-100 text-gray-600 px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition text-sm w-full md:w-auto"
            >
                {isOwner 
                ? t('public_back_dashboard') 
                : (currentUserEmail ? t('public_go_panel_create') : t('public_create_own'))
                }
          </button>
          </div>
      </div>

    </div>
  )
}