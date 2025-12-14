'use client'

import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient' 
import { QRCodeCanvas } from 'qrcode.react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import GuestManager from './components/GuestManager'
import { useTranslation, LangType } from './i18n'

export default function Dashboard() {
  const router = useRouter()
  const { t, language, setLanguage } = useTranslation() 
  
  const [session, setSession] = useState<any>(null)
  
  const [credits, setCredits] = useState<number | null>(null)
  const [myEvents, setMyEvents] = useState<any[]>([])
  const [invitedEvents, setInvitedEvents] = useState<any[]>([])
  const [packages, setPackages] = useState<any[]>([]) 
  
  const [activeTab, setActiveTab] = useState<'created' | 'invited'>('created')
  const [loading, setLoading] = useState(true)
  const [origin, setOrigin] = useState('')

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [showQrId, setShowQrId] = useState<string | null>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [detailTab, setDetailTab] = useState<'guests' | 'photos'>('guests')
  const [loadingDetails, setLoadingDetails] = useState(false)

  const logoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/brand/logo.png`

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin)

    const checkUser = async () => {
        const { data } = await supabase.auth.getSession()
        
        if (data.session) {
            setSession(data.session)
            fetchCredits(data.session.user.id)
            fetchMyEvents(data.session.user.id)
            
            if (data.session.user.email) {
                fetchInvitedEvents(data.session.user.email)
            }
            
            fetchPackages()
        } else {
            const guestEmail = localStorage.getItem('createalist_guest_email') 
            
            if (guestEmail) {
                console.log("Misafir girişi onaylandı:", guestEmail)
                // @ts-ignore
                setSession({ user: { email: guestEmail, isGuest: true } }) 
                setActiveTab('invited') 
                fetchInvitedEvents(guestEmail)
                fetchPackages() 
            } else {
                console.warn("Kimlik bulunamadı, Landing'e yönlendiriliyor...")
                router.push('/landing')
            }
        }
    }

    checkUser()
  }, [router])

    
  const handleLogout = async () => {
      await supabase.auth.signOut()
      localStorage.removeItem('createalist_guest_email')
      setSession(null)
      router.push('/landing')
      router.refresh()
  }

  const fetchCredits = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('credits').eq('id', userId).single()
    if (data) setCredits(data.credits)
  }

  const fetchMyEvents = async (userId: string) => {
    const { data } = await supabase.from('events').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (data) setMyEvents(data)
    setLoading(false)
  }

  const fetchInvitedEvents = async (email: string) => {
    if (!email) return

    const { data: guestEntries, error } = await supabase
      .from('guests')
      .select(`
          event_id,
          events!inner (  
              id, title, slug, event_date, image_url, location_name, design_settings
          )
      `)
      .ilike('email', email) 
      
    if (error) {
        console.error("Davetleri çekerken hata:", error.message)
        return
    }

    if (guestEntries) {
        // @ts-ignore
        const formattedEvents = guestEntries.map(g => g.events)
        setInvitedEvents(formattedEvents)
    }
  }

  const fetchPackages = async () => {
      const { data } = await supabase
        .from('credit_packages')
        .select('*')
        .order('credits_amount', { ascending: true })
      
      if (data) setPackages(data)
  }

  const fetchEventDetails = async (eventId: string) => {
    setSelectedEventId(eventId)
    setLoadingDetails(true)
    const { data: p } = await supabase.from('photos').select('*').eq('event_id', eventId).order('created_at', { ascending: false })
    if (p) setPhotos(p)
    setLoadingDetails(false)
  }

  const handleCreateEvent = () => {
    // @ts-ignore
    if (session?.user?.isGuest) {
      alert(t('dashboard.alert_guest_cannot_create'))
      return
    }

    if (credits === null) {
      alert(t('dashboard.alert_loading_credits'))
      return
    }
    
    if (credits < 1) {
      alert(t('dashboard.alert_insufficient_credits'))
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
      return
    }
    
    router.push('/create')
  }

  const deletePhoto = async (id: string) => {
    if (!confirm(t('confirm_delete'))) return
    await supabase.from('photos').delete().eq('id', id)
    setPhotos(photos.filter(p => p.id !== id))
  }

  const downloadQRCode = (slug: string) => {
    const canvas = document.getElementById(`qr-${slug}`) as HTMLCanvasElement
    if (canvas) {
        const link = document.createElement("a")
        link.href = canvas.toDataURL("image/png")
        link.download = `${slug}-qr.png`
        link.click()
    }
  }

  if (!session) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">{t('loading')}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center bg-white p-6 rounded-t-xl shadow-sm border border-b-0">
            <div className="flex items-center gap-3">
                <img 
                    src={logoUrl} 
                    alt="Logo" 
                    className="h-8 w-auto object-contain hidden md:block" 
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{t('dashboard_title')}</h1>
                    <p className="text-gray-500 text-sm">{t('dashboard_subtitle')}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value as LangType)}
                    className="bg-gray-100 border border-gray-200 text-gray-700 text-xs rounded-lg px-3 py-2 font-semibold uppercase cursor-pointer hover:bg-gray-200 transition focus:ring-2 focus:ring-indigo-500 outline-none"
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
                <button onClick={handleLogout} className="text-gray-400 hover:text-gray-700 text-sm font-medium transition">
                    {t('logout')}
                </button>
            </div>
        </div>
        
        {/* KREDİ & AKSİYON ALANI */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-b-xl shadow-sm border-b border-x mb-8 space-y-3 md:space-y-0">
            <div className="order-2 md:order-1 bg-gray-50 border border-gray-200 px-6 py-4 rounded-lg flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
                <div className="text-2xl">💰</div>
                <div>
                    <p className="text-xs uppercase font-semibold text-gray-500">{t('my_credits')}</p>
                    <p className="text-2xl font-bold text-gray-900">{credits !== null ? credits : '...'}</p>
                </div>
            </div>
            
            <div className="order-1 md:order-2 w-full md:w-auto">
                <button 
                    onClick={handleCreateEvent}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition w-full md:w-auto"
                >
                    {t('create_new_event')}
                </button>
            </div>
        </div>

        {/* SEKME BAŞLIKLARI */}
        <div className="flex gap-2 mb-6">
            <button 
                onClick={() => setActiveTab('created')}
                className={`px-6 py-3 rounded-lg font-semibold text-sm transition ${
                    activeTab === 'created' 
                        ? 'bg-white text-indigo-600 shadow-sm border border-gray-200' 
                        : 'text-gray-600 hover:bg-white/50'
                }`}
            >
                {t('tab_created')}
            </button>
            <button 
                onClick={() => setActiveTab('invited')}
                className={`px-6 py-3 rounded-lg font-semibold text-sm transition ${
                    activeTab === 'invited' 
                        ? 'bg-white text-indigo-600 shadow-sm border border-gray-200' 
                        : 'text-gray-600 hover:bg-white/50'
                }`}
            >
                {t('tab_invited')} ({invitedEvents.length})
            </button>
        </div>

        {/* LİSTE İÇERİĞİ */}
        <div className="space-y-4">
            
            {/* 1. KENDİ ETKİNLİKLERİM */}
            {activeTab === 'created' && (
                <>
                    {myEvents.length === 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center animate-fadeIn">
                            <div className="max-w-3xl mx-auto">
                                <div className="text-6xl mb-4">📝</div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('dashboard.empty_state_title')}</h2>
                                <p className="text-gray-500 mb-8">{t('dashboard.empty_state_desc')}</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {packages.map((pkg) => (
                                        <div key={pkg.id} className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-indigo-600 transition flex flex-col items-center bg-white">
                                            <h3 className="font-bold text-lg text-gray-800 mb-2">{pkg.package_name || t('dashboard.package_default_name')}</h3>
                                            <div className="text-4xl font-bold text-indigo-600 mb-2">
                                                {pkg.credits_amount} <span className="text-sm text-gray-400 font-normal">{t('dashboard.credit_label')}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mb-6 text-center">{t('dashboard.package_lifetime_note')}</p>
                                            <a 
                                                href={pkg.etsy_link || `https://www.etsy.com/listing/${pkg.etsy_listing_id}`} 
                                                target="_blank" 
                                                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                                            >
                                                {t('dashboard.btn_buy_etsy')}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-6">{t('dashboard.buy_success_note')}</p>
                            </div>
                        </div>
                    )}
                    
                    {myEvents.map(event => {
                        // Etkinlik düzenlenebilir mi? (tarih geçmemişse)
                        const isEditable = !event.event_date || new Date(event.event_date) > new Date()
                        const isPast = event.event_date && new Date(event.event_date) <= new Date()
                        
                        return (
                        <div key={event.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition hover:shadow-md">
                            <div className="flex justify-between items-center flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-12 rounded-full bg-indigo-600" style={{ backgroundColor: event.design_settings?.theme }}></div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg text-gray-900">{event.title}</h3>
                                            {isPast && (
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
                                                    Tamamlandı
                                                </span>
                                            )}
                                        </div>
                                        <a href={`/${event.slug}`} target="_blank" className="text-indigo-600 text-xs font-medium hover:underline">
                                            {origin}/{event.slug} ↗
                                        </a>
                                        {event.event_date && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                📅 {new Date(event.event_date).toLocaleDateString('tr-TR')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <button 
                                        onClick={() => setShowQrId(showQrId === event.id ? null : event.id)} 
                                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                                    >
                                        QR
                                    </button>
                                    
                                    {isEditable ? (
                                        <Link href={`/create?edit=${event.id}`}>
                                            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                                                {t('edit')}
                                            </button>
                                        </Link>
                                    ) : (
                                        <button 
                                            disabled
                                            className="bg-gray-100 text-gray-400 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed relative group"
                                            title="Etkinlik tarihi geçti, düzenlenemez"
                                        >
                                            🔒 {t('edit')}
                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
                                                Etkinlik tarihi geçti
                                            </span>
                                        </button>
                                    )}
                                    
                                    <button 
                                        onClick={() => selectedEventId === event.id ? setSelectedEventId(null) : fetchEventDetails(event.id)} 
                                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                                    >
                                        {t('manage')}
                                    </button>
                                </div>
                            </div>

                            {showQrId === event.id && (
                                <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200 flex flex-col items-center animate-fadeIn">
                                    <div className="p-3 bg-white rounded-lg shadow-sm mb-4">
                                        <QRCodeCanvas id={`qr-${event.slug}`} value={`${origin}/${event.slug}`} size={160} level={"H"}/>
                                    </div>
                                    <button 
                                        onClick={() => downloadQRCode(event.slug)} 
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                                    >
                                        {t('download')}
                                    </button>
                                </div>
                            )}

                            {selectedEventId === event.id && (
                                <div className="mt-6 border-t pt-6">
                                    <div className="flex gap-6 border-b border-gray-200 mb-6 pb-1">
                                        <button 
                                            onClick={() => setDetailTab('guests')} 
                                            className={`pb-2 px-3 text-sm font-semibold transition ${
                                                detailTab==='guests' 
                                                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                                                    : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            {t('guests_tab')}
                                        </button>
                                        <button 
                                            onClick={() => setDetailTab('photos')} 
                                            className={`pb-2 px-3 text-sm font-semibold transition ${
                                                detailTab==='photos' 
                                                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                                                    : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            {t('photos_tab')} ({photos.length})
                                        </button>
                                    </div>

                                    {loadingDetails ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                                            <p className="text-gray-400 text-sm">{t('loading')}</p>
                                        </div>
                                    ) : (
                                        detailTab === 'guests' ? (
                                            <GuestManager eventId={event.id} eventSlug={event.slug} eventTitle={event.title} />
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {photos.length === 0 && (
                                                    <p className="col-span-4 text-center text-gray-400 text-sm py-4">
                                                        {t('dashboard.photos_empty')}
                                                    </p>
                                                )}
                                                {photos.map(p => (
                                                    <div key={p.id} className="relative group">
                                                        <img src={p.image_url} className="h-24 w-full object-cover rounded-lg shadow-sm"/>
                                                        <button 
                                                            onClick={() => deletePhoto(p.id)} 
                                                            className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded shadow hover:bg-red-700"
                                                        >
                                                            {t('delete')}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    )})
                                                }</>
            )}

            {/* 2. DAVET EDİLDİĞİM ETKİNLİKLER */}
            {activeTab === 'invited' && (
                <>
                    {invitedEvents.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                            <div className="text-6xl mb-4">📬</div>
                            <p className="text-gray-500">{t('no_invited_events')}</p>
                        </div>
                    )}
                    
                    {invitedEvents.map(event => (
                        <div key={event.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition hover:shadow-md flex flex-col md:flex-row gap-6">
                             {event.image_url && (
                                 <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                     <img src={event.image_url} className="w-full h-full object-cover" />
                                 </div>
                             )}

                             <div className="flex-1 flex flex-col justify-center">
                                 <h3 className="font-bold text-xl text-gray-900 mb-1">{event.title}</h3>
                                 <p className="text-gray-500 text-sm mb-2">
                                     {event.location_name || t('dashboard.location_fallback')}
                                 </p>
                                 <p className="text-gray-500 text-sm mb-4">
                                     {event.event_date ? new Date(event.event_date).toLocaleDateString() : t('dashboard.date_fallback')}
                                 </p>
                                 
                                 <a 
                                     href={`/${event.slug}`} 
                                     target="_blank" 
                                     className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition w-fit"
                                 >
                                     {t('go_to_event')}
                                 </a>
                             </div>
                        </div>
                    ))}
                </>
            )}

        </div>
      </div>
      
      {/* FOOTER */}
      <footer className="mt-12 pt-6 border-t border-gray-200 max-w-5xl mx-auto text-center">
        <div className="flex justify-center space-x-6 text-sm text-gray-500">
          <Link href="/legal/terms" className="hover:text-gray-700 transition">{t('footer.link_terms')}</Link>
          <Link href="/legal/privacy" className="hover:text-gray-700 transition">{t('footer.link_privacy')}</Link>
          <button onClick={handleLogout} className="hover:text-gray-700 transition">{t('logout')}</button>
        </div>
        <p className="mt-3 text-xs text-gray-400">{t('footer.copyright_text')}</p>
      </footer>
    </div>
  )
}