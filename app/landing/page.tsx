'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import { FaQrcode, FaPalette, FaHeart, FaShieldAlt } from 'react-icons/fa' 
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'

interface Feature {
    icon: any; 
    title: string;
    desc: string;
}

export default function LandingPage() {
    const router = useRouter()
    
    // LOGIN STATE'LERİ
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [loginLoading, setLoginLoading] = useState(false)

    // ADMIN GİRİŞ İŞLEMİ (Dashboard'dan taşındı)
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoginLoading(true)

        // 1. Giriş Yapmayı Dene
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password: loginPassword,
        })

        if (!signInError) { 
            alert('Giriş Başarılı!'); 
            router.push('/') // Ana sayfaya yönlendir (Dashboard'a düşecek)
            return
        }

        // 2. Giriş Hata Verdiyse Kayıt Olmayı Dene
        console.log("Giriş başarısız, kayıt deneniyor...")
        const { error: signUpError } = await supabase.auth.signUp({ email: loginEmail, password: loginPassword })
        
        if (signUpError) {
            alert('Hata: Kullanıcı adı veya şifre yanlış.') 
        } else {
            alert('Yeni hesap oluşturuldu ve giriş yapıldı!')
            router.push('/') // Ana sayfaya yönlendir
        }
        setLoginLoading(false)
    }

    const features: Feature[] = [
        { icon: FaPalette, title: "Canlı Tasarım Stüdyosu", desc: "Font, renk ve görselleri telefon maketinde anında düzenleyin." },
        { icon: FaHeart, title: "Etkileşimli Sosyal Galeri", desc: "Misafirleriniz fotoğraf yüklesin, beğensin ve yorum yapsın." },
        { icon: FaQrcode, title: "Tek Tıkla QR Kod", desc: "Üretilen karekodu davetiyeye veya mekana anında basın." },
        { icon: FaShieldAlt, title: "Yasal & Güvenli Altyapı", desc: "KVKK uyumlu giriş sistemi ve içerik moderasyon altyapısı." },
    ]

    return (
        <div className="min-h-screen bg-white font-sans text-gray-800">
            
            {/* ÜST BAŞLIK & CTA */}
            <div className="bg-indigo-700 text-white py-4 px-8 flex justify-between items-center sticky top-0 z-50">
                <h1 className="text-xl font-bold">Cereget</h1>
                <div className='flex items-center gap-4'>
                    <a href="#fiyatlandirma" className="bg-white text-indigo-700 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition shadow-lg">
                        Hemen Satın Al
                    </a>
                    {/* YENİ: Admin Giriş Butonu */}
                    <button onClick={() => setShowLoginModal(true)} className='text-white border border-white px-4 py-2 rounded-full text-sm font-bold hover:bg-white hover:text-indigo-700 transition'>
                        Admin
                    </button>
                </div>
            </div>

            {/* BÖLÜM 1: HERO */}
            <header className="py-20 px-8 bg-indigo-600 text-white">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
                    <div className="lg:w-1/2 text-center lg:text-left">
                        <p className="text-sm font-semibold uppercase tracking-widest opacity-80 mb-3">Master Planın En İyi Özelliği</p>
                        <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
                            Davetiyeyi, Canlı Bir Sosyal Ağ'a Çevirin.
                        </h2>
                        <p className="text-xl opacity-90 mb-8">
                            Tek kullanımlık kağıtlara veda edin. Misafirleriniz için QR kodlu, canlı fotoğraf galerili, etkileşimli bir deneyim yaratın.
                        </p>
                        <a href="#fiyatlandirma" className="bg-yellow-400 text-indigo-900 px-8 py-3 rounded-xl font-bold text-lg hover:bg-yellow-300 shadow-xl transition transform hover:scale-105">
                            Paketleri İncele →
                        </a>
                    </div>
                    <div className="lg:w-1/2 mt-10 lg:mt-0 relative">
                        <div className="w-full h-96 bg-indigo-500 rounded-xl shadow-2xl flex items-center justify-center text-white text-3xl font-bold opacity-60">
                            (Ekran Görüntüsü Gelecek)
                        </div>
                    </div>
                </div>
            </header>

            {/* BÖLÜM 2 & 3 (ÖZELLİKLER & FİYATLANDIRMA) AYNI KALIYOR */}
            {/* ... (Özellikler ve Fiyatlandırma Kartları kodları burada devam edecek) ... */}
            
            <section className="py-20 px-8 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <h3 className="text-3xl font-bold text-center mb-12">Neden Cereget?</h3>
                    <div className="grid md:grid-cols-4 gap-8">
                        {features.map((feature, index) => {
                             const IconComponent = feature.icon;
                             return (
                                <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 text-center transition hover:shadow-xl">
                                    <IconComponent className="text-indigo-600 w-10 h-10 mx-auto mb-4" /> 
                                    <h4 className="text-lg font-bold mb-2">{feature.title}</h4>
                                    <p className="text-sm text-gray-600">{feature.desc}</p>
                                </div>
                             )
                        })}
                    </div>
                </div>
            </section>

            <section id="fiyatlandirma" className="py-20 px-8 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h3 className="text-3xl font-bold mb-4">Hazır mısın?</h3>
                    <p className="text-lg text-gray-600 mb-10">
                        Hayalindeki davetiyeyi oluşturmak için ihtiyacın olan kredi paketini seç.
                    </p>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Başlangıç Paketi */}
                        <div className="p-8 border-4 border-gray-200 rounded-xl hover:border-indigo-500 transition shadow-lg">
                            <h4 className="text-2xl font-bold mb-2">Başlangıç</h4>
                            <p className="text-4xl font-extrabold mb-4 text-indigo-600">10 Kredi</p>
                            <a href="ETSY_LINK_10_KREDI" className="block bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700">Etsy'den Satın Al</a>
                        </div>

                        {/* Premium Paket */}
                        <div className="p-8 border-4 border-yellow-500 rounded-xl bg-yellow-50 shadow-2xl transform scale-105 relative">
                             <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold">EN POPÜLER</div>
                            <h4 className="text-2xl font-bold mb-2">Sınırsız Erişim</h4>
                            <p className="text-4xl font-extrabold mb-4 text-yellow-600">SINIRSIZ</p>
                            <a href="ETSY_LINK_SINIRSIZ" className="block bg-yellow-500 text-indigo-900 py-3 rounded-lg font-bold hover:bg-yellow-400">Etsy'den Satın Al</a>
                        </div>
                        
                        {/* Tek Deneme Paketi */}
                         <div className="p-8 border-4 border-gray-200 rounded-xl hover:border-indigo-500 transition shadow-lg">
                            <h4 className="text-2xl font-bold mb-2">Deneme</h4>
                            <p className="text-4xl font-extrabold mb-4 text-indigo-600">1 Kredi</p>
                            <a href="ETSY_LINK_1_KREDI" className="block bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700">Etsy'den Satın Al</a>
                        </div>
                    </div>
                </div>
            </section>


            {/* FOOTER - Linki kaldırdık, butona yönlendiriyoruz */}
            <footer className="py-6 px-8 text-center border-t text-sm text-gray-500">
                <div className="flex justify-center space-x-6 mb-2">
                    <Link href="/legal/terms" className="hover:text-black">Kullanım Şartları</Link>
                    <Link href="/legal/privacy" className="hover:text-black">Gizlilik ve KVKK</Link>
                    {/* Admin linkini butona taşıdık */}
                    <button onClick={() => setShowLoginModal(true)} className="hover:text-black">Admin Girişi</button>
                </div>
                <p>© 2025 Cereget. Tüm hakları saklıdır.</p>
            </footer>


            {/* MODAL / AÇILIR GİRİŞ FORMU */}
            {showLoginModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm relative">
                        {/* Kapat Butonu */}
                        <button 
                            onClick={() => setShowLoginModal(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-black text-2xl"
                        >
                            &times;
                        </button>

                        <h2 className="text-2xl font-bold text-center mb-6 text-indigo-700">Admin Girişi</h2>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta</label>
                                <input 
                                    type="email" 
                                    required
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    placeholder="E-Posta"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                                <input 
                                    type="password" 
                                    required
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    placeholder="Şifre"
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={loginLoading}
                                className="w-full bg-indigo-600 text-white py-3 rounded font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                {loginLoading ? 'İşleniyor...' : 'Giriş Yap / Kayıt Ol'}
                            </button>
                        </form>
                        <p className="text-xs text-gray-400 text-center mt-4">Hesabınız yoksa otomatik oluşturulur.</p>
                    </div>
                </div>
            )}
        </div>
    )
}