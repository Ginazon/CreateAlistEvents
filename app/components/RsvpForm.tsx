'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function RsvpForm({ eventId, themeColor, onLoginSuccess }: { eventId: string, themeColor: string, onLoginSuccess: (email: string) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('katiliyor')
  const [plusOne, setPlusOne] = useState(0)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  // DİNAMİK FORM STATE
  const [customSchema, setCustomSchema] = useState<any[]>([])
  const [formResponses, setFormResponses] = useState<Record<string, any>>({})

  // Form Şemasını Çek
  useEffect(() => {
      const fetchSchema = async () => {
          const { data } = await supabase.from('events').select('custom_form_schema').eq('id', eventId).single()
          if (data && data.custom_form_schema) {
              setCustomSchema(data.custom_form_schema)
          }
      }
      fetchSchema()
  }, [eventId])

  // Dinamik Input Değişimi
  const handleCustomChange = (label: string, value: any) => {
      setFormResponses(prev => ({ ...prev, [label]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Önce aynı email var mı kontrol et
    const { data: existing } = await supabase.from('guests').select('*').eq('event_id', eventId).eq('email', email).single()

    const payload = {
        event_id: eventId,
        name,
        email,
        status,
        plus_one: plusOne,
        note,
        form_responses: formResponses
    }

    let error;
    if (existing) {
        // Varsa güncelle
        const { error: err } = await supabase.from('guests').update(payload).eq('id', existing.id)
        error = err
    } else {
        // Yoksa ekle
        const { error: err } = await supabase.from('guests').insert([payload])
        error = err
    }

    if (error) {
      alert('Hata: ' + error.message)
    } else {
      setSuccess(true)
      onLoginSuccess(email)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-green-50 p-6 rounded-xl text-center border border-green-200 animate-fadeIn">
        <div className="text-4xl mb-2">✅</div>
        <h3 className="text-green-800 font-bold text-lg">Kaydınız Alındı!</h3>
        <p className="text-green-600 text-sm mt-1">Teşekkürler {name}, yanıtın bize ulaştı.</p>
        <p className="text-xs text-gray-400 mt-4">Aşağıdaki galeriye fotoğraf yükleyebilirsin.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left bg-gray-50 p-6 rounded-xl border border-gray-100">
      <h3 className="font-bold text-center text-gray-800 mb-4">LCV Formu</h3>
      
      {/* STANDART ALANLAR */}
      {/* NOT: Tüm inputlara 'text-gray-900' eklendi (iPhone Dark Mode Fix) */}
      
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">Ad Soyad *</label>
        <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-black/10 text-gray-900 bg-white" placeholder="İsminiz"/>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">E-Posta * (Galeriye giriş için)</label>
        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-black/10 text-gray-900 bg-white" placeholder="ornek@email.com"/>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Durum</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border p-3 rounded-lg bg-white text-gray-900">
                <option value="katiliyor">Katılıyorum 🥳</option>
                <option value="katilmiyor">Katılamıyorum 😔</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">+ Kişi Sayısı</label>
            <input type="number" min="0" max="10" value={plusOne} onChange={e => setPlusOne(Number(e.target.value))} className="w-full border p-3 rounded-lg text-gray-900 bg-white"/>
          </div>
      </div>

      {/* --- DİNAMİK ALANLAR --- */}
      {customSchema.length > 0 && (
          <div className="border-t border-dashed pt-4 mt-4 space-y-4">
              {customSchema.map((field) => (
                  <div key={field.id}>
                      <label className="block text-xs font-bold text-gray-500 mb-1">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      
                      {field.type === 'text' && (
                          <input 
                              type="text" 
                              required={field.required}
                              className="w-full border p-3 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 bg-white"
                              onChange={(e) => handleCustomChange(field.label, e.target.value)}
                          />
                      )}

                      {field.type === 'textarea' && (
                          <textarea 
                              required={field.required}
                              className="w-full border p-3 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 h-20 text-gray-900 bg-white"
                              onChange={(e) => handleCustomChange(field.label, e.target.value)}
                          />
                      )}

                      {field.type === 'select' && (
                          <select 
                              required={field.required}
                              className="w-full border p-3 rounded-lg bg-white text-gray-900"
                              onChange={(e) => handleCustomChange(field.label, e.target.value)}
                              defaultValue=""
                          >
                              <option value="" disabled>Seçiniz...</option>
                              {field.options?.split(',').map((opt: string) => (
                                  <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                              ))}
                          </select>
                      )}
                  </div>
              ))}
          </div>
      )}

      {/* NOT ALANI (Standart) */}
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">Notunuz (Opsiyonel)</label>
        <textarea value={note} onChange={e => setNote(e.target.value)} className="w-full border p-3 rounded-lg h-20 outline-none text-gray-900 bg-white" placeholder="İletmek istediğiniz bir mesaj..."/>
      </div>

      <button type="submit" disabled={loading} className="w-full text-white font-bold py-4 rounded-xl shadow-lg hover:brightness-90 transition disabled:opacity-50" style={{ backgroundColor: themeColor }}>
        {loading ? 'Gönderiliyor...' : 'Cevabı Gönder'}
      </button>
    </form>
  )
}