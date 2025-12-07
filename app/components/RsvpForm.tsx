'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function RsvpForm({ eventId, themeColor, onLoginSuccess }: { eventId: string, themeColor: string, onLoginSuccess: (email: string) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('') // YENİ: Email State
  const [status, setStatus] = useState('katiliyor')
  const [plusOne, setPlusOne] = useState(0)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)

  // Sayfa açılınca: Acaba bu kişi daha önce kayıt olmuş mu?
  useEffect(() => {
    const savedEmail = localStorage.getItem(`cereget_user_${eventId}`)
    if (savedEmail) {
      setAlreadyRegistered(true)
      onLoginSuccess(savedEmail) // Üst sayfaya haber ver: "Bu kişi zaten girişli"
    }
  }, [eventId, onLoginSuccess])

  const handleSubmit = async () => {
    if (!name || !email) return alert('Lütfen adınızı ve e-postanızı giriniz.')
    
    // Basit bir email format kontrolü
    if (!email.includes('@') || !email.includes('.')) return alert('Geçerli bir e-posta giriniz.')

    setLoading(true)

    // 1. Veritabanına Kaydet
    const { error } = await supabase
      .from('guests')
      .insert([{ 
        event_id: eventId, 
        name, 
        email, // Email'i de kaydediyoruz
        status, 
        plus_one: plusOne, 
        note 
      }])

    setLoading(false)

    if (error) {
      alert('Hata: ' + error.message)
    } else {
      // 2. Başarılıysa Tarayıcıya Kaydet (Giriş Yapıldı Say)
      localStorage.setItem(`cereget_user_${eventId}`, email)
      setAlreadyRegistered(true)
      onLoginSuccess(email) // Üst bileşene haber ver
      alert('Kaydınız alındı! Galerinin kilidi açıldı. 🎉')
    }
  }

  // Eğer kullanıcı zaten kayıtlıysa bu ekranı göster
  if (alreadyRegistered) {
    return (
      <div className="mt-8 bg-green-50 text-green-800 p-6 rounded-xl text-center border border-green-200">
        <h3 className="text-xl font-bold mb-2">Hoşgeldiniz! 👋</h3>
        <p>Kaydınız bizde mevcut.</p>
        <p className="text-sm opacity-70 mt-1">{localStorage.getItem(`cereget_user_${eventId}`)}</p>
        <button 
          onClick={() => {
             localStorage.removeItem(`cereget_user_${eventId}`)
             setAlreadyRegistered(false)
             window.location.reload()
          }}
          className="text-xs underline mt-4 text-green-600 hover:text-green-800"
        >
          Çıkış Yap / Başkası olarak kaydol
        </button>
      </div>
    )
  }

  return (
    <div className="mt-8 bg-gray-50 p-6 rounded-xl border border-gray-200 w-full text-left">
      <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">Giriş Yap & LCV Bildir</h3>
      <p className="text-xs text-center text-gray-500 mb-6">Etkinlik fotoğraflarını görmek için giriş yapmalısınız.</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adınız Soyadınız</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} 
            className="w-full border rounded p-2 focus:ring-2 outline-none"
            style={{ '--tw-ring-color': themeColor } as any} 
          />
        </div>

        {/* YENİ: Email Alanı */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta Adresiniz <span className="text-red-500">*</span></label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
            placeholder="ornek@email.com"
            className="w-full border rounded p-2 focus:ring-2 outline-none"
            style={{ '--tw-ring-color': themeColor } as any} 
          />
          <p className="text-[10px] text-gray-400 mt-1">Galeriye erişim için gereklidir.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border rounded p-2 bg-white">
            <option value="katiliyor">Evet, Katılıyorum</option>
            <option value="katilmiyor">Maalesef Katılamıyorum</option>
          </select>
        </div>

        {status === 'katiliyor' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">+ Kaç Kişi?</label>
            <input type="number" min="0" max="5" value={plusOne} onChange={(e) => setPlusOne(Number(e.target.value))} className="w-full border rounded p-2"/>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notunuz</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full border rounded p-2 h-20" placeholder="Varsa notunuz..."/>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={loading}
          style={{ backgroundColor: themeColor }}
          className="w-full text-white font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'İşleniyor...' : 'Kayıt Ol ve Galeriye Git'}
        </button>
      </div>
    </div>
  )
}