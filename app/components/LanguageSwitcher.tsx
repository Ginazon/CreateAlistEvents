'use client'

import { useLanguage } from '../context/LanguageContext'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex gap-2 text-sm font-bold bg-white/50 p-1 rounded-lg border">
      <button 
        onClick={() => setLanguage('tr')}
        className={`px-2 py-1 rounded transition ${language === 'tr' ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'}`}
      >
        🇹🇷 TR
      </button>
      <button 
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 rounded transition ${language === 'en' ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'}`}
      >
        🇺🇸 EN
      </button>
    </div>
  )
}