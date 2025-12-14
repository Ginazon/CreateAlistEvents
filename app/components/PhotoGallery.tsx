'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useTranslation } from '../i18n'

export default function PhotoGallery({ eventId, currentUserEmail, themeColor }: { eventId: string, currentUserEmail: string, themeColor: string }) {
  const { t } = useTranslation()
  const [photos, setPhotos] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUploadOptions, setShowUploadOptions] = useState(false)
  const [viewMode, setViewMode] = useState<'feed' | 'grid'>('feed') // feed or grid
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [showFloatingBar, setShowFloatingBar] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null) // For grid modal
  const [modalCommentText, setModalCommentText] = useState('')
  const [previewFile, setPreviewFile] = useState<File | null>(null) // Preview before upload
  const [previewUrl, setPreviewUrl] = useState<string | null>(null) // Preview URL
  const galleryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchPhotos()
  }, [eventId])

  // Intersection Observer for floating bar
  useEffect(() => {
    if (!galleryRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFloatingBar(entry.isIntersecting)
      },
      {
        threshold: 0.1, // Show when 10% of gallery is visible
      }
    )

    observer.observe(galleryRef.current)

    return () => observer.disconnect()
  }, [])

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, source: 'camera' | 'gallery') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert(t('error.file_too_large') || 'File too large (Max 10MB)')
      return
    }

    // Show preview
    setPreviewFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setShowUploadOptions(false)
  }

  const handleUpload = async () => {
    if (!previewFile) return

    setUploading(true)
    setError(null)

    try {
      const fileExt = previewFile.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(`gallery/${eventId}/${fileName}`, previewFile)

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
      
      // Clear preview
      setPreviewFile(null)
      setPreviewUrl(null)
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || t('error.something_went_wrong'))
    } finally {
      setUploading(false)
    }
  }

  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewFile(null)
    setPreviewUrl(null)
    setShowUploadOptions(true)
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
    const text = commentInputs[photoId]?.trim()
    if (!text) return

    await supabase.from('photo_comments').insert([
      {
        photo_id: photoId,
        user_email: currentUserEmail,
        content: text,
      },
    ])

    setCommentInputs({ ...commentInputs, [photoId]: '' })
    fetchPhotos()
  }

  const handleModalComment = async (photoId: string) => {
    const text = modalCommentText.trim()
    if (!text) return

    await supabase.from('photo_comments').insert([
      {
        photo_id: photoId,
        user_email: currentUserEmail,
        content: text,
      },
    ])

    setModalCommentText('')
    await fetchPhotos()
    
    // Update selected photo with new comments
    const updatedPhoto = photos.find(p => p.id === photoId)
    if (updatedPhoto) {
      setSelectedPhoto(updatedPhoto)
    }
  }

  const handleDeletePhoto = async (photoId: string, imageUrl: string) => {
    if (!confirm(t('confirm_delete') || 'Are you sure you want to delete?')) return

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
    if (!confirm(t('confirm_delete') || 'Are you sure you want to delete?')) return
    await supabase.from('photo_comments').delete().eq('id', commentId)
    fetchPhotos()
  }

  const toggleComments = (photoId: string) => {
    const newExpanded = new Set(expandedComments)
    if (newExpanded.has(photoId)) {
      newExpanded.delete(photoId)
    } else {
      newExpanded.add(photoId)
    }
    setExpandedComments(newExpanded)
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div ref={galleryRef} className="space-y-6 relative pb-24">
      {/* EMPTY STATE */}
      {photos.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-4">📷</div>
          <p className="font-medium">{t('gallery_empty') || 'No photos yet'}</p>
          <p className="text-sm mt-2">{t('gallery_empty_hint') || 'Be the first to add a photo!'}</p>
        </div>
      )}

      {/* FEED VIEW */}
      {viewMode === 'feed' && photos.length > 0 && (
        <div className="space-y-6">
          {photos.map((photo) => {
            const isOwner = photo.user_email === currentUserEmail
            const hasLiked = photo.photo_likes?.some((l: any) => l.user_email === currentUserEmail)
            const likeCount = photo.photo_likes?.length || 0
            const comments = photo.photo_comments || []
            const commentCount = comments.length
            const showAllComments = expandedComments.has(photo.id)
            const visibleComments = showAllComments ? comments : comments.slice(0, 2)

            return (
              <div key={photo.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                {/* HEADER */}
                <div className="p-4 flex items-center justify-between border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${themeColor}20`, color: themeColor }}>
                      {photo.uploader_name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{photo.uploader_name}</p>
                      <p className="text-xs text-gray-500">{new Date(photo.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => handleDeletePhoto(photo.id, photo.image_url)}
                      className="text-gray-400 hover:text-red-500 text-xl"
                    >
                      ⋯
                    </button>
                  )}
                </div>

                {/* IMAGE with FLOATING STATS */}
                <div className="relative bg-gray-100">
                  <img src={photo.image_url} className="w-full h-auto" alt="Memory" />
                  
                  {/* FLOATING STATS - Top Right */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1">
                      ❤️ {likeCount}
                    </div>
                    <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1">
                      💬 {commentCount}
                    </div>
                  </div>

                  {/* FLOATING LIKE BUTTON - Bottom Left */}
                  <div className="absolute bottom-3 left-3">
                    <button
                      onClick={() => handleLike(photo.id)}
                      className="transition-transform active:scale-90 hover:scale-110 drop-shadow-lg"
                    >
                      <span className="text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                        {hasLiked ? '❤️' : '🤍'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="p-4 space-y-3">
                  {/* LIKES COUNT */}
                  {likeCount > 0 && (
                    <p className="text-sm font-semibold text-gray-900">
                      {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                    </p>
                  )}

                  {/* COMMENTS */}
                  {commentCount > 0 && (
                    <div className="space-y-2">
                      {visibleComments.map((comment: any) => (
                        <div key={comment.id} className="flex gap-2 text-sm">
                          <p className="flex-1">
                            <span className="font-semibold text-gray-900 mr-2">
                              {comment.user_email.split('@')[0]}
                            </span>
                            <span className="text-gray-700">{comment.content}</span>
                          </p>
                          {comment.user_email === currentUserEmail && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-xs text-gray-400 hover:text-red-500"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}

                      {/* VIEW MORE COMMENTS */}
                      {commentCount > 2 && (
                        <button
                          onClick={() => toggleComments(photo.id)}
                          className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                        >
                          {showAllComments 
                            ? 'Hide comments' 
                            : `View all ${commentCount} comments`}
                        </button>
                      )}
                    </div>
                  )}

                  {/* TIME */}
                  <p className="text-xs text-gray-400 uppercase">
                    {new Date(photo.created_at).toLocaleString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* ADD COMMENT */}
                <div className="border-t border-gray-100 p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentInputs[photo.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [photo.id]: e.target.value })}
                      placeholder="Add a comment..."
                      className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400 text-gray-900"
                      onKeyPress={(e) => e.key === 'Enter' && handleComment(photo.id)}
                    />
                    {commentInputs[photo.id]?.trim() && (
                      <button
                        onClick={() => handleComment(photo.id)}
                        className="text-sm font-semibold"
                        style={{ color: themeColor }}
                      >
                        Post
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && photos.length > 0 && (
        <div className="grid grid-cols-3 gap-1">
          {photos.map((photo) => {
            const likeCount = photo.photo_likes?.length || 0
            const commentCount = photo.photo_comments?.length || 0

            return (
              <div
                key={photo.id}
                className="relative aspect-square bg-gray-100 group cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img 
                  src={photo.image_url} 
                  className="w-full h-full object-cover" 
                  alt="Memory" 
                />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-4">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-4 text-white font-bold">
                    <div className="flex items-center gap-1">
                      <span className="text-xl">❤️</span>
                      <span>{likeCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xl">💬</span>
                      <span>{commentCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* FLOATING ACTION BAR - Only visible when gallery is in view */}
      {showFloatingBar && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-xl w-full px-6 animate-slide-up">
          <div className="bg-white rounded-full shadow-2xl border border-gray-200 p-2 flex items-center justify-center gap-2">
            {/* UPLOAD BUTTON */}
            <button
              onClick={() => setShowUploadOptions(!showUploadOptions)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white transition-all hover:scale-105"
              style={{ backgroundColor: themeColor }}
            >
              <span className="text-xl">📸</span>
              <span>{uploading ? 'Uploading...' : 'Add Photo'}</span>
            </button>

            {/* VIEW TOGGLE */}
            <button
              onClick={() => setViewMode(viewMode === 'feed' ? 'grid' : 'feed')}
              className="px-4 py-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all text-xl"
            >
              {viewMode === 'feed' ? '▦' : '☰'}
            </button>
          </div>
        </div>
      )}

      {/* UPLOAD OPTIONS MODAL */}
      {showUploadOptions && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4"
          onClick={() => setShowUploadOptions(false)}
        >
          <div
            className="bg-white rounded-t-3xl max-w-xl w-full p-6 space-y-3 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-lg">Add Photo</h3>
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
                onChange={(e) => handleFileSelect(e, 'camera')}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                id="camera-input"
              />
              <label
                htmlFor="camera-input"
                className="flex items-center justify-center gap-3 text-white p-4 rounded-2xl cursor-pointer transition-all hover:scale-105"
                style={{ backgroundColor: themeColor }}
              >
                <span className="text-2xl">📷</span>
                <span className="font-semibold">Take Photo</span>
              </label>
            </div>

            {/* GALLERY OPTION */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 'gallery')}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                id="gallery-input"
              />
              <label
                htmlFor="gallery-input"
                className="flex items-center justify-center gap-3 bg-gray-100 text-gray-700 p-4 rounded-2xl cursor-pointer hover:bg-gray-200 transition-all"
              >
                <span className="text-2xl">🖼️</span>
                <span className="font-semibold">Choose from Gallery</span>
              </label>
            </div>

            <p className="text-xs text-gray-500 text-center pt-2">Max 10MB</p>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL - Before Upload */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={handleCancelPreview}
        >
          <div
            className="max-w-2xl w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview Image */}
            <div className="bg-black rounded-xl overflow-hidden">
              <img 
                src={previewUrl} 
                className="w-full h-auto max-h-[70vh] object-contain" 
                alt="Preview" 
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelPreview}
                className="flex-1 bg-white text-gray-700 px-6 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition-all"
              >
                ❌ Retake / Choose Another
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 text-white px-6 py-4 rounded-2xl font-semibold transition-all hover:scale-105 disabled:opacity-50"
                style={{ backgroundColor: themeColor }}
              >
                {uploading ? '⏳ Uploading...' : '✅ Upload'}
              </button>
            </div>

            {/* Info */}
            <p className="text-white text-center text-sm opacity-75">
              Preview your photo before uploading
            </p>
          </div>
        </div>
      )}

      {/* PHOTO DETAIL MODAL (Grid View Only) */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => {
            setSelectedPhoto(null)
            setModalCommentText('')
          }}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* LEFT: Image */}
            <div className="md:w-2/3 bg-black flex items-center justify-center">
              <img 
                src={selectedPhoto.image_url} 
                className="w-full h-auto max-h-[90vh] object-contain" 
                alt="Full" 
              />
            </div>

            {/* RIGHT: Details */}
            <div className="md:w-1/3 flex flex-col max-h-[90vh]">
              {/* HEADER */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" 
                    style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
                  >
                    {selectedPhoto.uploader_name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{selectedPhoto.uploader_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedPhoto(null)
                    setModalCommentText('')
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* COMMENTS SECTION */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Caption/First comment by uploader */}
                <div className="flex gap-2 text-sm">
                  <div 
                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold" 
                    style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
                  >
                    {selectedPhoto.uploader_name[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p>
                      <span className="font-semibold text-gray-900 mr-2">{selectedPhoto.uploader_name}</span>
                      <span className="text-gray-600">
                        {new Date(selectedPhoto.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Comments */}
                {selectedPhoto.photo_comments?.map((comment: any) => (
                  <div key={comment.id} className="flex gap-2 text-sm">
                    <div 
                      className="w-8 h-8 rounded-full flex-shrink-0 bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600"
                    >
                      {comment.user_email.split('@')[0][0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p>
                        <span className="font-semibold text-gray-900 mr-2">
                          {comment.user_email.split('@')[0]}
                        </span>
                        <span className="text-gray-700">{comment.content}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(comment.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    {comment.user_email === currentUserEmail && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-xs text-gray-400 hover:text-red-500 flex-shrink-0"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}

                {selectedPhoto.photo_comments?.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">No comments yet</p>
                )}
              </div>

              {/* ACTIONS */}
              <div className="border-t border-gray-200 p-4 space-y-3">
                {/* Like & Stats */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleLike(selectedPhoto.id)}
                    className="flex items-center gap-2 transition-transform active:scale-90"
                  >
                    <span className="text-2xl">
                      {selectedPhoto.photo_likes?.some((l: any) => l.user_email === currentUserEmail) ? '❤️' : '🤍'}
                    </span>
                  </button>
                  {selectedPhoto.user_email === currentUserEmail && (
                    <button
                      onClick={() => {
                        handleDeletePhoto(selectedPhoto.id, selectedPhoto.image_url)
                        setSelectedPhoto(null)
                      }}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  )}
                </div>

                {selectedPhoto.photo_likes?.length > 0 && (
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedPhoto.photo_likes.length} {selectedPhoto.photo_likes.length === 1 ? 'like' : 'likes'}
                  </p>
                )}

                {/* Add Comment */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <input
                    type="text"
                    value={modalCommentText}
                    onChange={(e) => setModalCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400 text-gray-900"
                    onKeyPress={(e) => e.key === 'Enter' && handleModalComment(selectedPhoto.id)}
                  />
                  {modalCommentText.trim() && (
                    <button
                      onClick={() => handleModalComment(selectedPhoto.id)}
                      className="text-sm font-semibold"
                      style={{ color: themeColor }}
                    >
                      Post
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}