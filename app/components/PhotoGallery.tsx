'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function PhotoGallery({ eventId, currentUserEmail, themeColor }: { eventId: string, currentUserEmail: string, themeColor: string }) {
  const [photos, setPhotos] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  
  // Yorum yazılan fotoğrafın ID'si ve yorum metni
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    fetchPhotos()
  }, [eventId])

  // Fotoğrafları, Beğeni Sayılarını ve Yorumları Çekme (JOIN İşlemi)
  // FOTOĞRAFLARI, BEĞENİ VE YORUMLARI ÇEKME (Filtre Kaldırıldı)
  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from('photos')
      .select(`
        *,
        photo_likes (count),
        photo_comments (
          id, guest_email, message, created_at, status
        )
      `)
      .eq('event_id', eventId)
      // Fotoğrafları yayınla (bu kural kalsın)
      .eq('status', 'approved')
      // !!! BURADAN status filtrelemesini kaldırdık. Artık tüm yorumlar görünür.
      .order('created_at', { ascending: false })
    
    if (data) {
       // Yorumları tarihe göre sıralayalım
       const sortedData = data.map((photo: any) => ({
         ...photo,
         photo_comments: photo.photo_comments.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
       }))
       setPhotos(sortedData)
    }
  }

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `${eventId}/${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage.from('guest-uploads').upload(fileName, file)

    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('guest-uploads').getPublicUrl(fileName)
      await supabase.from('photos').insert([{
        event_id: eventId,
        guest_email: currentUserEmail,
        image_url: urlData.publicUrl
      }])
      fetchPhotos()
    }
    setUploading(false)
  }

  // ❤️ BEĞENİ İŞLEMİ
  const handleLike = async (photoId: string) => {
    // Önce beğeni var mı kontrol et (Optimistik güncelleme yerine basit istek yapıyoruz)
    const { error } = await supabase
      .from('photo_likes')
      .insert([{ photo_id: photoId, guest_email: currentUserEmail }])

    if (error) {
      // Hata verdiyse muhtemelen zaten beğenmiştir, o zaman beğeniyi geri al (Toggle)
      await supabase
        .from('photo_likes')
        .delete()
        .eq('photo_id', photoId)
        .eq('guest_email', currentUserEmail)
    }
    
    // Listeyi yenile ki sayı güncellensin
    fetchPhotos()
  }

  // 💬 YORUM İŞLEMİ
  const handleCommentSubmit = async (photoId: string) => {
    if (!newComment.trim()) return

    const { error } = await supabase
      .from('photo_comments')
      .insert([{ 
        photo_id: photoId, 
        guest_email: currentUserEmail,
        message: newComment
      }])

    if (!error) {
      setNewComment('')
      fetchPhotos() // Yorumları yenile
    }
  }

  return (
    <div className="mt-6 animate-fadeIn">
      {/* YÜKLEME ALANI */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center mb-8">
        <h3 className="font-bold text-gray-800 mb-2">Anılarını Paylaş 📸</h3>
        <p className="text-sm text-gray-500 mb-4">Bu etkinlikten kareleri herkesle paylaş.</p>
        <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold transition transform hover:scale-105 active:scale-95 shadow-md" style={{ backgroundColor: themeColor }}>
          {uploading ? <span>Yükleniyor... ⏳</span> : <span>+ Fotoğraf Yükle</span>}
          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading}/>
        </label>
      </div>

      {/* FOTOĞRAF AKIŞI (INSTAGRAM TARZI) */}
      <div className="space-y-8">
        {photos.length === 0 ? (
          <div className="text-center text-gray-400 py-10 italic">Henüz fotoğraf yok. İlk sen ol!</div>
        ) : (
          photos.map((photo) => (
            <div key={photo.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              
              {/* Üst Bilgi */}
              <div className="p-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                    {photo.guest_email.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm font-bold text-gray-700">{photo.guest_email.split('@')[0]}</div>
              </div>

              {/* Görsel */}
              <div className="aspect-square bg-gray-100">
                <img src={photo.image_url} alt="Guest upload" className="w-full h-full object-cover" />
              </div>

              {/* Alt Aksiyonlar */}
              <div className="p-4">
                <div className="flex items-center gap-4 mb-3">
                    {/* Beğeni Butonu */}
                    <button 
                        onClick={() => handleLike(photo.id)}
                        className="flex items-center gap-1 group"
                    >
                        <span className="text-2xl transition transform group-active:scale-125">❤️</span>
                        <span className="font-bold text-gray-700">{photo.photo_likes[0]?.count || 0}</span>
                    </button>

                    {/* Yorum Butonu */}
                    <button 
                        onClick={() => setActiveCommentId(activeCommentId === photo.id ? null : photo.id)}
                        className="flex items-center gap-1"
                    >
                        <span className="text-2xl">💬</span>
                        <span className="font-bold text-gray-700">{photo.photo_comments.length}</span>
                    </button>
                </div>

                {/* Yorum Listesi (Varsa) */}
                {photo.photo_comments.length > 0 && (
                    <div className="mb-3 space-y-1">
                        {photo.photo_comments.slice(0, 3).map((c: any) => (
                            <div key={c.id} className="text-sm">
                                <span className="font-bold mr-2">{c.guest_email.split('@')[0]}:</span>
                                <span className="text-gray-700">{c.message}</span>
                            </div>
                        ))}
                        {photo.photo_comments.length > 3 && <p className="text-xs text-gray-400">Tüm yorumları gör...</p>}
                    </div>
                )}

                {/* Yorum Yapma Alanı (Açılır Kutu) */}
                {activeCommentId === photo.id && (
                    <div className="flex gap-2 mt-2 animate-fadeIn">
                        <input 
                            type="text" 
                            placeholder="Yorum yaz..." 
                            className="flex-1 border bg-gray-50 rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(photo.id)}
                        />
                        <button 
                            onClick={() => handleCommentSubmit(photo.id)}
                            className="text-white px-4 rounded-full text-sm font-bold"
                            style={{ backgroundColor: themeColor }}
                        >
                            Gönder
                        </button>
                    </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}