'use client'

import { useEffect } from 'react'
import { useTranslation } from './i18n'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useTranslation()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">😕</div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {t('error.something_went_wrong') || 'Bir Şeyler Yanlış Gitti'}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {t('error.description') || 'Üzgünüz, beklenmeyen bir hata oluştu.'}
        </p>

        {error.message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs font-mono text-red-800 break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
          >
            {t('error.try_again') || 'Tekrar Dene'}
          </button>
          
          <Link href="/" className="flex-1">
            <button className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition">
              {t('error.go_home') || 'Ana Sayfa'}
            </button>
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          {t('error.persist_message') || 'Sorun devam ederse lütfen destek ekibiyle iletişime geçin.'}
        </p>
      </div>
    </div>
  )
}
