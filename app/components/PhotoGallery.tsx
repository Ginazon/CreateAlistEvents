'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useTranslation } from '../i18n'

interface PhotoGalleryProps {
    eventId: string;
    currentUserEmail: string | null;
    themeColor: string;
}

export default function PhotoGallery({ eventId, currentUserEmail, themeColor }: PhotoGalleryProps) {
  const { t } = useTranslation()
  
  const [photos, setPhotos] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  
  // Hangi fotoğrafların yorumları açık? (ID -> true/false)
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (eventId) fetchPhotos()
  }, [eventId])

  const fetchPhotos = async () => {
      // Fotoğrafları, Yorumları ve Beğenileri çek
      const { data, error } = await supabase
        .from('photos')
        .select(`
            *,
            photo_comments(id, user_email, content, created_at),
            photo_likes(id, user_email)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (data) setPhotos(data)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !currentUserEmail) return

      setUploading(true)
      const fileName = `${eventId}/${Date.now()}-${Math.floor(Math.random()*1000)}`
      
      // 1. Storage'a Yükle
      const { error: uploadError } = await supabase.storage.from('event-photos').upload(fileName, file)
      
      if (!uploadError) {
          const publicUrl = supabase.storage.from('event-photos').getPublicUrl(fileName).data.publicUrl
          
          // 2. Veritabanına Yaz
          await supabase.from('photos').insert([{
              event_id: eventId,
              user_email: currentUserEmail,
              image_url: publicUrl
          }])
          fetchPhotos()
      } else {
          alert('Yükleme hatası: ' + uploadError.message)
      }
      setUploading(false)
  }

  const handleLike = async (photoId: string) => {
      if (!currentUserEmail) return
      
      const photo = photos.find(p => p.id === photoId)
      const hasLiked = photo.photo_likes.some((l: any) => l.user_email === currentUserEmail)

      if (hasLiked) {
          // Beğeniyi Kaldır
          await supabase.from('photo_likes').delete().eq('photo_id', photoId).eq('user_email', currentUserEmail)
      } else {
          // Beğeni Ekle
          await supabase.from('photo_likes').insert([{ photo_id: photoId, user_email: currentUserEmail }])
      }
      fetchPhotos()
  }

  const handleComment = async (photoId: string) => {
      const text = commentText[photoId]
      if (!text || !currentUserEmail) return

      await supabase.from('photo_comments').insert([{
          photo_id: photoId,
          user_email: currentUserEmail,
          content: text
      }])
      
      setCommentText({ ...commentText, [photoId]: '' }) // Inputu temizle
      fetchPhotos()
  }

  // Yorumları Göster/Gizle Fonksiyonu
  const toggleComments = (photoId: string) => {
      setExpandedComments(prev => ({
          ...prev,
          [photoId]: !prev[photoId]
      }))
  }

  return (
    <div className="space-y-8 animate-fadeIn">
        
        {/* YÜKLEME ALANI */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition group cursor-pointer relative">
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/>
            <div className="text-4xl mb-2 group-hover:scale-110 transition">📸</div>
            <p className="text-gray-500 font-bold text-sm">
                {uploading ? t('loading') : t('image_upload_btn')}
            </p>
        </div>

        {/* FOTOĞRAF LİSTESİ */}
        {photos.length === 0 && (
            <p className="text-center text-gray-400 italic py-10">{t('no_photos')}</p>
        )}

        {photos.map((photo) => {
            const isLiked = photo.photo_likes.some((l: any) => l.user_email === currentUserEmail)
            const comments = photo.photo_comments || []
            const isExpanded = expandedComments[photo.id] || false
            
            // Gösterilecek yorumlar: Genişletilmişse hepsi, değilse son 2 tanesi
            const visibleComments = isExpanded ? comments : comments.slice(0, 2)

            return (
                <div key={photo.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    
                    {/* GÖRSEL */}
                    <div className="relative">
                        <img src={photo.image_url} className="w-full h-auto object-cover max-h-[500px]" loading="lazy"/>
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex justify-between items-end">
                            <span className="text-white text-xs font-bold opacity-80">{photo.user_email.split('@')[0]}</span>
                            <button onClick={() => handleLike(photo.id)} className="text-white flex items-center gap-1 hover:scale-110 transition">
                                <span className="text-2xl">{isLiked ? '❤️' : '🤍'}</span>
                                <span className="font-bold">{photo.photo_likes.length > 0 && photo.photo_likes.length}</span>
                            </button>
                        </div>
                    </div>

                    {/* YORUMLAR */}
                    <div className="p-4 bg-gray-50">
                        {/* Yorum Listesi */}
                        <div className="space-y-3 mb-4">
                            {visibleComments.map((c: any) => (
                                <div key={c.id} className="text-sm">
                                    <span className="font-bold text-gray-800 mr-2">{c.user_email.split('@')[0]}:</span>
                                    <span className="text-gray-600">{c.content}</span>
                                </div>
                            ))}
                        </div>

                        {/* "Tümünü Gör" Butonu */}
                        {comments.length > 2 && (
                            <button 
                                onClick={() => toggleComments(photo.id)}
                                className="text-xs font-bold text-gray-400 hover:text-gray-600 mb-4 block"
                            >
                                {isExpanded 
                                    ? t('hide_comments') 
                                    : `${t('show_all_comments')} (${comments.length})`
                                }
                            </button>
                        )}

                        {/* Yorum Ekleme */}
                        <div className="flex gap-2 relative">
                            <input 
                                type="text" 
                                value={commentText[photo.id] || ''}
                                onChange={e => setCommentText({...commentText, [photo.id]: e.target.value})}
                                placeholder={t('comment_placeholder')}
                                className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                onKeyDown={(e) => e.key === 'Enter' && handleComment(photo.id)}
                            />
                            <button 
                                onClick={() => handleComment(photo.id)}
                                disabled={!commentText[photo.id]}
                                className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 transition shadow-md absolute right-1 top-0 bottom-0 my-auto"
                                style={{ backgroundColor: themeColor }}
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                </div>
            )
        })}
    </div>
  )
}