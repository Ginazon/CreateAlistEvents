'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { useTranslation } from '../i18n'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface GuestManagerProps {
  eventId: string;
  eventSlug: string;
  eventTitle: string;
}

export default function GuestManager({ eventId, eventSlug, eventTitle }: GuestManagerProps) {
  const { t } = useTranslation()
  
  const defaultTemplate = t('default_invite_template')
    .replace('{eventTitle}', eventTitle)

  const [guests, setGuests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ total: 0, email: 0, phone: 0 })
  const [inviteTemplate, setInviteTemplate] = useState(defaultTemplate)
  const [isEditingTemplate, setIsEditingTemplate] = useState(false)
  
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newMethod, setNewMethod] = useState('whatsapp')
  const [defaultCountry, setDefaultCountry] = useState('tr')
  const [selectedGuest, setSelectedGuest] = useState<any>(null)

  const eventLink = typeof window !== 'undefined' ? `${window.location.origin}/${eventSlug}` : `/${eventSlug}`

  useEffect(() => {
    fetchGuests()
    fetchTemplate()
    if (typeof window !== 'undefined' && navigator.language) {
        const countryCode = navigator.language.split('-').pop()?.toLowerCase();
        if (countryCode) setDefaultCountry(countryCode);
    }
  }, [eventId])

  const fetchGuests = async () => {
      const { data } = await supabase.from('guests').select('*').eq('event_id', eventId).order('created_at', { ascending: false })
      if (data) { setGuests(data); calculateStats(data); }
  }
  const fetchTemplate = async () => {
      const { data } = await supabase.from('events').select('invite_template').eq('id', eventId).single()
      if (data && data.invite_template) setInviteTemplate(data.invite_template)
      else setInviteTemplate(defaultTemplate)
  }
  const calculateStats = (data: any[]) => {
      setStats({
          total: data.length,
          email: data.filter(g => g.invite_method === 'email').length,
          phone: data.filter(g => g.invite_method === 'whatsapp' || g.invite_method === 'sms').length
      })
  }
  const saveTemplate = async () => {
      await supabase.from('events').update({ invite_template: inviteTemplate }).eq('id', eventId)
      setIsEditingTemplate(false)
      alert(t('save_template') + ' ' + t('alert_save_success'))
  }
  const addGuest = async () => {
      if (!newName) return alert(t('alert_name_required'))
      if (newMethod === 'email' && !newEmail) return alert(t('alert_email_required'))
      if ((newMethod === 'whatsapp' || newMethod === 'sms') && !newPhone) return alert(t('alert_phone_required'))
      
      setLoading(true)
      const { error } = await supabase.from('guests').insert([{ event_id: eventId, name: newName, email: newEmail, phone: newPhone, invite_method: newMethod, status: 'bekleniyor' }])
      if (error) alert(error.message); else { setNewName(''); setNewEmail(''); setNewPhone(''); fetchGuests(); }
      setLoading(false)
  }
  const deleteGuest = async (id: string) => {
      if(!confirm(t('confirm_delete'))) return
      await supabase.from('guests').delete().eq('id', id)
      fetchGuests()
  }
  
  // --- EXCEL İNDİRME ---
  const downloadExcel = () => {
      const dataToExport = guests.map(g => ({
          [t('col_name')]: g.name,
          [t('col_status')]: g.status,
          [t('col_count')]: g.plus_one,
          [t('col_contact')]: g.invite_method,
          [t('pdf_label_phone')]: g.phone,
          [t('pdf_label_email')]: g.email,
          [t('col_note')]: g.note,
          ...(g.form_responses || {}), 
          [t('col_date')]: new Date(g.created_at).toLocaleDateString()
      }))
      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, t('sheet_name'))
      XLSX.writeFile(workbook, `${t('export.filename_prefix')}${eventSlug}.xlsx`) // GÜNCELLENDİ
  }

  // --- PDF İNDİRME ---
  const downloadPdf = () => {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text(eventTitle, 14, 20)
    doc.setFontSize(10)
    doc.text(`${t('total')}: ${stats.total}`, 14, 28)

    const tableBody = guests.map((g, index) => {
        const identity = `${t('pdf_label_name')}: ${g.name}\n${t('pdf_label_status')}: ${g.status.toUpperCase()}\n+${t('pdf_label_count')}: ${g.plus_one}`
        const contact = `${t('pdf_label_phone')}: ${g.phone || '-'}\n${t('pdf_label_email')}: ${g.email || '-'}\n${t('pdf_label_method')}: ${g.invite_method}`
        
        let details = ''
        if (g.note) details += `${t('pdf_label_note')}: ${g.note}\n`
        if (g.form_responses) {
            Object.entries(g.form_responses).forEach(([key, val]) => {
                details += `${key}: ${val}\n`
            })
        }
        if (!details) details = '-'

        return [index + 1, identity, contact, details]
    })

    autoTable(doc, {
        head: [['#', t('pdf_header_identity'), t('pdf_header_contact'), t('pdf_header_details')]],
        body: tableBody,
        startY: 35,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3, valign: 'middle' },
        headStyles: { fillColor: [79, 70, 229], textColor: 255 },
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 50 },
            2: { cellWidth: 60 },
            3: { cellWidth: 'auto' }
        },
    })

    doc.save(`Guests_${eventSlug}.pdf`)
  }

  const generateMessage = (guestName: string) => inviteTemplate.replace('[Ad]', guestName).replace('[Link]', eventLink)
  const sendWhatsapp = (phone: string, name: string) => window.open(`https://wa.me/${phone}?text=${encodeURIComponent(generateMessage(name))}`, '_blank')
  const sendEmail = (email: string, name: string) => window.open(`mailto:${email}?subject=${encodeURIComponent(`${t('email_subject')}: ${eventTitle}`)}&body=${encodeURIComponent(generateMessage(name))}`, '_blank')

  return (
    <div className="space-y-6 animate-fadeIn relative">
        
        {/* MODAL PENCERESİ */}
        {selectedGuest && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedGuest(null)}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                        <h3 className="font-bold">{t('modal_details_title')}</h3>
                        <button onClick={() => setSelectedGuest(null)} className="text-white hover:bg-indigo-700 w-8 h-8 rounded-full">✕</button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        <div className="flex items-center gap-3 border-b pb-4">
                            <div className="bg-indigo-100 text-indigo-700 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl">
                                {selectedGuest.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-800">{selectedGuest.name}</h4>
                                <p className="text-xs text-gray-500">{selectedGuest.email || selectedGuest.phone}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('modal_form_title')}</h5>
                            {selectedGuest.form_responses && Object.keys(selectedGuest.form_responses).length > 0 ? (
                                Object.entries(selectedGuest.form_responses).map(([key, value]: [string, any]) => (
                                    <div key={key} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <p className="text-xs font-bold text-indigo-600 mb-1">{key}</p>
                                        <p className="text-sm text-gray-800 font-medium">{value}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 italic">{t('modal_no_response')}</p>
                            )}
                        </div>
                        {selectedGuest.note && (
                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                <p className="text-xs font-bold text-yellow-700 mb-1">{t('col_note')}:</p>
                                <p className="text-sm text-gray-700 italic">"{selectedGuest.note}"</p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-gray-50 text-right">
                        <button onClick={() => setSelectedGuest(null)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-300">
                            {t('modal_close_btn')}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* 1. PANEL */}
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 grid md:grid-cols-2 gap-6">
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-indigo-900 text-sm uppercase">{t('guest_status')}</h3>
                    
                    {guests.length > 0 && (
                        <div className="flex gap-2">
                            <button onClick={downloadExcel} className="bg-green-600 text-white text-xs px-3 py-1 rounded shadow hover:bg-green-700 transition flex items-center gap-1 font-bold">
                                {t('export_btn')}
                            </button>
                            <button onClick={downloadPdf} className="bg-red-600 text-white text-xs px-3 py-1 rounded shadow hover:bg-red-700 transition flex items-center gap-1 font-bold">
                                {t('export_pdf_btn')}
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex gap-4">
                    <div className="bg-white p-3 rounded shadow-sm flex-1 text-center"><div className="text-2xl font-bold text-gray-800">{stats.total}</div><div className="text-xs text-gray-500">{t('total')}</div></div>
                    <div className="bg-white p-3 rounded shadow-sm flex-1 text-center"><div className="text-2xl font-bold text-green-600">{stats.phone}</div><div className="text-xs text-gray-500">📱</div></div>
                    <div className="bg-white p-3 rounded shadow-sm flex-1 text-center"><div className="text-2xl font-bold text-blue-600">{stats.email}</div><div className="text-xs text-gray-500">📧</div></div>
                </div>
            </div>
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-indigo-900 text-sm uppercase">{t('invite_message')}</h3>
                    <button onClick={() => isEditingTemplate ? saveTemplate() : setIsEditingTemplate(true)} className="text-xs font-bold text-indigo-600 hover:underline">{isEditingTemplate ? '💾 ' + t('save_template') : '✏️ ' + t('edit_template')}</button>
                </div>
                {isEditingTemplate ? <textarea value={inviteTemplate} onChange={e => setInviteTemplate(e.target.value)} className="w-full h-20 text-xs p-2 border rounded resize-none"/> : <div className="bg-white p-2 rounded border text-xs text-gray-600 h-20 overflow-y-auto whitespace-pre-line italic">"{inviteTemplate}"</div>}
            </div>
        </div>

        {/* 2. GİRİŞ */}
        <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-indigo-100">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">{t('add_guest_title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                <div className="md:col-span-3"><label className="text-[10px] font-bold text-gray-400 block mb-1">{t('name_label')}</label><input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full border p-2 rounded text-sm bg-gray-50" placeholder={t('form.placeholder_name')}/></div>
                <div className="md:col-span-2"><label className="text-[10px] font-bold text-gray-400 block mb-1">{t('method_label')}</label><select value={newMethod} onChange={e => setNewMethod(e.target.value)} className="w-full border p-2 rounded text-sm bg-gray-50 font-bold text-gray-700"><option value="whatsapp">{t('method_whatsapp')}</option><option value="sms">{t('method_sms')}</option><option value="email">{t('method_email')}</option></select></div>
                <div className="md:col-span-3"><label className={`text-[10px] font-bold block mb-1 ${newMethod === 'email' ? 'text-gray-300' : 'text-gray-600'}`}>{t('phone_label')}</label><div className={newMethod === 'email' ? 'opacity-50 pointer-events-none' : ''}><PhoneInput country={defaultCountry} value={newPhone} onChange={phone => setNewPhone(phone)} inputStyle={{width:'100%', height:'38px', fontSize:'14px', borderColor:'#e5e7eb', borderRadius:'0.375rem', backgroundColor: newMethod === 'email' ? '#f3f4f6' : 'white'}} buttonStyle={{borderColor:'#e5e7eb'}} disabled={newMethod === 'email'} placeholder={t('form.placeholder_phone')}/></div></div>
                <div className="md:col-span-3"><label className={`text-[10px] font-bold block mb-1 ${newMethod !== 'email' ? 'text-gray-300' : 'text-gray-600'}`}>{t('email_label')}</label><input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} disabled={newMethod !== 'email'} className={`w-full border p-2 rounded text-sm h-[38px] ${newMethod !== 'email' ? 'bg-gray-100 text-gray-300' : 'bg-white'}`} placeholder={t('form.placeholder_email')}/></div>
                <div className="md:col-span-1"><button onClick={addGuest} disabled={loading} className="w-full bg-indigo-600 text-white h-[38px] rounded font-bold hover:bg-indigo-700 transition flex items-center justify-center">{loading ? t('btn.loading') : t('btn.add_symbol')}</button></div>
            </div>
        </div>

        {/* 3. LİSTE */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3">{t('col_name')}</th>
                        <th className="px-4 py-3">{t('col_contact')}</th>
                        <th className="px-4 py-3">{t('col_status')}</th>
                        <th className="px-4 py-3 text-center">{t('col_count')}</th>
                        <th className="px-4 py-3 text-center">{t('col_invite')}</th>
                        <th className="px-4 py-3 text-right">{t('col_action')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {guests.map(g => (
                        <tr key={g.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelectedGuest(g)}>
                            <td className="px-4 py-3 font-bold text-gray-800 flex items-center gap-2">
                                {g.name}
                                {g.form_responses && Object.keys(g.form_responses).length > 0 && (
                                    <span className="text-[10px] bg-blue-100 text-blue-600 px-1 rounded" title={t('list.tooltip_details')}>👁️</span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                                {g.phone && <div className="flex items-center gap-1">📱 +{g.phone}</div>}
                                {g.email && <div className="flex items-center gap-1">📧 {g.email}</div>}
                            </td>
                            <td className="px-4 py-3">
                                {g.status === 'katiliyor' ? <span className="bg-green-100 text-green-800 text-[10px] px-2 py-1 rounded font-bold uppercase">✔ {t('rsvp_option_yes')}</span> :
                                 g.status === 'katilmiyor' ? <span className="bg-red-100 text-red-800 text-[10px] px-2 py-1 rounded font-bold uppercase">✖ {t('rsvp_option_no')}</span> :
                                 <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-1 rounded font-bold uppercase">{t('status_waiting_badge')} {t('status_waiting_label')}</span>}
                            </td>
                            <td className="px-4 py-3 font-bold text-center text-gray-600">{g.plus_one > 0 ? `+${g.plus_one}` : '-'}</td>
                            
                            <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                                {g.invite_method === 'whatsapp' && <button onClick={() => sendWhatsapp(g.phone, g.name)} className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-green-600 shadow-sm">{t('btn_send_whatsapp')} ↗</button>}
                                {g.invite_method === 'sms' && <a href={`sms:+${g.phone}?body=${encodeURIComponent(generateMessage(g.name))}`} className="bg-gray-700 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm inline-block">{t('btn_send_sms')} ↗</a>}
                                {g.invite_method === 'email' && <button onClick={() => sendEmail(g.email, g.name)} className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-blue-600 shadow-sm">{t('btn_send_email')} ↗</button>}
                            </td>
                            <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                                <button onClick={() => deleteGuest(g.id)} className="text-red-400 hover:text-red-600 font-bold">&times;</button>
                            </td>
                        </tr>
                    ))}
                    {guests.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400 italic">{t('list_empty')}</td></tr>}
                </tbody>
            </table>
        </div>
    </div>
  )
}