'use client'

import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'

export default function Dashboard() {
  const [session, setSession] = useState<any>(null)
  
  // Form State'leri
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [file, setFile] = useState<File | null>(null) // YENİ: Seçilen dosya
  const [uploading, setUploading] = useState(false) // YENİ: Yükleniyor durumu
  const [message, setMessage] = useState('')

  // Liste State'leri
  const [myEvents, setMyEvents] = useState<any[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [guests, setGuests] = useState<any[]>([])
  const [loadingGuests, setLoadingGuests] = useState(false)

  // 1. Oturum Kontrolü ve Etkinlikleri Getirme
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchMyEvents(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchMyEvents(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 2. Kullanıcının Etkinliklerini Çekme Fonksiyonu
  const fetchMyEvents = async (userId: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (data) setMyEvents(data)
  }

  // 3. Seçilen Etkinliğin Davetlilerini Çekme
  const fetchGuests = async (eventId: string) => {
    setSelectedEventId(eventId)
    setLoadingGuests(true)
    const { data } = await supabase
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
    if (data) setGuests(data)
    setLoadingGuests(false)
  }

  // 4. Test Girişi
  const handleTestLogin = async () => {
    const email = 'test@example.com' 
    const password = 'password123'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) await supabase.auth.signUp({ email, password })
  }

  // 5. Etkinlik ve Görsel Oluşturma (GÜNCELLENDİ)
  // HATA AYIKLAYICI (DEBUG) VERSİYON
  const createEvent = async () => {
    console.log("1. İşlem başladı. Başlık:", title, "Dosya var mı?:", file ? "EVET" : "HAYIR")

    if (!title || !slug) return alert('Başlık ve Slug zorunludur')
    if (!session) return alert('Giriş yapmalısın')

    setUploading(true)
    let uploadedImageUrl = null

    // A) Dosya Yükleme Kısmı
    if (file) {
      console.log("2. Dosya yükleniyor...", file.name)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${session.user.id}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file)

      if (uploadError) {
        console.error("HATA: Dosya yüklenemedi:", uploadError)
        alert('Resim yüklenirken hata: ' + uploadError.message)
        setUploading(false)
        return
      }
      console.log("3. Dosya yüklendi! Path:", filePath)

      // Linki Alma
      const { data } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath)
      
      uploadedImageUrl = data.publicUrl
      console.log("4. Oluşan Link:", uploadedImageUrl)
    } else {
        console.log("UYARI: Dosya seçilmediği için resim yüklenmiyor.")
    }

    // B) Veritabanına Kayıt
    console.log("5. Veritabanına şu veriyle gidiliyor:", { title, slug, image_url: uploadedImageUrl })
    
    const { error } = await supabase
      .from('events')
      .insert([{ 
        title, 
        slug, 
        user_id: session.user.id, 
        image_url: uploadedImageUrl 
      }])

    setUploading(false)

    if (error) {
      console.error("HATA: Veritabanı kaydı başarısız:", error)
      alert('Hata: ' + error.message)
    } else {
      console.log("6. BAŞARILI! Etkinlik oluşturuldu.")
      alert('Etkinlik Oluşturuldu! 🎉')
      setTitle('')
      setSlug('')
      setFile(null)
      fetchMyEvents(session.user.id)
    }
  }

  // --- ARAYÜZ ---
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow-lg text-center">
            <h1 className="text-2xl font-bold mb-4">Cereget Yönetim Paneli</h1>
            <button onClick={handleTestLogin} className="bg-indigo-600 text-white px-6 py-2 rounded">
                Admin Girişi Yap
            </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* SOL KOLON: Yeni Etkinlik Oluştur */}
        <div className="md:col-span-1 bg-white p-6 rounded-xl shadow h-fit">
          <h2 className="text-xl font-bold mb-4 text-indigo-700">Yeni Etkinlik</h2>
          <div className="space-y-4">
            <input
              type="text" placeholder="Etkinlik Adı"
              className="w-full border p-2 rounded"
              value={title} onChange={(e) => setTitle(e.target.value)}
            />
            <div className="flex items-center">
                <span className="text-gray-400 bg-gray-50 p-2 border border-r-0 text-sm">/</span>
                <input
                type="text" placeholder="ozel-link-slug"
                className="w-full border p-2 rounded-r"
                value={slug} onChange={(e) => setSlug(e.target.value)}
                />
            </div>
            
            {/* YENİ: Dosya Yükleme Inputu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Davetiye Görseli (Opsiyonel)</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>

            <button 
              onClick={createEvent} 
              disabled={uploading}
              className="w-full bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700 disabled:opacity-50"
            >
              {uploading ? 'Yükleniyor...' : 'Oluştur'}
            </button>
          </div>
        </div>

        {/* SAĞ KOLON: Etkinlik Listesi (Değişiklik yok) */}
        <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Etkinliklerim</h2>
            <div className="grid gap-4">
                {myEvents.map((event) => (
                    <div key={event.id} className="bg-white p-6 rounded-xl shadow border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-bold">{event.title}</h3>
                                <a href={`/${event.slug}`} target="_blank" className="text-sm text-blue-500 hover:underline">
                                    cereget.com/{event.slug} ↗
                                </a>
                            </div>
                            <button 
                                onClick={() => fetchGuests(event.id)}
                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                            >
                                {selectedEventId === event.id ? 'Yenile' : 'Davetlileri Gör'}
                            </button>
                        </div>
                        {/* Davetli Tablosu (Değişiklik yok) */}
                        {selectedEventId === event.id && (
                            <div className="mt-4 bg-gray-50 rounded-lg p-4 animate-fadeIn">
                                <h4 className="font-bold text-sm text-gray-500 mb-3 uppercase">Gelen Yanıtlar ({guests.length})</h4>
                                {loadingGuests ? <p>Yükleniyor...</p> : guests.length === 0 ? <p className="text-sm text-gray-400">Henüz yanıt yok.</p> : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-gray-500 uppercase bg-gray-100">
                                                <tr><th className="px-2 py-2">İsim</th><th className="px-2 py-2">Durum</th><th className="px-2 py-2">+Kişi</th></tr>
                                            </thead>
                                            <tbody>
                                                {guests.map((g) => (
                                                    <tr key={g.id} className="border-b bg-white">
                                                        <td className="px-2 py-2 font-medium">{g.name}</td>
                                                        <td className="px-2 py-2"><span className={`px-2 py-1 rounded text-xs text-white ${g.status === 'katiliyor' ? 'bg-green-500' : g.status === 'katilmiyor' ? 'bg-red-500' : 'bg-yellow-500'}`}>{g.status}</span></td>
                                                        <td className="px-2 py-2">{g.plus_one}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  )
}