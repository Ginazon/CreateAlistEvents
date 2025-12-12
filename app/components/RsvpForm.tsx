'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useTranslation } from '../i18n'

interface RsvpFormProps {
    eventId: string;
    themeColor: string;
    onLoginSuccess: (email: string) => void;
    initialEmail?: string | null;
}

export default function RsvpForm({ eventId, themeColor, onLoginSuccess, initialEmail }: RsvpFormProps) {
  const { t } = useTranslation()

  const [name, setName] = useState('')
  const [email, setEmail] = useState(initialEmail || '')
  const [status, setStatus] = useState('yes') 
  const [plusOne, setPlusOne] = useState(0)
  const [note, setNote] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [customSchema, setCustomSchema] = useState<any[]>([])
  const [formResponses, setFormResponses] = useState<Record<string, any>>({})

  // 1. Şema ve (Varsa) Mevcut Kullanıcı Verisini Çek
  useEffect(() => {
      const initForm = async () => {
          // A. Şemayı Çek
          const { data: schemaData } = await supabase.from('events').select('custom_form_schema').eq('id', eventId).single()
          if (schemaData && schemaData.custom_form_schema) {
              setCustomSchema(schemaData.custom_form_schema)
          }

          // B. Eğer düzenleme moduysa (initialEmail varsa) eski cevabı çek ve doldur
          if (initialEmail) {
              setFetchingData(true)
              const { data: guestData } = await supabase
                  .from('guests')
                  .select('*')
                  .eq('event_id', eventId)
                  .eq('email', initialEmail)
                  .single()

              if (guestData) {
                  setName(guestData.name || '')
                  setStatus(guestData.status || 'yes')
                  setPlusOne(guestData.participants ? guestData.participants - 1 : 0)
                  setNote(guestData.note || '')
                  setFormResponses(guestData.form_responses || {})
              }
              setFetchingData(false)
          }
      }
      initForm()
  }, [eventId, initialEmail])

  const handleCustomChange = (label: string, value: any) => {
      setFormResponses(prev => ({ ...prev, [label]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
        event_id: eventId,
        name,
        email,
        status,
        participants: plusOne ? plusOne + 1 : 1,
        note,
        form_responses: formResponses
    }

    const { error } = await supabase
        .from('guests')
        .upsert(payload, { onConflict: 'event_id, email' })

    setLoading(false)

    if (error) {
        alert(t('rsvp_error') + ': ' + error.message)
    } else {
        setSuccess(true)
        setTimeout(() => {
             onLoginSuccess(email) 
        }, 1500)
    }
  }

  const inputStyle = { colorScheme: 'light' }

  if (success) {
    return (
      <div className="bg-green-50 p-6 rounded-xl text-center border border-green-200 animate-fadeIn">
        <div className="text-4xl mb-2">✅</div>
        <h3 className="text-green-800 font-bold text-lg">{t('rsvp_success_title')}</h3>
        <p className="text-green-600 text-sm mt-1">{initialEmail ? t('rsvp.update_info') : t('rsvp_success_message')}</p>
      </div>
    )
  }
  
  if (fetchingData) {
      return <div className="text-center p-10 text-gray-400">{t('rsvp.loading_data')}</div>
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left bg-gray-50 p-6 rounded-xl border border-gray-100">
      <h3 className="font-bold text-center text-gray-800 mb-4">
          {initialEmail ? t('rsvp.update_title') : t('rsvp_title')}
      </h3>
      
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
               disabled={!!initialEmail}
               className={`w-full border p-3 rounded-lg outline-none text-gray-900 appearance-none ${initialEmail ? 'bg-gray-200 text-gray-500' : 'bg-white'}`}
               style={inputStyle}
               placeholder={t('rsvp_email_ph')}/>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">{t('rsvp_status_label')}</label>
            <select value={status} onChange={e => setStatus(e.target.value)} 
                    className="w-full border p-3 rounded-lg bg-white text-gray-900 appearance-none"
                    style={inputStyle}>
                <option value="yes">{t('rsvp_option_yes')}</option>
                <option value="maybe">{t('rsvp_option_maybe')}</option>
                <option value="no">{t('rsvp_option_no')}</option>
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
                              value={formResponses[field.label] || ''}
                              className="w-full border p-3 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 bg-white appearance-none"
                              style={inputStyle}
                              onChange={(e) => handleCustomChange(field.label, e.target.value)}
                          />
                      )}

                      {field.type === 'textarea' && (
                          <textarea required={field.required}
                              value={formResponses[field.label] || ''}
                              className="w-full border p-3 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 h-20 text-gray-900 bg-white appearance-none"
                              style={inputStyle}
                              onChange={(e) => handleCustomChange(field.label, e.target.value)}
                          />
                      )}

                      {field.type === 'select' && (
                          <select required={field.required}
                              value={formResponses[field.label] || ''}
                              className="w-full border p-3 rounded-lg bg-white text-gray-900 appearance-none"
                              style={inputStyle}
                              onChange={(e) => handleCustomChange(field.label, e.target.value)}
                          >
                              <option value="" disabled>{t('rsvp.select_placeholder')}</option>
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
        {loading ? t('rsvp_btn_sending') : (initialEmail ? t('rsvp.btn_update') : t('rsvp_btn_send'))}
      </button>
      
      {/* Düzenlemekten vazgeç butonu */}
      {initialEmail && (
          <button type="button" onClick={() => onLoginSuccess(initialEmail)} className="w-full text-gray-400 text-sm py-2 hover:text-gray-600">
              {t('rsvp.cancel_edit')}
          </button>
      )}
    </form>
  )
}