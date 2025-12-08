'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { useTranslation } from '../i18n'
import * as XLSX from 'xlsx'

interface GuestManagerProps {
    eventId: string;
    eventSlug: string;
    eventTitle: string;
}

export default function GuestManager({ eventId, eventSlug, eventTitle }: GuestManagerProps) {
  const { t } = useTranslation()
  
  const [guests, setGuests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ total: 0, email: 0, phone: 0 })
  const [inviteTemplate, setInviteTemplate] = useState(`Merhaba [Ad], seni ${eventTitle} etkinliğimize bekliyoruz! 🥂\nDetaylar ve LCV için: [Link]`)
  const [isEditingTemplate, setIsEditingTemplate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newMethod, setNewMethod] = useState('whatsapp')
  const [defaultCountry, setDefaultCountry] = useState('tr')
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
      alert(t('save_template') + ' OK! ✅')
  }
  const addGuest = async () => {
      if (!newName) return alert('Name required')
      if (newMethod === 'email' && !newEmail) return alert('Email required')
      if ((newMethod === 'whatsapp' || newMethod === 'sms') && !newPhone) return alert('Phone required')
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
  
  const downloadExcel = () => {
      const dataToExport = guests.map(g => ({
          "Name": g.name,
          "Status": g.status,
          "+Guest": g.plus_one,
          "Method": g.invite_method,
          "Phone": g.phone,
          "Email": g.email,
          "Note": g.note,
          ...(g.form_responses || {}), 
          "Date": new Date(g.created_at).toLocaleDateString()
      }))
      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Guests")
      XLSX.writeFile(workbook, `Guests_${eventSlug}.xlsx`)
  }

  const generateMessage = (guestName: string) => inviteTemplate.replace('[Ad]', guestName).replace('[Link]', eventLink)
  const sendWhatsapp = (phone: string, name: string) => window.open(`https://wa.me/${phone}?text=${encodeURIComponent(generateMessage(name))}`, '_blank')
  const sendEmail = (email: string, name: string) => window.open(`mailto:${email}?subject=${encodeURIComponent(`Davet: ${eventTitle}`)}&body=${encodeURIComponent(generateMessage(name))}`, '_blank')

  return (
    <div className="space-y-6 animate-fadeIn">
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 grid md:grid-cols-2 gap-6">
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-indigo-900 text-sm uppercase">{t('guest_status')}</h3>
                    {guests.length > 0 && (
                        <button onClick={downloadExcel} className="bg-green-600 text-white text-xs px-3 py-1 rounded shadow hover:bg-green-700 transition flex items-center gap-1 font-bold">
                            {t('export_btn')}
                        </button>
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
                <p className="text-[10px] text-gray-400 mt-1">* [Ad] / [Link] auto.</p>
            </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-indigo-100">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">{t('add_guest_title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                <div className="md:col-span-3"><label className="text-[10px] font-bold text-gray-400 block mb-1">{t('name_label')}</label><input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full border p-2 rounded text-sm bg-gray-50" placeholder="..."/></div>
                <div className="md:col-span-2"><label className="text-[10px] font-bold text-gray-400 block mb-1">{t('method_label')}</label><select value={newMethod} onChange={e => setNewMethod(e.target.value)} className="w-full border p-2 rounded text-sm bg-gray-50 font-bold text-gray-700"><option value="whatsapp">📱 WhatsApp</option><option value="sms">💬 SMS</option><option value="email">📧 Email</option></select></div>
                <div className="md:col-span-3"><label className={`text-[10px] font-bold block mb-1 ${newMethod === 'email' ? 'text-gray-300' : 'text-gray-600'}`}>{t('phone_label')}</label><div className={newMethod === 'email' ? 'opacity-50 pointer-events-none' : ''}><PhoneInput country={defaultCountry} value={newPhone} onChange={phone => setNewPhone(phone)} inputStyle={{width:'100%', height:'38px', fontSize:'14px', borderColor:'#e5e7eb', borderRadius:'0.375rem', backgroundColor: newMethod === 'email' ? '#f3f4f6' : 'white'}} buttonStyle={{borderColor:'#e5e7eb'}} disabled={newMethod === 'email'} placeholder="555..."/></div></div>
                <div className="md:col-span-3"><label className={`text-[10px] font-bold block mb-1 ${newMethod !== 'email' ? 'text-gray-300' : 'text-gray-600'}`}>{t('email_label')}</label><input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} disabled={newMethod !== 'email'} className={`w-full border p-2 rounded text-sm h-[38px] ${newMethod !== 'email' ? 'bg-gray-100 text-gray-300' : 'bg-white'}`} placeholder="@"/></div>
                <div className="md:col-span-1"><button onClick={addGuest} disabled={loading} className="w-full bg-indigo-600 text-white h-[38px] rounded font-bold hover:bg-indigo-700 transition flex items-center justify-center">{loading ? '...' : '+'}</button></div>
            </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3">{t('col_name')}</th>
                        <th className="px-4 py-3">{t('col_contact')}</th>
                        <th className="px-4 py-3">{t('col_status')}</th>
                        <th className="px-4 py-3">{t('col_count')}</th>
                        <th className="px-4 py-3">{t('col_note')}</th>
                        <th className="px-4 py-3 text-center">{t('col_invite')}</th>
                        <th className="px-4 py-3 text-right">{t('col_action')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {guests.map(g => (
                        <tr key={g.id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3 font-bold text-gray-800">{g.name}</td>
                            <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                                {g.phone && <div className="flex items-center gap-1">📱 +{g.phone}</div>}
                                {g.email && <div className="flex items-center gap-1">📧 {g.email}</div>}
                            </td>
                            {/* DURUM ROZETLERİ */}
                            <td className="px-4 py-3">
                                {g.status === 'katiliyor' ? <span className="bg-green-100 text-green-800 text-[10px] px-2 py-1 rounded font-bold uppercase">✔ {t('rsvp_option_yes')}</span> :
                                 g.status === 'katilmiyor' ? <span className="bg-red-100 text-red-800 text-[10px] px-2 py-1 rounded font-bold uppercase">✖ {t('rsvp_option_no')}</span> :
                                 <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-1 rounded font-bold uppercase">⏳ Bekleniyor</span>}
                            </td>
                            <td className="px-4 py-3 font-bold text-center text-gray-600">{g.plus_one > 0 ? `+${g.plus_one}` : '-'}</td>
                            <td className="px-4 py-3 text-xs text-gray-500 italic max-w-[150px] truncate" title={g.note}>{g.note || '-'}</td>
                            
                            <td className="px-4 py-3 text-center">
                                {g.invite_method === 'whatsapp' && (
                                    <button onClick={() => sendWhatsapp(g.phone, g.name)} className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-green-600 shadow-sm transition transform active:scale-95">
                                        WhatsApp ↗
                                    </button>
                                )}
                                {g.invite_method === 'sms' && (
                                    <a href={`sms:+${g.phone}?body=${encodeURIComponent(generateMessage(g.name))}`} className="bg-gray-700 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-black shadow-sm inline-block">
                                        SMS ↗
                                    </a>
                                )}
                                {g.invite_method === 'email' && (
                                    <button onClick={() => sendEmail(g.email, g.name)} className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-blue-600 shadow-sm transition transform active:scale-95">
                                        Mail ↗
                                    </button>
                                )}
                            </td>
                            <td className="px-4 py-3 text-right">
                                <button onClick={() => deleteGuest(g.id)} className="text-red-400 hover:text-red-600 font-bold">&times;</button>
                            </td>
                        </tr>
                    ))}
                    {guests.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-400 italic">{t('list_empty')}</td></tr>}
                </tbody>
            </table>
        </div>
    </div>
  )
}