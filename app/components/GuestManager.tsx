'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

interface GuestManagerProps {
    eventId: string;
    eventSlug: string;
    eventTitle: string;
}

export default function GuestManager({ eventId, eventSlug, eventTitle }: GuestManagerProps) {
  const [guests, setGuests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // İSTATİSTİKLER
  const [stats, setStats] = useState({ total: 0, email: 0, phone: 0 })

  // MESAJ ŞABLONU
  const [inviteTemplate, setInviteTemplate] = useState(`Merhaba [Ad], seni ${eventTitle} etkinliğimize bekliyoruz! 🥂\nDetaylar ve LCV için: [Link]`)
  const [isEditingTemplate, setIsEditingTemplate] = useState(false)

  // YENİ GİRİŞ STATE'LERİ
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newMethod, setNewMethod] = useState('whatsapp') // Varsayılan

  // Link (Mesajda kullanılacak)
  const eventLink = typeof window !== 'undefined' ? `${window.location.origin}/${eventSlug}` : `/${eventSlug}`

  useEffect(() => {
    fetchGuests()
    fetchTemplate()
  }, [eventId])

  const fetchGuests = async () => {
      const { data } = await supabase.from('guests').select('*').eq('event_id', eventId).order('created_at', { ascending: false })
      if (data) {
          setGuests(data)
          calculateStats(data)
      }
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
      alert('Davet şablonu kaydedildi! ✅')
  }

  const addGuest = async () => {
      if (!newName) return alert('İsim zorunludur.')
      
      // ZORUNLULUK KONTROLLERİ
      if (newMethod === 'email' && !newEmail) return alert('E-Posta ile davet için mail adresi zorunludur.')
      if ((newMethod === 'whatsapp' || newMethod === 'sms') && !newPhone) return alert('Telefon ile davet için numara zorunludur.')

      setLoading(true)
      const { error } = await supabase.from('guests').insert([{
          event_id: eventId,
          name: newName,
          email: newEmail, // Boş olabilir
          phone: newPhone, // Boş olabilir
          invite_method: newMethod,
          status: 'bekleniyor'
      }])

      if (error) alert(error.message)
      else {
          setNewName(''); setNewEmail(''); setNewPhone(''); // Formu temizle
          fetchGuests()
      }
      setLoading(false)
  }

  const deleteGuest = async (id: string) => {
      if(!confirm('Silinsin mi?')) return
      await supabase.from('guests').delete().eq('id', id)
      fetchGuests()
  }

  // --- GÖNDERİM FONKSİYONLARI ---
  const generateMessage = (guestName: string) => {
      return inviteTemplate.replace('[Ad]', guestName).replace('[Link]', eventLink)
  }

  const sendWhatsapp = (phone: string, name: string) => {
      const msg = encodeURIComponent(generateMessage(name))
      window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank')
  }

  const sendEmail = (email: string, name: string) => {
      const subject = encodeURIComponent(`Davet: ${eventTitle}`)
      const body = encodeURIComponent(generateMessage(name))
      window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank')
  }

  return (
    <div className="space-y-6 animate-fadeIn">
        
        {/* 1. İSTATİSTİK & MESAJ PANELİ */}
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 grid md:grid-cols-2 gap-6">
            
            {/* Sol: İstatistikler */}
            <div>
                <h3 className="font-bold text-indigo-900 text-sm uppercase mb-3">Davetli Durumu</h3>
                <div className="flex gap-4">
                    <div className="bg-white p-3 rounded shadow-sm flex-1 text-center">
                        <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                        <div className="text-xs text-gray-500">Toplam</div>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm flex-1 text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.phone}</div>
                        <div className="text-xs text-gray-500">📱 Telefon</div>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm flex-1 text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.email}</div>
                        <div className="text-xs text-gray-500">📧 E-Mail</div>
                    </div>
                </div>
            </div>

            {/* Sağ: Mesaj Şablonu */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-indigo-900 text-sm uppercase">Davet Mesajı</h3>
                    <button onClick={() => isEditingTemplate ? saveTemplate() : setIsEditingTemplate(true)} className="text-xs font-bold text-indigo-600 hover:underline">
                        {isEditingTemplate ? '💾 Kaydet' : '✏️ Düzenle'}
                    </button>
                </div>
                {isEditingTemplate ? (
                    <textarea value={inviteTemplate} onChange={e => setInviteTemplate(e.target.value)} className="w-full h-20 text-xs p-2 border rounded resize-none"/>
                ) : (
                    <div className="bg-white p-2 rounded border text-xs text-gray-600 h-20 overflow-y-auto whitespace-pre-line italic">
                        "{inviteTemplate}"
                    </div>
                )}
                <p className="text-[10px] text-gray-400 mt-1">* [Ad] ve [Link] otomatik değişecektir.</p>
            </div>
        </div>

        {/* 2. EXCEL TARZI GİRİŞ SATIRI */}
        <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-indigo-100">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">Yeni Davetli Ekle</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                
                {/* İsim */}
                <div className="md:col-span-3">
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">AD SOYAD</label>
                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full border p-2 rounded text-sm bg-gray-50" placeholder="İsim Giriniz"/>
                </div>

                {/* Yöntem Seçimi */}
                <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">YÖNTEM</label>
                    <select value={newMethod} onChange={e => setNewMethod(e.target.value)} className="w-full border p-2 rounded text-sm bg-gray-50 font-bold text-gray-700">
                        <option value="whatsapp">📱 WhatsApp</option>
                        <option value="sms">💬 SMS</option>
                        <option value="email">📧 E-Posta</option>
                    </select>
                </div>

                {/* Telefon (Koşullu) */}
                <div className="md:col-span-3">
                    <label className={`text-[10px] font-bold block mb-1 ${newMethod === 'email' ? 'text-gray-300' : 'text-gray-600'}`}>TELEFON</label>
                    <input 
                        type="text" 
                        value={newPhone} 
                        onChange={e => setNewPhone(e.target.value)} 
                        disabled={newMethod === 'email'}
                        className={`w-full border p-2 rounded text-sm ${newMethod === 'email' ? 'bg-gray-100 text-gray-300' : 'bg-white'}`}
                        placeholder="5XX..."
                    />
                </div>

                {/* Email (Koşullu) */}
                <div className="md:col-span-3">
                    <label className={`text-[10px] font-bold block mb-1 ${newMethod !== 'email' ? 'text-gray-300' : 'text-gray-600'}`}>E-POSTA</label>
                    <input 
                        type="email" 
                        value={newEmail} 
                        onChange={e => setNewEmail(e.target.value)} 
                        disabled={newMethod !== 'email'}
                        className={`w-full border p-2 rounded text-sm ${newMethod !== 'email' ? 'bg-gray-100 text-gray-300' : 'bg-white'}`}
                        placeholder="@"
                    />
                </div>

                {/* Ekle Butonu */}
                <div className="md:col-span-1">
                    <button onClick={addGuest} disabled={loading} className="w-full bg-indigo-600 text-white h-[38px] rounded font-bold hover:bg-indigo-700 transition flex items-center justify-center">
                        {loading ? '...' : '+'}
                    </button>
                </div>
            </div>
        </div>

        {/* 3. DAVETLİ LİSTESİ VE GÖNDERİM */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3">İsim</th>
                        <th className="px-4 py-3">İletişim</th>
                        <th className="px-4 py-3">Tercih</th>
                        <th className="px-4 py-3 text-center">Davet Et</th>
                        <th className="px-4 py-3 text-right">İşlem</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {guests.map(g => (
                        <tr key={g.id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3 font-bold text-gray-800">{g.name}</td>
                            <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                                {g.phone && <div className="flex items-center gap-1">📱 {g.phone}</div>}
                                {g.email && <div className="flex items-center gap-1">📧 {g.email}</div>}
                            </td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${
                                    g.invite_method === 'whatsapp' ? 'bg-green-50 text-green-700 border-green-200' :
                                    g.invite_method === 'email' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    'bg-gray-50 text-gray-600'
                                }`}>
                                    {g.invite_method}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                                {/* WhatsApp Butonu */}
                                {g.invite_method === 'whatsapp' && (
                                    <button onClick={() => sendWhatsapp(g.phone, g.name)} className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-green-600 shadow-sm transition transform active:scale-95">
                                        WhatsApp Gönder ↗
                                    </button>
                                )}
                                {/* SMS Butonu */}
                                {g.invite_method === 'sms' && (
                                    <a href={`sms:${g.phone}?body=${encodeURIComponent(generateMessage(g.name))}`} className="bg-gray-700 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-black shadow-sm inline-block">
                                        SMS Gönder ↗
                                    </a>
                                )}
                                {/* Email Butonu */}
                                {g.invite_method === 'email' && (
                                    <button onClick={() => sendEmail(g.email, g.name)} className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-blue-600 shadow-sm transition transform active:scale-95">
                                        Mail Gönder ↗
                                    </button>
                                )}
                            </td>
                            <td className="px-4 py-3 text-right">
                                <button onClick={() => deleteGuest(g.id)} className="text-red-400 hover:text-red-600 font-bold">&times;</button>
                            </td>
                        </tr>
                    ))}
                    {guests.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center py-8 text-gray-400 italic">Listeniz boş. Yukarıdan eklemeye başlayın.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  )
}