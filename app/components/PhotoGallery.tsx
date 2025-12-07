'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function PhotoGallery({ eventId, currentUserEmail, themeColor }: { eventId: string, currentUserEmail: string, themeColor: string }) {
  const [photos, setPhotos] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  // Sayfa açılınca fotoğrafları çek
  useEffect(() => {
    fetchPhotos()
    
    // (İleri Seviye): Buraya Realtime abonelik eklenirse biri yüklediğinde anında düşer.
    // Şimdilik manuel çekiyoruz.
  }, [eventId])

  const fetchPhotos = async () => {
    const { data } = await supabase
      .from('photos')
      .select('*')
      .eq('event_id', eventId)
      .eq('status', 'approved') // Sadece onaylıları getir
      .order('created_at', { ascending: false })
    
    if (data) setPhotos(data)
  }

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)

    // 1. Dosyayı Storage'a Yükle
    const fileExt = file.name.split('.').pop()
    const fileName = `${eventId}/${Date.now()}.${fileExt}` // Klasörleme: eventId/zaman.jpg
    
    const { error: uploadError } = await supabase.storage
      .from('guest-uploads')
      .upload(fileName, file)

    if (uploadError) {
      alert('Yükleme hatası: ' + uploadError.message)
      setUploading(false)
      return
    }

    // 2. Public Linki Al
    const { data: urlData } = supabase.storage
      .from('guest-uploads')
      .getPublicUrl(fileName)

    // 3. Veritabanına Kaydet
    const { error: dbError } = await supabase
      .from('photos')
      .insert([{
        event_id: eventId,
        guest_email: currentUserEmail,
        image_url: urlData.publicUrl
      }])

    if (dbError) {
      alert('Veritabanı hatası: ' + dbError.message)
    } else {
      // Listeyi yenile
      fetchPhotos()
    }
    
    setUploading(false)
  }

  return (
    <div className="mt-6 animate-fadeIn">
      {/* ÜST KISIM: YÜKLEME BUTONU */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center mb-6">
        <h3 className="font-bold text-gray-800 mb-2">Anılarını Paylaş 📸</h3>
        <p className="text-sm text-gray-500 mb-4">Bu etkinlikten kareleri herkesle paylaş.</p>
        
        <label 
          className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold transition transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: themeColor }}
        >
          {uploading ? (
            <span>Yükleniyor... ⏳</span>
          ) : (
            <>
              <span>+ Fotoğraf Yükle</span>
            </>
          )}
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileUpload} 
            disabled={uploading}
          />
        </label>
      </div>

      {/* ALT KISIM: FOTOĞRAF IZGARASI (GRID) */}
      {photos.length === 0 ? (
        <div className="text-center text-gray-400 py-10 italic">
          Henüz fotoğraf yüklenmemiş. İlk sen ol!
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
              <img 
                src={photo.image_url} 
                alt="Guest upload" 
                className="w-full h-full object-cover transition duration-500 group-hover:scale-110" 
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-[10px] p-1 truncate opacity-0 group-hover:opacity-100 transition">
                {photo.guest_email.split('@')[0]} paylaştı
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}