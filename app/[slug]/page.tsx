'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import RsvpForm from '../components/RsvpForm'
import PhotoGallery from '../components/PhotoGallery'
import Countdown from '../components/Countdown'

export default function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const resolvedParams = await params
      const { data } = await supabase.from('events').select('*').eq('slug', resolvedParams.slug).single()
      if (data) setEvent(data)
      setLoading(false)
    }
    fetchData()
  }, [params])

  if (loading) return <div className="h-screen flex items-center justify-center">Yükleniyor...</div>
  if (!event) return <div className="h-screen flex items-center justify-center">Bulunamadı</div>

  const themeColor = event.design_settings?.theme || '#4F46E5'
  // YENİ: Font verisini al (yoksa varsayılan)
  const fontBody = event.design_settings?.font || "'Inter', sans-serif"
  
  // YENİ: Mesaj verisini al (yoksa varsayılan)
  const eventMessage = event.message || "Sizleri aramızda görmekten mutluluk duyarız."

  const formattedDate = event.event_date 
    ? new Date(event.event_date).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' })
    : 'Tarih Belirlenmedi'

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pb-20 font-sans">
      
      {/* Görsel */}
      {event.image_url ? (
        <div className="w-full max-h-[500px] overflow-hidden bg-gray-100 flex items-center justify-center" style={{ backgroundColor: themeColor + '10' }}>
          <img src={event.image_url} className="object-contain w-full h-full" />
        </div>
      ) : (
        <div className="w-full h-64 flex items-center justify-center text-white" style={{ backgroundColor: themeColor }}>Görsel Yok</div>
      )}

      <div className="max-w-xl w-full px-6 -mt-10 relative z-10">
        <div className="bg-white rounded-xl shadow-xl p-8 border-t-4" style={{ borderColor: themeColor }}>
          
          {/* YENİ: Başlık Fontu Uygulandı */}
          <h1 className="text-3xl font-bold text-center mb-4 leading-tight" 
              style={{ color: themeColor, fontFamily: fontBody }}>
            {event.title}
          </h1>

          {/* YENİ: Mesaj Fontu ve İçeriği Uygulandı */}
          <p className="text-center text-gray-600 mb-8 whitespace-pre-line text-lg"
             style={{ fontFamily: fontBody }}>
             {eventMessage}
          </p>

          {event.event_date && <Countdown targetDate={event.event_date} themeColor={themeColor} />}

          <hr className="my-6 border-gray-100"/>
          
          <div className="grid grid-cols-1 gap-4 text-center">
             <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-bold text-gray-800 text-lg mb-1">📅 Tarih</p>
                <p className="text-gray-600">{formattedDate}</p>
             </div>
             <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-bold text-gray-800 text-lg mb-1">📍 Konum</p>
                <p className="text-gray-600 mb-3">{event.location_name || 'Konum bilgisi girilmedi'}</p>
                {event.location_url && (
                    <a href={event.location_url} target="_blank" className="inline-block px-4 py-2 rounded-full text-sm font-bold text-white transition hover:opacity-90" style={{ backgroundColor: themeColor }}>
                        Yol Tarifi Al 🗺️
                    </a>
                )}
             </div>
          </div>
          
          <RsvpForm eventId={event.id} themeColor={themeColor} onLoginSuccess={setCurrentUserEmail} />
        </div>
      </div>

      <div className="max-w-xl w-full px-6 mt-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: themeColor }}>📸 Fotoğraflar</h2>
        {currentUserEmail ? (
             <PhotoGallery eventId={event.id} currentUserEmail={currentUserEmail} themeColor={themeColor} />
        ) : (
            <div className="bg-gray-100 rounded-xl p-8 text-center border border-dashed border-gray-300">
                <div className="text-4xl mb-2">🔒</div>
                <h3 className="font-bold">Galeri Kilitli</h3>
                <p className="text-sm text-gray-500">Görmek için yukarıdan giriş yapın.</p>
            </div>
        )}
      </div>
    </div>
  )
}