'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function RsvpForm({ eventId }: { eventId: string }) {
  const [name, setName] = useState('')
  const [status, setStatus] = useState('katiliyor') // Varsayılan: Katılıyor
  const [plusOne, setPlusOne] = useState(0)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!name) return alert('Lütfen adınızı giriniz.')

    setLoading(true)

    const { error } = await supabase
      .from('guests')
      .insert([
        {
          event_id: eventId,
          name: name,
          status: status,
          plus_one: plusOne,
          note: note
        }
      ])

    setLoading(false)

    if (error) {
      alert('Hata oluştu: ' + error.message)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="bg-green-100 text-green-700 p-6 rounded-xl text-center">
        <h3 className="text-xl font-bold mb-2">Teşekkürler! 🎉</h3>
        <p>Yanıtınız başarıyla kaydedildi.</p>
      </div>
    )
  }

  return (
    <div className="mt-8 bg-gray-50 p-6 rounded-xl border border-gray-200 w-full">
      <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Katılım Durumu Bildir (LCV)</h3>
      
      <div className="space-y-4">
        {/* Ad Soyad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adınız Soyadınız</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded p-2 outline-indigo-500"
            placeholder="Örn: Mehmet Yılmaz"
          />
        </div>

        {/* Katılım Durumu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Katılacak mısınız?</label>
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded p-2 outline-indigo-500 bg-white"
          >
            <option value="katiliyor">Evet, Katılıyorum</option>
            <option value="katilmiyor">Maalesef Katılamıyorum</option>
            <option value="belirsiz">Henüz Belli Değil</option>
          </select>
        </div>

        {/* Kişi Sayısı */}
        {status === 'katiliyor' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sizinle gelecek kişi sayısı (Siz hariç)</label>
            <input 
              type="number" 
              min="0"
              max="5"
              value={plusOne}
              onChange={(e) => setPlusOne(Number(e.target.value))}
              className="w-full border rounded p-2 outline-indigo-500"
            />
          </div>
        )}

        {/* Not */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mesajınız / Notunuz</label>
          <textarea 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border rounded p-2 outline-indigo-500 h-20"
            placeholder="Varsa notunuzu buraya yazabilirsiniz..."
          />
        </div>

        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? 'Kaydediliyor...' : 'Yanıtı Gönder'}
        </button>
      </div>
    </div>
  )
}