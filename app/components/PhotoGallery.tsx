'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useTranslation } from '../i18n'

export default function PhotoGallery({ eventId, currentUserEmail, themeColor }: { eventId: string, currentUserEmail: string, themeColor: string }) {
  const { t } = useTranslation()
  const [photos, setPhotos] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null)
  const [commentText, setCommentText] = useState('')
  const [showUploadOptions, setShowUploadOptions] = useState(false)

  useEffect(() => {
    fetchPhotos()
  }, [eventId])

  const fetchPhotos = async () => {
    const { data } = await supabase
      .from('photos')
      .select(`
        *,
        photo_comments(*, created_at),
        photo_likes(*)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (data) setPhotos(data)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, source: 'camera' | 'gallery') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert(t('error.file_too_large') || 'Dosya çok büyük (Max 10MB)')
      return
    }

    setUploading(true)
    setError(null)
    setShowUploadOptions(false)

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(`gallery/${eventId}/${fileName}`, file)

      if (uploadError) throw uploadError

      const publicUrl = supabase.storage
        .from('event-images')
        .getPublicUrl(`gallery/${eventId}/${fileName}`).data.publicUrl

      const { error: insertError } = await supabase.from('photos').insert([
        {
          event_id: eventId,
          user_email: currentUserEmail,
          uploader_name: currentUserEmail.split('@')[0],
          image_url: publicUrl,
        },
      ])

      if (insertError) throw insertError

      await fetchPhotos()
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || t('error.something_went_wrong'))
    } finally {
      setUploading(false)
    }
  }

  const handleLike = async (photoId: string) => {
    const hasLiked = photos
      .find((p) => p.id === photoId)
      ?.photo_likes.some((l: any) => l.user_email === currentUserEmail)

    if (hasLiked) {
      await supabase.from('photo_likes').delete().eq('photo_id', photoId).eq('user_email', currentUserEmail)
    } else {
      await supabase.from('photo_likes').insert([{ photo_id: photoId, user_email: currentUserEmail }])
    }

    fetchPhotos()
  }

  const handleComment = async (photoId: string) => {
    if (!commentText.trim()) return

    await supabase.from('photo_comments').insert([
      {
        photo_id: photoId,
        user_email: currentUserEmail,
        content: commentText,
      },
    ])

    setCommentText('')
    fetchPhotos()
  }

  const handleDeletePhoto = async (photoId: string, imageUrl: string) => {
    if (!confirm(t('confirm_delete') || 'Silmek istediğinize emin misiniz?')) return

    try {
      const path = imageUrl.split('/gallery/')[1]
      if (path) {
        await supabase.storage.from('event-images').remove([`gallery/${path}`])
      }
      await supabase.from('photos').delete().eq('id', photoId)
      fetchPhotos()
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm(t('confirm_delete') || 'Silmek istediğinize emin misiniz?')) return
    await supabase.from('photo_comments').delete().eq('id', commentId)
    fetchPhotos()
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* UPLOAD OPTIONS */}
      {showUploadOptions ? (
        <div className="bg-white border-2 border-indigo-500 rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Fotoğraf Ekle</h3>
            <button
              onClick={() => setShowUploadOptions(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* CAMERA OPTION */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleUpload(e, 'camera')}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              id="camera-input"
            />
            <label
              htmlFor="camera-input"
              className="flex items-center justify-center gap-3 bg-indigo-600 text-white p-4 rounded-lg cursor-pointer hover:bg-indigo-700 transition"
            >
              <span className="text-2xl">📷</span>
              <span className="font-semibold">Fotoğraf Çek</span>
            </label>
          </div>

          {/* GALLERY OPTION */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, 'gallery')}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              id="gallery-input"
            />
            <label
              htmlFor="gallery-input"
              className="flex items-center justify-center gap-3 bg-gray-100 text-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-200 transition"
            >
              <span className="text-2xl">🖼️</span>
              <span className="font-semibold">Galeriden Seç</span>
            </label>
          </div>

          <p className="text-xs text-gray-500 text-center">Max 10MB</p>
        </div>
      ) : (
        <button
          onClick={() => setShowUploadOptions(true)}
          disabled={uploading}
          className="w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition group"
          style={{ borderColor: uploading ? themeColor : undefined }}
        >
          <div className="text-4xl mb-2 group-hover:scale-110 transition">{uploading ? '⏳' : '📸'}</div>
          <p className="text-gray-500 font-bold text-sm">
            {uploading ? t('loading') : 'Fotoğraf Ekle'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Kamera veya Galeri</p>
        </button>
      )}

      {/* PHOTOS GRID */}
      {photos.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-4">📷</div>
          <p className="font-medium">{t('gallery_empty') || 'Henüz fotoğraf yok'}</p>
          <p className="text-sm mt-2">{t('gallery_empty_hint') || 'İlk fotoğrafı siz ekleyin!'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {photos.map((photo) => {
            const isOwner = photo.user_email === currentUserEmail
            const hasLiked = photo.photo_likes?.some((l: any) => l.user_email === currentUserEmail)
            const likeCount = photo.photo_likes?.length || 0

            return (
              <div key={photo.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                <div
                  className="relative aspect-square cursor-pointer bg-gray-100"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img src={photo.image_url} className="w-full h-full object-cover" alt="Memory" />
                </div>

                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleLike(photo.id)}
                      className="flex items-center gap-1 text-sm"
                      style={{ color: hasLiked ? themeColor : '#6B7280' }}
                    >
                      {hasLiked ? '❤️' : '🤍'} {likeCount}
                    </button>

                    {isOwner && (
                      <button
                        onClick={() => handleDeletePhoto(photo.id, photo.image_url)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        🗑️
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-gray-500">
                    {photo.uploader_name} • {new Date(photo.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* PHOTO MODAL */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img src={selectedPhoto.image_url} className="w-full h-auto" alt="Full" />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl hover:bg-black/70"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {selectedPhoto.uploader_name} • {new Date(selectedPhoto.created_at).toLocaleString('tr-TR')}
                </p>
                <button
                  onClick={() => handleLike(selectedPhoto.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm"
                  style={{
                    backgroundColor: selectedPhoto.photo_likes?.some((l: any) => l.user_email === currentUserEmail)
                      ? themeColor
                      : '#F3F4F6',
                    color: selectedPhoto.photo_likes?.some((l: any) => l.user_email === currentUserEmail)
                      ? 'white'
                      : '#6B7280',
                  }}
                >
                  ❤️ {selectedPhoto.photo_likes?.length || 0}
                </button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-bold text-gray-800 mb-3">
                  {t('comments') || 'Yorumlar'} ({selectedPhoto.photo_comments?.length || 0})
                </h4>

                <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                  {selectedPhoto.photo_comments?.map((comment: any) => (
                    <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">
                            {comment.user_email.split('@')[0]} •{' '}
                            {new Date(comment.created_at).toLocaleString('tr-TR')}
                          </p>
                          <p className="text-sm text-gray-800">{comment.content}</p>
                        </div>
                        {comment.user_email === currentUserEmail && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-xs text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={t('add_comment') || 'Yorum ekle...'}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400"
                    onKeyPress={(e) => e.key === 'Enter' && handleComment(selectedPhoto.id)}
                  />
                  <button
                    onClick={() => handleComment(selectedPhoto.id)}
                    className="px-6 py-2 rounded-lg font-semibold text-sm text-white"
                    style={{ backgroundColor: themeColor }}
                  >
                    {t('send') || 'Gönder'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}