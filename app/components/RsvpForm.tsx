'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useTranslation } from '../i18n'

interface RsvpFormProps {
  eventId: string
  themeColor: string
  onLoginSuccess: (email: string) => void
  initialEmail?: string | null
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
  const [error, setError] = useState<string | null>(null)
  
  const [customSchema, setCustomSchema] = useState<any[]>([])
  const [formResponses, setFormResponses] = useState<Record<string, any>>({})

  // Şema ve mevcut veriyi çek
  useEffect(() => {
    const initForm = async () => {
      try {
        // A. Şemayı Çek
        const { data: schemaData, error: schemaError } = await supabase
          .from('events')
          .select('custom_form_schema')
          .eq('id', eventId)
          .single()

        if (schemaError) {
          console.error('Schema fetch error:', schemaError)
        } else if (schemaData?.custom_form_schema) {
          setCustomSchema(schemaData.custom_form_schema)
        }

        // B. Düzenleme moduysa mevcut veriyi çek
        if (initialEmail) {
          setFetchingData(true)
          const { data: guestData, error: guestError } = await supabase
            .from('guests')
            .select('*')
            .eq('event_id', eventId)
            .eq('email', initialEmail)
            .single()

          if (guestError) {
            console.error('Guest data fetch error:', guestError)
          } else if (guestData) {
            setName(guestData.name || '')
            setStatus(guestData.status || 'yes')
            setPlusOne(guestData.participants ? guestData.participants - 1 : 0)
            setNote(guestData.note || '')
            setFormResponses(guestData.form_responses || {})
          }
          setFetchingData(false)
        }
      } catch (err) {
        console.error('Form init error:', err)
        setError(t('error.something_went_wrong') || 'Form yüklenemedi')
      }
    }
    initForm()
  }, [eventId, initialEmail, t])

  // Email Validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Form Validation
  const validateForm = (): string | null => {
    if (!name.trim()) {
      return t('alert_name_required')
    }

    if (name.trim().length < 2) {
      return t('error.name_too_short') || 'İsim en az 2 karakter olmalı'
    }

    if (!email.trim()) {
      return t('alert_email_required')
    }

    if (!validateEmail(email)) {
      return t('error.invalid_email') || 'Geçersiz e-posta adresi'
    }

    // Custom fields validation
    for (const field of customSchema) {
      if (field.required && !formResponses[field.label]?.trim()) {
        return `${field.label} ${t('required_checkbox').toLowerCase()}`
      }
    }

    return null
  }

  const handleCustomChange = (label: string, value: any) => {
    setFormResponses(prev => ({ ...prev, [label]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const payload = {
        event_id: eventId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        status,
        participants: plusOne ? plusOne + 1 : 1,
        note: note.trim(),
        form_responses: formResponses,
      }

      const { error: upsertError } = await supabase
        .from('guests')
        .upsert(payload, { onConflict: 'event_id, email' })

      if (upsertError) {
        throw upsertError
      }

      setSuccess(true)
      setTimeout(() => {
        onLoginSuccess(email.trim().toLowerCase())
      }, 1500)
    } catch (err: any) {
      console.error('RSVP submit error:', err)
      setError(t('rsvp_error') + ': ' + (err.message || t('error.something_went_wrong')))
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { colorScheme: 'light' as const }

  // Success State
  if (success) {
    return (
      <div className="bg-green-50 p-6 rounded-xl text-center border border-green-200 animate-fadeIn">
        <div className="text-4xl mb-2">✅</div>
        <h3 className="text-green-800 font-bold text-lg">{t('rsvp_success_title')}</h3>
        <p className="text-green-600 text-sm mt-1">
          {initialEmail ? t('rsvp.update_info') : t('rsvp_success_message')}
        </p>
      </div>
    )
  }

  // Loading State
  if (fetchingData) {
    return (
      <div className="text-center p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
        <p className="text-gray-400">{t('rsvp.loading_data')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left bg-gray-50 p-6 rounded-xl border border-gray-100">
      <h3 className="font-bold text-center text-gray-800 mb-4">
        {initialEmail ? t('rsvp.update_title') : t('rsvp_title')}
      </h3>

      {/* ERROR DISPLAY */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 animate-fadeIn">
          <p className="font-bold">⚠️ {error}</p>
        </div>
      )}

      {/* İSİM */}
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">
          {t('rsvp_name_label')} *
        </label>
        <input
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-black/10 text-gray-900 bg-white appearance-none"
          style={inputStyle}
          placeholder={t('rsvp_name_ph')}
          maxLength={100}
        />
      </div>

      {/* EMAIL */}
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">
          {t('rsvp_email_label')} *
        </label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!!initialEmail}
          className={`w-full border p-3 rounded-lg outline-none text-gray-900 appearance-none ${
            initialEmail ? 'bg-gray-200 text-gray-500' : 'bg-white'
          }`}
          style={inputStyle}
          placeholder={t('rsvp_email_ph')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* STATUS */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">{t('rsvp_status_label')}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border p-3 rounded-lg bg-white text-gray-900 appearance-none"
            style={inputStyle}
          >
            <option value="yes">{t('rsvp_option_yes')}</option>
            <option value="maybe">{t('rsvp_option_maybe')}</option>
            <option value="no">{t('rsvp_option_no')}</option>
          </select>
        </div>

        {/* PLUS ONE */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">{t('rsvp_count_label')}</label>
          <input
            type="number"
            min="0"
            max="10"
            value={plusOne}
            onChange={(e) => setPlusOne(Number(e.target.value))}
            className="w-full border p-3 rounded-lg text-gray-900 bg-white appearance-none"
            style={inputStyle}
          />
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
                <input
                  type="text"
                  required={field.required}
                  value={formResponses[field.label] || ''}
                  className="w-full border p-3 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 bg-white appearance-none"
                  style={inputStyle}
                  onChange={(e) => handleCustomChange(field.label, e.target.value)}
                />
              )}

              {field.type === 'textarea' && (
                <textarea
                  required={field.required}
                  value={formResponses[field.label] || ''}
                  className="w-full border p-3 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 h-20 text-gray-900 bg-white appearance-none"
                  style={inputStyle}
                  onChange={(e) => handleCustomChange(field.label, e.target.value)}
                />
              )}

              {field.type === 'select' && (
                <select
                  required={field.required}
                  value={formResponses[field.label] || ''}
                  className="w-full border p-3 rounded-lg bg-white text-gray-900 appearance-none"
                  style={inputStyle}
                  onChange={(e) => handleCustomChange(field.label, e.target.value)}
                >
                  <option value="" disabled>
                    {t('rsvp.select_placeholder')}
                  </option>
                  {field.options?.split(',').map((opt: string) => (
                    <option key={opt.trim()} value={opt.trim()}>
                      {opt.trim()}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      )}

      {/* NOT */}
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">{t('rsvp_note_label')}</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border p-3 rounded-lg h-20 outline-none text-gray-900 bg-white appearance-none"
          style={inputStyle}
          placeholder={t('rsvp_note_ph')}
          maxLength={500}
        />
      </div>

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        disabled={loading}
        className="w-full text-white font-bold py-4 rounded-xl shadow-lg hover:brightness-90 transition disabled:opacity-50"
        style={{ backgroundColor: themeColor }}
      >
        {loading ? t('rsvp_btn_sending') : initialEmail ? t('rsvp.btn_update') : t('rsvp_btn_send')}
      </button>

      {/* CANCEL BUTTON (düzenleme modunda) */}
      {initialEmail && (
        <button
          type="button"
          onClick={() => onLoginSuccess(initialEmail)}
          className="w-full text-gray-400 text-sm py-2 hover:text-gray-600"
        >
          {t('rsvp.cancel_edit')}
        </button>
      )}
    </form>
  )
}