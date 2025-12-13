'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Tab = 'overview' | 'users' | 'events' | 'packages' | 'transactions'

export default function AdminPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalSales: 0,
    totalCredits: 0,
    activeEvents: 0,
    recentEvents: 0,
    totalRevenue: 0
  })
  
  // Users
  const [users, setUsers] = useState<any[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [creditAmount, setCreditAmount] = useState('')
  
  // Events
  const [events, setEvents] = useState<any[]>([])
  const [eventSearch, setEventSearch] = useState('')
  
  // Packages
  const [packages, setPackages] = useState<any[]>([])
  const [listingId, setListingId] = useState('')
  const [etsyLink, setEtsyLink] = useState('')
  const [packageName, setPackageName] = useState('')
  const [credits, setCredits] = useState('')
  const [price, setPrice] = useState('')
  
  // Transactions
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        checkAdmin(session.user.email)
      } else {
        setLoading(false)
      }
    })
  }, [])

  const checkAdmin = async (email: string | undefined) => {
    if (email !== 'onur.kaynar38@gmail.com' && email !== 'onur.kaynar@hotmail.com') {
       alert('Yetkisiz Giriş!')
       window.location.href = '/'
    } else {
       await fetchAllData()
       setLoading(false)
    }
  }

  const fetchAllData = async () => {
    await Promise.all([
      fetchStats(),
      fetchUsers(),
      fetchEvents(),
      fetchPackages(),
      fetchTransactions()
    ])
  }

  const fetchStats = async () => {
    // Total Users
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    // Total Events
    const { count: eventCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
    
    // Active Events (future dates)
    const { count: activeCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('event_date', new Date().toISOString())
    
    // Recent Events (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const { count: recentCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())
    
    // Sales and Credits from packages
    const { data: packs } = await supabase
      .from('credit_packages')
      .select('sales_count, credits_amount, price')
    
    let totalSales = 0
    let totalCreditsDistributed = 0
    let totalRevenue = 0
    
    if (packs) {
      packs.forEach(p => {
        const sales = p.sales_count || 0
        totalSales += sales
        totalCreditsDistributed += sales * p.credits_amount
        totalRevenue += sales * (p.price || 0)
      })
    }

    setStats({
      totalUsers: userCount || 0,
      totalEvents: eventCount || 0,
      totalSales,
      totalCredits: totalCreditsDistributed,
      activeEvents: activeCount || 0,
      recentEvents: recentCount || 0,
      totalRevenue
    })
  }

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        events:events(count)
      `)
      .order('created_at', { ascending: false })
    
    if (data) {
      // Get user emails from auth.users
      const userIds = data.map(p => p.id)
      const { data: authUsers } = await supabase.auth.admin.listUsers()
      
      const enrichedUsers = data.map(profile => {
        const authUser = authUsers?.users.find(u => u.id === profile.id)
        return {
          ...profile,
          email: authUser?.email || 'N/A',
          event_count: profile.events?.[0]?.count || 0
        }
      })
      
      setUsers(enrichedUsers)
    }
  }

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select(`
        *,
        profiles:user_id(id),
        guests:guests(count)
      `)
      .order('created_at', { ascending: false })
      .limit(100)
    
    if (data) {
      const enrichedEvents = data.map(event => ({
        ...event,
        guest_count: event.guests?.[0]?.count || 0
      }))
      setEvents(enrichedEvents)
    }
  }

  const fetchPackages = async () => {
    const { data } = await supabase
      .from('credit_packages')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setPackages(data)
  }

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from('credit_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    
    if (data) setTransactions(data)
  }

  const handleAddCredits = async () => {
    if (!selectedUser || !creditAmount) {
      alert('Lütfen kullanıcı seçin ve miktar girin!')
      return
    }

    const amount = parseInt(creditAmount)
    const newBalance = (selectedUser.credits || 0) + amount

    const { error } = await supabase
      .from('profiles')
      .update({ credits: newBalance })
      .eq('id', selectedUser.id)

    if (error) {
      alert('Hata: ' + error.message)
    } else {
      // Log transaction
      await supabase.from('credit_transactions').insert([{
        user_id: selectedUser.id,
        email: selectedUser.email,
        credits_amount: amount,
        transaction_type: 'manual',
        source: 'admin',
        metadata: { admin_action: true, old_balance: selectedUser.credits, new_balance: newBalance }
      }])

      alert(`${amount} kredi başarıyla eklendi!`)
      setCreditAmount('')
      setSelectedUser(null)
      fetchUsers()
      fetchStats()
    }
  }

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!confirm(`"${eventTitle}" etkinliğini silmek istediğinize emin misiniz?`)) return

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) {
      alert('Hata: ' + error.message)
    } else {
      alert('Etkinlik silindi!')
      fetchEvents()
      fetchStats()
    }
  }

  const handleCreatePackage = async () => {
    if (!listingId || !packageName || !credits || !price) {
      alert('Lütfen tüm alanları doldurun!')
      return
    }

    const { error } = await supabase.from('credit_packages').insert([{
      etsy_listing_id: listingId,
      etsy_link: etsyLink || null,
      package_name: packageName,
      credits_amount: parseInt(credits),
      price: parseFloat(price),
      sales_count: 0
    }])

    if (error) {
      alert('Hata: ' + error.message)
    } else {
      alert('Paket başarıyla oluşturuldu!')
      setListingId('')
      setEtsyLink('')
      setPackageName('')
      setCredits('')
      setPrice('')
      fetchPackages()
      fetchStats()
    }
  }

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Bu paketi silmek istediğinize emin misiniz?')) return
    await supabase.from('credit_packages').delete().eq('id', id)
    fetchPackages()
    fetchStats()
  }

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  )

  const filteredEvents = events.filter(e => 
    e.title?.toLowerCase().includes(eventSearch.toLowerCase()) ||
    e.slug?.toLowerCase().includes(eventSearch.toLowerCase())
  )

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Lütfen Giriş Yapın</h2>
          <Link href="/">
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold">
              Ana Sayfaya Dön
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Sistem Yönetim Paneli</p>
            </div>
            <Link href="/">
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                Ana Sayfa
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* TABS */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Genel Bakış', icon: '📊' },
            { id: 'users', label: 'Kullanıcılar', icon: '👥' },
            { id: 'events', label: 'Etkinlikler', icon: '📅' },
            { id: 'packages', label: 'Paketler', icon: '📦' },
            { id: 'transactions', label: 'İşlemler', icon: '💳' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-6 py-3 rounded-lg font-semibold text-sm transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-600 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">Toplam Kullanıcı</h3>
                  <span className="text-2xl">👥</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">Toplam Etkinlik</h3>
                  <span className="text-2xl">📅</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
                <p className="text-xs text-gray-500 mt-1">Aktif: {stats.activeEvents}</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">Toplam Satış</h3>
                  <span className="text-2xl">💰</span>
                </div>
                <p className="text-3xl font-bold text-green-600">{stats.totalSales}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.totalCredits} kredi</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">Toplam Gelir</h3>
                  <span className="text-2xl">💵</span>
                </div>
                <p className="text-3xl font-bold text-indigo-600">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-4">Son 30 Gün</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-600 font-semibold">Yeni Etkinlik</p>
                  <p className="text-2xl font-bold text-indigo-900">{stats.recentEvents}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-semibold">Yeni Satış</p>
                  <p className="text-2xl font-bold text-green-900">{stats.totalSales}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* USER LIST */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <input
                  type="text"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Email ile ara..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kredi</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Etkinlik</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kayıt</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                        <td className="px-4 py-3 text-sm font-bold text-green-600">{user.credits || 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.event_count || 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                          >
                            Kredi Ekle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ADD CREDITS PANEL */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit">
              <h3 className="text-lg font-bold mb-4">Kredi Ekle</h3>
              {selectedUser ? (
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Seçili Kullanıcı</p>
                    <p className="text-sm font-bold text-gray-900">{selectedUser.email}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Mevcut Kredi: <span className="font-bold text-green-600">{selectedUser.credits || 0}</span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Eklenecek Kredi</label>
                    <input
                      type="number"
                      value={creditAmount}
                      onChange={e => setCreditAmount(e.target.value)}
                      placeholder="Örn: 10"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddCredits}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700"
                    >
                      Onayla
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(null)
                        setCreditAmount('')
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  Kredi eklemek için bir kullanıcı seçin
                </p>
              )}
            </div>
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                value={eventSearch}
                onChange={e => setEventSearch(e.target.value)}
                placeholder="Etkinlik ara (başlık veya slug)..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Başlık</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Slug</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Misafir</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tarih</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEvents.map(event => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{event.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <a
                          href={`/${event.slug}`}
                          target="_blank"
                          className="text-indigo-600 hover:underline"
                        >
                          /{event.slug}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{event.guest_count || 0}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {event.event_date ? new Date(event.event_date).toLocaleDateString('tr-TR') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteEvent(event.id, event.title)}
                          className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PACKAGES TAB */}
        {activeTab === 'packages' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CREATE PACKAGE */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 h-fit">
              <h2 className="text-lg font-bold mb-4">Yeni Paket Oluştur</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Etsy Listing ID</label>
                  <input
                    type="text"
                    value={listingId}
                    onChange={e => setListingId(e.target.value)}
                    placeholder="Örn: 1234567890"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Etsy Link (Opsiyonel)</label>
                  <input
                    type="text"
                    value={etsyLink}
                    onChange={e => setEtsyLink(e.target.value)}
                    placeholder="https://www.etsy.com/listing/..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Paket Adı</label>
                  <input
                    type="text"
                    value={packageName}
                    onChange={e => setPackageName(e.target.value)}
                    placeholder="Örn: Starter Pack"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Kredi Miktarı</label>
                  <input
                    type="number"
                    value={credits}
                    onChange={e => setCredits(e.target.value)}
                    placeholder="Örn: 10"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Fiyat ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="Örn: 9.99"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                  />
                </div>
                <button
                  onClick={handleCreatePackage}
                  className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700"
                >
                  Paketi Kaydet
                </button>
              </div>
            </div>

            {/* PACKAGE LIST */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Mevcut Paketler</h3>
                <button
                  onClick={fetchPackages}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Yenile
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {packages.map(pkg => (
                  <div key={pkg.id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-900">{pkg.package_name}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {pkg.credits_amount} Kredi • ${pkg.price}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Satış: {pkg.sales_count || 0}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100 text-sm"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">İşlem Geçmişi (Son 100)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Miktar</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tip</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kaynak</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tarih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{tx.email}</td>
                      <td className={`px-4 py-3 text-sm font-bold ${
                        tx.credits_amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.credits_amount > 0 ? '+' : ''}{tx.credits_amount}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{tx.transaction_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{tx.source || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(tx.created_at).toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}