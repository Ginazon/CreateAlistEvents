'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useTranslation } from '../i18n'

interface RsvpFormProps {
    eventId: string;
    themeColor: string;
    onLoginSuccess: (email: string) => void;
}

export default function RsvpForm({ eventId, themeColor, onLoginSuccess }: RsvpFormProps) {
  const { t } = useTranslation()

  // STATE'LER (Senin yapınla aynı)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('katiliyor') // Varsayılan: yes/katiliyor
  const [plusOne, setPlusOne] = useState(0)
  const [note, setNote] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [customSchema, setCustomSchema] = useState<any[]>([])
  const [formResponses, setFormResponses] = useState<Record<string, any>>({})

  useEffect(() => {
      const fetchSchema = async () => {
          const { data } = await supabase.from('events').select('custom_form_schema').eq('id', eventId).single()
          if (data && data.custom_form_schema) {
              setCustomSchema(data.custom_form_schema)
          }
      }
      fetchSchema()
  }, [eventId])

  const handleCustomChange = (label: string, value: any) => {
      setFormResponses(prev => ({ ...prev, [label]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Gönderilecek Veri Paketi
    const payload = {
        event_id: eventId,
        name,
        email,
        status, // 'yes', 'no', 'maybe' veya 'katiliyor'
        participants: plusOne ? plusOne + 1 : 1, // Katılımcı sayısı (Kendisi + misafir)
        note,
        form_responses: formResponses
    }

    // 1. Veritabanına Ekle
    const { error } = await supabase.from('guests').insert([payload])

    setLoading(false)

    if (error) {
        // HATA YÖNETİMİ
        // Eğer hata kodu 23505 ise (Unique Violation), kullanıcı zaten kayıtlıdır.
        // Bu durumda hata vermek yerine "Başarılı" sayıp girişini yapalım.
        if (error.code === '23505') {
            console.log("Kullanıcı zaten kayıtlı, giriş yapılıyor...")
            setSuccess(true)
            onLoginSuccess(email) // Dashboard'a geçiş için kritik
        } else {
            alert('Hata: ' + error.message)
        }
    } else {
        // BAŞARILI
        setSuccess(true)
        console.log("Kayıt başarılı, giriş yapılıyor...")
        onLoginSuccess(email) // Dashboard'a geçiş için kritik
    }
  }

  // iPhone Dark Mode Fix
  const inputStyle = { colorScheme: 'light' }

  if (success) {
    return (
      <div className="bg-green-50 p-6 rounded-xl text-center border border-green-200 animate-fadeIn">
        <div className="text-4xl mb-2">✅</div>
        <h3 className="text-green-800 font-bold text-lg">{t('rsvp_success_title')}</h3>
        <p className="text-green-600 text-sm mt-1">{t('rsvp_success_message') || "Kaydınız alındı!"}</p>
        <p className="text-xs text-gray-400 mt-4">Sayfanın en altından panele geçebilirsiniz.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left bg-gray-50 p-6 rounded-xl border border-gray-100">
      <h3 className="font-bold text-center text-gray-800 mb-4">{t('rsvp_title')}</h3>
      
      {/* İSİM ALANI */}
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">{t('rsvp_name_label')} *</label>
        <input required type="text" value={name} onChange={e => setName(e.target.value)} 
               className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-black/10 text-gray-900 bg-white appearance-none"
               style={inputStyle} 
               placeholder={t('rsvp_name_ph')}/>
      </div>

      {/* EMAIL ALANI */}
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">{t('rsvp_email_label')} *</label>
        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} 
               className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-black/10 text-gray-900 bg-white appearance-none"
               style={inputStyle}
               placeholder={t('rsvp_email_ph')}/>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">{t('rsvp_status_label')}</label>
            <select value={status} onChange={e => setStatus(e.target.value)} 
                    className="w-full border p-3 rounded-lg bg-white text-gray-900 appearance-none"
                    style={inputStyle}>
                <option value="yes">{t('rsvp_option_yes') || "Katılıyorum"}</option>
                <option value="maybe">{t('rsvp_option_maybe') || "Belki"}</option>
                <option value="no">{t('rsvp_option_no') || "Katılmıyorum"}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">{t('rsvp_count_label')}</label>
            <input type="number" min="0" max="10" value={plusOne} onChange={e => setPlusOne(Number(e.target.value))} 
                   className="w-full border p-3 rounded-lg text-gray-900 bg-white appearance-none"
                   style={inputStyle}/>
          </div>
      </div>

      {/* DİNAMİK ALANLAR */}
      {customSchema.length > 0 && (
          <div className="border-t border-dashed pt-4 mt-4 space-y-4">
              {customSchema.map((field) => (
                  <div key={field.id}>
                      <label className="block text-xs font-bold text-gray-500 mb-1">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      
                      {field.type === 'text' && (
                          <input type="text" required={field.required}
                              className="w-full border p-3 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 bg-white appearance-none"
                              style={inputStyle}
                              onChange={(e) => handleCustomChange(field.label, e.target.value)}
                          />
                      )}

                      {field.type === 'textarea' && (
                          <textarea required={field.required}
                              className="w-full border p-3 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 h-20 text-gray-900 bg-white appearance-none"
                              style={inputStyle}
                              onChange={(e) => handleCustomChange(field.label, e.target.value)}
                          />
                      )}

                      {field.type === 'select' && (
                          <select required={field.required}
                              className="w-full border p-3 rounded-lg bg-white text-gray-900 appearance-none"
                              style={inputStyle}
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

      {/* NOT ALANI */}
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">{t('rsvp_note_label')}</label>
        <textarea value={note} onChange={e => setNote(e.target.value)} 
                  className="w-full border p-3 rounded-lg h-20 outline-none text-gray-900 bg-white appearance-none"
                  style={inputStyle}
                  placeholder={t('rsvp_note_ph')}/>
      </div>

      <button type="submit" disabled={loading} className="w-full text-white font-bold py-4 rounded-xl shadow-lg hover:brightness-90 transition disabled:opacity-50" style={{ backgroundColor: themeColor }}>
        {loading ? (t('rsvp_btn_sending') || "Gönderiliyor...") : (t('rsvp_btn_send') || "Lütfen Cevap Verin (LCV)")}
      </button>
    </form>
  )
}