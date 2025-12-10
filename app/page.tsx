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
  
  // Veriler
  const [credits, setCredits] = useState<number | null>(null)
  const [myEvents, setMyEvents] = useState<any[]>([])
  const [invitedEvents, setInvitedEvents] = useState<any[]>([])
  const [packages, setPackages] = useState<any[]>([]) // YENİ: Paketler
  
  // UI State
  const [activeTab, setActiveTab] = useState<'created' | 'invited'>('created')
  const [loading, setLoading] = useState(true)
  const [origin, setOrigin] = useState('')

  // Detay Yönetimi
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [showQrId, setShowQrId] = useState<string | null>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [detailTab, setDetailTab] = useState<'guests' | 'photos'>('guests')
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin)

    const checkUser = async () => {
        // 1. Supabase Oturumu Var mı?
        const { data } = await supabase.auth.getSession()
        
        if (data.session) {
            // A. ÜYE VARSA
            setSession(data.session)
            fetchCredits(data.session.user.id)
            fetchMyEvents(data.session.user.id)
            
            // HATA ÇÖZÜMÜ: Email varsa fonksiyonu çağır (Undefined hatasını engeller)
            if (data.session.user.email) {
                fetchInvitedEvents(data.session.user.email)
            }
            
            fetchPackages()
        } else {
            // B. ÜYE YOKSA -> Pasaport (Local Storage) Var mı?
            // EventView'dan gönderdiğimiz 'cereget_guest_email' anahtarına bakıyoruz
            const guestEmail = localStorage.getItem('cereget_guest_email')
            
            if (guestEmail) {
                // MİSAFİR KABUL EDİLDİ ✅
                console.log("Misafir girişi onaylandı:", guestEmail)
                
                // Sahte bir oturum objesi oluşturup ekranı açıyoruz
                // @ts-ignore
                setSession({ user: { email: guestEmail, isGuest: true } }) 
                
                setActiveTab('invited') // Direkt davetiye sekmesini aç
                fetchInvitedEvents(guestEmail)
                fetchPackages() 
            } else {
                // C. KİMLİK YOKSA -> Landing Page'e Yolla ❌
                console.warn("Kimlik bulunamadı, Landing'e yönlendiriliyor...")
                router.push('/landing')
            }
        }
    }

    checkUser()
  }, [router])

    
  const handleLogout = async () => {
      await supabase.auth.signOut()
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

    // GÜNCELLEME: .eq yerine .ilike kullanıyoruz (Büyük/küçük harf farketmez)
    const { data: guestEntries, error } = await supabase
      .from('guests')
      .select(`
          event_id,
          events!inner (  
              id, title, slug, event_date, image_url, location_name, design_settings
          )
      `)
      // !inner kullanımı: Sadece "gerçekten bir etkinliği olan" kayıtları getirir (Silinmişleri eler)
      .ilike('email', email) 
      
    if (error) {
        console.error("Davetleri çekerken hata:", error.message)
        return
    }

    if (guestEntries) {
        // Gelen veri yapısını düzelt
        // @ts-ignore
        const formattedEvents = guestEntries.map(g => g.events)
        setInvitedEvents(formattedEvents)
    }
}

  // YENİ: Paketleri Çekme Fonksiyonu
  const fetchPackages = async () => {
      const { data } = await supabase
        .from('credit_packages')
        .select('*')
        .order('credits_amount', { ascending: true }) // Küçük paketten büyüğe
      
      if (data) setPackages(data)
  }

  const fetchEventDetails = async (eventId: string) => {
    setSelectedEventId(eventId)
    setLoadingDetails(true)
    const { data: p } = await supabase.from('photos').select('*').eq('event_id', eventId).order('created_at', { ascending: false })
    if (p) setPhotos(p)
    setLoadingDetails(false)
  }

  const deletePhoto = async (id: string) => {
    if (!confirm(t('confirm_delete'))) return
    await supabase.from('photos').delete().eq('id', id)
    setPhotos(photos.filter(p => p.id !== id))
  }

  const downloadQRCode = (slug: string) => {
    const canvas = document.getElementById(`qr-${slug}`) as HTMLCanvasElement
    if (canvas) {
        const link = document.createElement("a"); link.href = canvas.toDataURL("image/png"); link.download = `${slug}-qr.png`; link.click();
    }
  }

  if (!session) return <div className="h-screen flex items-center justify-center text-xl text-gray-500">{t('loading')}</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center bg-white p-6 rounded-t-xl shadow-sm border border-b-0">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">{t('dashboard_title')}</h1>
                <p className="text-gray-500 text-sm">{t('dashboard_subtitle')}</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative group">
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-lg z-10 pointer-events-none">🌍</div>
                    <select 
                        value={language} 
                        onChange={(e) => setLanguage(e.target.value as LangType)}
                        className="bg-gray-100 border border-transparent text-gray-700 text-xs rounded-full focus:ring-2 focus:ring-indigo-500 focus:bg-white block pl-9 pr-2 py-2 appearance-none cursor-pointer font-bold hover:bg-gray-200 transition outline-none uppercase"
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
                <button onClick={handleLogout} className="text-gray-400 hover:text-black text-sm underline shrink-0 ml-2">
                    {t('logout')}
                </button>
            </div>
        </div>
        
        {/* KREDİ & AKSİYON ALANI */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-b-xl shadow-lg border-b border-x mb-8 space-y-3 md:space-y-0">
            <div className="order-2 md:order-1 bg-yellow-50 text-yellow-700 px-6 py-3 rounded-xl font-bold border border-yellow-200 flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
                <div className="bg-yellow-200 text-yellow-800 p-1 rounded-full">💰</div>
                <div><p className="text-xs uppercase font-bold">{t('my_credits')}</p><p className="text-xl font-bold text-gray-800">{credits !== null ? credits : '...'}</p></div>
            </div>
            
            {/* Eğer kredi 0 ise Create butonu yerine Satın Al mesajı verilebilir veya buton bırakılabilir, tıklayınca uyarı verir */}
            <div className="order-1 md:order-2 w-full md:w-auto">
                <Link href="/create" className="w-full">
                    <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 hover:scale-[1.01] transition w-full flex items-center justify-center gap-2">
                        ✨ {t('create_new_event')}
                    </button>
                </Link>
            </div>
        </div>

        {/* SEKME BAŞLIKLARI */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
            <button 
                onClick={() => setActiveTab('created')}
                className={`px-6 py-3 font-bold text-sm rounded-t-lg transition ${activeTab === 'created' ? 'bg-white text-indigo-600 border-x border-t border-gray-200 shadow-sm relative top-[1px]' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                👑 {t('tab_created')}
            </button>
            <button 
                onClick={() => setActiveTab('invited')}
                className={`px-6 py-3 font-bold text-sm rounded-t-lg transition ${activeTab === 'invited' ? 'bg-white text-indigo-600 border-x border-t border-gray-200 shadow-sm relative top-[1px]' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                💌 {t('tab_invited')} ({invitedEvents.length})
            </button>
        </div>

        {/* LİSTE İÇERİĞİ */}
        <div className="space-y-4">
            
            {/* 1. KENDİ ETKİNLİKLERİM (VEYA PAKET SATIŞ EKRANI) */}
            {activeTab === 'created' && (
                <>
                    {/* ETKİNLİK YOKSA -> PAKETLERİ GÖSTER */}
                    {myEvents.length === 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center animate-fadeIn">
                            <div className="max-w-3xl mx-auto">
                                <div className="text-6xl mb-4">🚀</div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('dashboard.empty_state_title')}</h2>
                                <p className="text-gray-500 mb-8">{t('dashboard.empty_state_desc')}</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {packages.map((pkg) => (
                                        <div key={pkg.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-indigo-300 transition flex flex-col items-center bg-gray-50 hover:bg-white relative overflow-hidden group">
                                            {/* Süsleme */}
                                            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

                                            <h3 className="font-bold text-lg text-gray-800 mb-2">{pkg.package_name || t('dashboard.package_default_name')}</h3>
                                            <div className="text-4xl font-extrabold text-indigo-600 mb-2">{pkg.credits_amount} <span className="text-sm text-gray-400 font-normal">{t('dashboard.credit_label')}</span></div>
                                            
                                            <p className="text-xs text-gray-400 mb-6 text-center">{t('dashboard.package_lifetime_note')}</p>
                                            
                                            {/* Etsy Linki */}
                                            <a 
                                                // Öncelik etsy_link sütununda, eğer boşsa eski usul ID ile oluştur (Geriye uyumluluk)
                                                href={pkg.etsy_link || `https://www.etsy.com/listing/${pkg.etsy_listing_id}`} 
                                                target="_blank" 
                                                className="w-full bg-black text-white py-3 rounded-lg font-bold text-sm hover:bg-gray-800 transition shadow-md flex items-center justify-center gap-2"
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
                    
                    {/* ETKİNLİK VARSA -> LİSTEYİ GÖSTER */}
                    {myEvents.map(event => (
                        <div key={event.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition hover:shadow-md">
                            <div className="flex justify-between items-center flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-12 rounded-full" style={{ backgroundColor: event.design_settings?.theme }}></div>
                                    <div>
                                        <h3 className="font-bold text-lg">{event.title}</h3>
                                        <a href={`/${event.slug}`} target="_blank" className="text-indigo-500 text-xs font-medium bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100">{origin}/{event.slug} ↗</a>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <button onClick={() => setShowQrId(showQrId === event.id ? null : event.id)} className="bg-gray-800 text-white px-3 py-2 rounded text-sm font-medium hover:bg-black transition">📱 {t('dashboard.btn_qr_short')}</button>
                                    <Link href={`/create?edit=${event.id}`}>
                                        <button className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition">✏️ {t('edit')}</button>
                                    </Link>
                                    <button onClick={() => selectedEventId === event.id ? setSelectedEventId(null) : fetchEventDetails(event.id)} className="bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm font-medium hover:bg-gray-200 transition">⚙️ {t('manage')}</button>
                                </div>
                            </div>

                            {/* QR ve DETAY ALANLARI (Aynı kaldı) */}
                            {showQrId === event.id && (
                                <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200 flex flex-col items-center animate-fadeIn">
                                    <div className="p-3 bg-white rounded shadow-sm mb-4"><QRCodeCanvas id={`qr-${event.slug}`} value={`${origin}/${event.slug}`} size={160} level={"H"}/></div>
                                    <button onClick={() => downloadQRCode(event.slug)} className="mt-2 text-sm text-indigo-600 font-bold hover:underline">📥 {t('download')}</button>
                                </div>
                            )}

                            {selectedEventId === event.id && (
                                <div className="mt-6 border-t pt-6">
                                    <div className="flex gap-6 border-b border-gray-100 mb-6 pb-1">
                                        <button onClick={() => setDetailTab('guests')} className={`pb-2 px-3 text-sm font-bold transition ${detailTab==='guests' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
                                            {t('guests_tab')}
                                        </button>
                                        <button onClick={() => setDetailTab('photos')} className={`pb-2 px-3 text-sm font-bold transition ${detailTab==='photos' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
                                            {t('photos_tab')} ({photos.length})
                                        </button>
                                    </div>

                                    {loadingDetails ? <p className="text-gray-400 text-sm">{t('loading')}</p> : (
                                        detailTab === 'guests' ? (
                                            <GuestManager eventId={event.id} eventSlug={event.slug} eventTitle={event.title} />
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {photos.length === 0 && <p className="col-span-4 text-center text-gray-400 text-sm py-4">{t('dashboard.photos_empty')}</p>}
                                                {photos.map(p => (
                                                    <div key={p.id} className="relative group">
                                                        <img src={p.image_url} className="h-24 w-full object-cover rounded shadow-sm"/>
                                                        <button onClick={() => deletePhoto(p.id)} className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded shadow hover:bg-red-700">{t('delete')}</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </>
            )}

            {/* 2. DAVET EDİLDİĞİM ETKİNLİKLER (Aynı kaldı) */}
            {activeTab === 'invited' && (
                <>
                    {invitedEvents.length === 0 && <div className="text-center py-10 text-gray-400 bg-white rounded-xl border">{t('no_invited_events')}</div>}
                    
                    {invitedEvents.map(event => (
                        <div key={event.id} className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500 transition hover:shadow-xl flex flex-col md:flex-row gap-6">
                             {event.image_url && (
                                 <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                     <img src={event.image_url} className="w-full h-full object-cover" />
                                 </div>
                             )}

                             <div className="flex-1 flex flex-col justify-center">
                                 <h3 className="font-bold text-xl text-gray-800 mb-1">{event.title}</h3>
                                 <p className="text-gray-500 text-sm mb-2">📍 {event.location_name || t('dashboard.location_fallback')}</p>
                                 <p className="text-gray-500 text-sm mb-4">📅 {event.event_date ? new Date(event.event_date).toLocaleDateString() : t('dashboard.date_fallback')}</p>
                                 
                                 <a href={`/${event.slug}`} target="_blank" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 hover:scale-105 transition w-fit shadow-md">
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
          <Link href="/legal/terms" className="hover:text-black">{t('footer.link_terms')}</Link>
          <Link href="/legal/privacy" className="hover:text-black">{t('footer.link_privacy')}</Link>
          <button onClick={handleLogout} className="hover:text-black">{t('logout')}</button>
        </div>
        <p className="mt-3 text-xs text-gray-400">{t('footer.copyright_text')}</p>
      </footer>
    </div>
  )
}