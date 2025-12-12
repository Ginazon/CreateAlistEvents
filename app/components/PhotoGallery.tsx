'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useTranslation } from '../i18n'
import type { Photo } from '../types'

interface PhotoGalleryProps {
  eventId: string
  currentUserEmail: string | null
  themeColor: string
}

export default function PhotoGallery({ eventId, currentUserEmail, themeColor }: PhotoGalleryProps) {
  const { t } = useTranslation()

  const [photos, setPhotos] = useState<Photo[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})

  // ✅ DÜZELTİLDİ: useCallback ile memory leak önlendi
  const fetchPhotos = useCallback(async () => {
    if (!eventId) return

    try {
      console.log('Fotoğraflar çekiliyor... Event ID:', eventId)

      const { data, error: fetchError } = await supabase
        .from('photos')
        .select(
          `
          *,
          photo_comments(id, user_email, content, created_at),
          photo_likes(id, user_email)
      `
        )
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Çekme Hatası:', fetchError.message)
        setError(t('gallery.alert_db_error') + fetchError.message)
      } else {
        console.log('Gelen Veri:', data)
        setPhotos(data || [])
        setError(null)
      }
    } catch (err) {
      console.error('Gallery fetch error:', err)
      setError(t('error.something_went_wrong') || 'Bir hata oluştu')
    }
  }, [eventId, t])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ✅ DÜZELTİLDİ: Better validation
    if (!currentUserEmail) {
      setError(t('gallery.alert_session_error'))
      return
    }

    // File size validation (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(t('gallery.alert_file_too_large') || 'Dosya boyutu 10MB\'dan küçük olmalıdır')
      return
    }

    // File type validation
    if (!file.type.startsWith('image/')) {
      setError(t('gallery.alert_invalid_file_type') || 'Sadece resim dosyaları yüklenebilir')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // ✅ DÜZELTİLDİ: Daha güvenli dosya adı
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${eventId}/${Date.now()}-${crypto.randomUUID()}.${fileExt}`

      let finalName = currentUserEmail.split('@')[0]

      if (currentUserEmail === 'owner') {
        finalName = t('gallery.owner_name')
      } else {
        const { data: guestData } = await supabase
          .from('guests')
          .select('name')
          .eq('event_id', eventId)
          .eq('email', currentUserEmail)
          .single()

        if (guestData && guestData.name) {
          finalName = guestData.name
        }
      }

      const { error: uploadError } = await supabase.storage.from('guest-uploads').upload(fileName, file)

      if (uploadError) {
        setError(t('gallery.alert_upload_error') + uploadError.message)
        setUploading(false)
        return
      }

      const publicUrl = supabase.storage.from('guest-uploads').getPublicUrl(fileName).data.publicUrl

      const { error: dbError } = await supabase.from('photos').insert([
        {
          event_id: eventId,
          user_email: currentUserEmail,
          uploader_name: finalName,
          image_url: publicUrl,
        },
      ])

      if (dbError) {
        console.error('DB Hatası:', dbError)
        setError(t('gallery.alert_db_error') + dbError.message)
      } else {
        await fetchPhotos()
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(t('error.something_went_wrong') || 'Yükleme başarısız oldu')
    } finally {
      setUploading(false)
    }
  }

  const handleLike = async (photoId: string) => {
    if (!currentUserEmail) return

    try {
      const photo = photos.find((p) => p.id === photoId)
      if (!photo) return

      const hasLiked = photo.photo_likes.some((l) => l.user_email === currentUserEmail)

      if (hasLiked) {
        await supabase.from('photo_likes').delete().eq('photo_id', photoId).eq('user_email', currentUserEmail)
      } else {
        await supabase.from('photo_likes').insert([{ photo_id: photoId, user_email: currentUserEmail }])
      }
      await fetchPhotos()
    } catch (err) {
      console.error('Like error:', err)
    }
  }

  const handleComment = async (photoId: string) => {
    const text = commentText[photoId]?.trim()
    if (!text || !currentUserEmail) return

    try {
      await supabase.from('photo_comments').insert([
        {
          photo_id: photoId,
          user_email: currentUserEmail,
          content: text,
        },
      ])
      setCommentText({ ...commentText, [photoId]: '' })
      await fetchPhotos()
    } catch (err) {
      console.error('Comment error:', err)
      setError(t('error.something_went_wrong') || 'Yorum eklenemedi')
    }
  }

  const toggleComments = (photoId: string) => {
    setExpandedComments((prev) => ({ ...prev, [photoId]: !prev[photoId] }))
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ERROR DISPLAY */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          <p className="font-bold mb-1">⚠️ {t('error.title') || 'Hata'}</p>
          <p>{error}</p>
        </div>
      )}

      {/* YÜKLEME ALANI */}
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition group cursor-pointer relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="text-4xl mb-2 group-hover:scale-110 transition">{uploading ? '⏳' : '📸'}</div>
        <p className="text-gray-500 font-bold text-sm">
          {uploading ? t('loading') : t('image_upload_btn')}
        </p>
        <p className="text-xs text-gray-400 mt-1">Max 10MB</p>
      </div>

      {/* FOTOĞRAF LİSTESİ */}
      {photos.length === 0 && <p className="text-center text-gray-400 italic py-10">{t('no_photos')}</p>}

      {photos.map((photo) => {
        const isLiked = photo.photo_likes.some((l) => l.user_email === currentUserEmail)
        const comments = photo.photo_comments || []
        const isExpanded = expandedComments[photo.id] || false
        const visibleComments = isExpanded ? comments : comments.slice(0, 2)

        return (
          <div key={photo.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* GÖRSEL */}
            <div className="relative">
              <img
                src={photo.image_url}
                className="w-full h-auto object-cover max-h-[500px]"
                loading="lazy"
                alt={`Photo by ${photo.uploader_name}`}
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex justify-between items-end">
                <span className="text-white text-xs font-bold opacity-90 drop-shadow-md bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
                  {photo.uploader_name || photo.user_email.split('@')[0]}
                </span>

                <button
                  onClick={() => handleLike(photo.id)}
                  className="text-white flex items-center gap-1 hover:scale-110 transition drop-shadow-md"
                  aria-label={isLiked ? 'Unlike photo' : 'Like photo'}
                >
                  <span className="text-2xl">{isLiked ? '❤️' : '🤍'}</span>
                  <span className="font-bold">{photo.photo_likes.length > 0 && photo.photo_likes.length}</span>
                </button>
              </div>
            </div>

            {/* YORUMLAR */}
            <div className="p-4 bg-gray-50">
              <div className="space-y-3 mb-4">
                {visibleComments.map((c) => (
                  <div key={c.id} className="text-sm">
                    <span className="font-bold text-gray-800 mr-2">{c.user_email.split('@')[0]}:</span>
                    <span className="text-gray-600">{c.content}</span>
                  </div>
                ))}
              </div>

              {comments.length > 2 && (
                <button
                  onClick={() => toggleComments(photo.id)}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600 mb-4 block"
                >
                  {isExpanded ? t('hide_comments') : `${t('show_all_comments')} (${comments.length})`}
                </button>
              )}

              <div className="flex gap-2 relative">
                <input
                  type="text"
                  value={commentText[photo.id] || ''}
                  onChange={(e) => setCommentText({ ...commentText, [photo.id]: e.target.value })}
                  placeholder={t('comment_placeholder')}
                  className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleComment(photo.id)}
                  maxLength={500}
                />
                <button
                  onClick={() => handleComment(photo.id)}
                  disabled={!commentText[photo.id]?.trim()}
                  className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 transition shadow-md absolute right-1 top-0 bottom-0 my-auto"
                  style={{ backgroundColor: themeColor }}
                  aria-label="Post comment"
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
