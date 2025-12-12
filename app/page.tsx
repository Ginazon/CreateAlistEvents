'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './lib/supabaseClient'
import { useTranslation } from './i18n'
// ... diğer import'lar

export default function Dashboard() {
  const router = useRouter()
  const { t } = useTranslation()
  
  const [session, setSession] = useState<any>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [events, setEvents] = useState<any[]>([])
  // ... diğer state'ler

  useEffect(() => {
    // Session ve kredileri yükle
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/')
        return
      }
      setSession(session)
      fetchCredits(session.user.id)
      fetchEvents(session.user.id)
    })
  }, [router])

  const fetchCredits = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('credits').eq('id', userId).single()
    if (data) setCredits(data.credits)
  }

  const fetchEvents = async (userId: string) => {
    const { data } = await supabase.from('events').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (data) setEvents(data)
  }

  // ✅ YENİ FONKSIYON
  const handleCreateEvent = () => {
    if (credits === null) {
      alert('⏳ Kredi bilgisi yükleniyor, lütfen bekleyin...')
      return
    }
    
    if (credits < 1) {
      alert('❌ Yetersiz kredi!\n\nYeni etkinlik oluşturmak için kredi satın almanız gerekiyor.')
      return
    }
    
    router.push('/create')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t('dashboard_title')}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-yellow-700 bg-yellow-100 px-4 py-2 rounded-full">
              💰 {credits ?? '...'}
            </span>
            
            {/* ✅ GÜNCEL BUTON */}
            <button 
              onClick={handleCreateEvent}
              className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition"
            >
              {t('create_new_event_btn')}
            </button>
          </div>
        </div>

        {/* Event listesi vs. */}
        {/* ... geri kalan kod */}
      </div>
    </div>
  )
}