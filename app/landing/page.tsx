'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import { FaQrcode, FaPalette, FaHeart, FaShieldAlt } from 'react-icons/fa' 
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useTranslation, LangType } from '../i18n'

interface Feature {
    icon: any;
    titleKey: any;
    descKey: any;
}

export default function LandingPage() {
    const router = useRouter()
    const { t, language, setLanguage } = useTranslation()

    const [showLoginModal, setShowLoginModal] = useState(false)
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [loginLoading, setLoginLoading] = useState(false)

    // LOGO URL
    const logoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/brand/logo.png`

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoginLoading(true)
        
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
        if (!signInError) { 
            router.push('/')
            return
        }

        console.log("Giriş başarısız, kayıt deneniyor...")
        const { error: signUpError } = await supabase.auth.signUp({ 
            email: loginEmail, 
            password: loginPassword,
            options: {
                data: {
                    full_name: loginEmail.split('@')[0]
                }
            }
        })

        if (signUpError) {
            alert(t('auth.alert_error_prefix') + signUpError.message)
        } else { 
            alert(t('auth.alert_account_created'))
            router.push('/') 
        }
        setLoginLoading(false)
    }

    const features: Feature[] = [
        { icon: FaPalette, titleKey: "feature_1_title", descKey: "feature_1_desc" },
        { icon: FaHeart, titleKey: "feature_2_title", descKey: "feature_2_desc" },
        { icon: FaQrcode, titleKey: "feature_3_title", descKey: "feature_3_desc" },
        { icon: FaShieldAlt, titleKey: "feature_4_title", descKey: "feature_4_desc" },
    ]

    return (
        <div className="min-h-screen bg-white font-sans text-gray-800">
            
            {/* ÜST BAŞLIK */}
            <div className="bg-indigo-700 text-white py-4 px-8 flex justify-between items-center sticky top-0 z-50 shadow-md">
                
                {/* LOGO ALANI */}
                <div className="flex items-center gap-3">
                    <img 
                        src={logoUrl} 
                        alt="CreateAlist Logo" 
                        className="h-10 w-auto object-contain bg-white/20 rounded-lg p-1 backdrop-blur-sm"
                        onError={(e) => { e.currentTarget.style.display = 'none' }} 
                    />
                    <h1 className="text-xl font-bold tracking-tight">CreateAlist</h1>
                </div>
                
                <div className='flex items-center gap-3'>
                    <select 
                        value={language} 
                        onChange={(e) => setLanguage(e.target.value as LangType)}
                        className="bg-indigo-800 text-white text-xs border border-indigo-600 rounded p-1 uppercase cursor-pointer outline-none"
                    >
                        <option value="tr">TR</option>
                        <option value="en">EN</option>
                        <option value="de">DE</option>
                        <option value="fr">FR</option>
                        <option value="es">ES</option>
                        <option value="it">IT</option>
                        <option value="ru">RU</option>
                        <option value="ar">AR</option>
                    </select>

                    <a href="#fiyatlandirma" className="bg-white text-indigo-700 px-4 py-2 rounded-full font-bold hover:bg-gray-100 transition shadow text-sm">
                        {t('landing_buy')}
                    </a>
                    <button onClick={() => setShowLoginModal(true)} className='text-white border border-white px-4 py-2 rounded-full text-sm font-bold hover:bg-white hover:text-indigo-700 transition'>
                        {t('landing_login')}
                    </button>
                </div>
            </div>

            {/* HERO */}
            <header className="py-20 px-8 bg-indigo-600 text-white">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
                    <div className="lg:w-1/2 text-center lg:text-left">
                        <p className="text-sm font-semibold uppercase tracking-widest opacity-80 mb-3">{t('landing.hero_badge')}</p>
                        <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
                            {t('landing_hero_title')}
                        </h2>
                        <p className="text-xl opacity-90 mb-8">
                            {t('landing_hero_desc')}
                        </p>
                        <a href="#fiyatlandirma" className="bg-yellow-400 text-indigo-900 px-8 py-3 rounded-xl font-bold text-lg hover:bg-yellow-300 shadow-xl transition transform hover:scale-105">
                            {t('landing_cta_button')}
                        </a>
                    </div>
                    <div className="lg:w-1/2 mt-10 lg:mt-0 relative">
                        <div className="lg:w-1/2 mt-10 lg:mt-0 relative">
  
                           <img 
                           src="https://knjwmbwrgcojxcbmrbtm.supabase.co/storage/v1/object/public/brand/landing.png"
                           alt="Brand Screenshot"
                         className="w-full h-96 object-cover rounded-xl shadow-2xl"
                              />
                            </div>
                    </div>
                </div>
            </header>

            {/* ÖZELLİKLER */}
            <section className="py-20 px-8 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8">
                        {features.map((feature, index) => {
                             const IconComponent = feature.icon;
                             return (
                                <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 text-center transition hover:shadow-xl">
                                    <IconComponent className="text-indigo-600 w-10 h-10 mx-auto mb-4" /> 
                                    <h4 className="text-lg font-bold mb-2">{t(feature.titleKey)}</h4>
                                    <p className="text-sm text-gray-600">{t(feature.descKey)}</p>
                                </div>
                             )
                        })}
                    </div>
                </div>
            </section>

            {/* ETSY SHOP (FİYATLANDIRMA YERİNE) */}
            <section id="fiyatlandirma" className="py-24 px-8 bg-white border-t border-gray-100 text-center">
                <div className="max-w-4xl mx-auto flex flex-col items-center justify-center">
                    <h3 className="text-3xl font-bold mb-8 text-gray-800">CreateAlist Shop</h3>
                    <a 
                        href="https://createalist.etsy.com" 
                        target="_blank" 
                        className="bg-[#F1641E] text-white px-10 py-4 rounded-full font-bold text-xl shadow-xl hover:bg-[#d55619] transition transform hover:scale-105 flex items-center gap-3"
                    >
                        Etsy Shop ↗
                    </a>
                    <p className="mt-6 text-gray-500 text-sm">
                        {t('pricing_desc')} 
                    </p>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-6 px-8 text-center border-t text-sm text-gray-500 bg-gray-50">
                <div className="flex justify-center space-x-6 mb-2">
                    <Link href="/legal/terms" className="hover:text-black">{t('footer.link_terms')}</Link>
                    <Link href="/legal/privacy" className="hover:text-black">{t('footer.link_privacy')}</Link>
                    <button onClick={() => setShowLoginModal(true)} className="hover:text-black">{t('footer.admin')}</button>
                </div>
                <p>{t('footer.copyright_text')}</p>
            </footer>

            {/* MODAL */}
            {showLoginModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm relative">
                        <button onClick={() => setShowLoginModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-black text-2xl">&times;</button>
                        <h2 className="text-2xl font-bold text-center mb-6 text-indigo-700">{t('landing_login')}</h2>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <input type="email" required className="w-full border p-2 rounded" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder={t('auth.placeholder_email')} />
                            <input type="password" required className="w-full border p-2 rounded" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder={t('auth.placeholder_password')} />
                            <button type="submit" disabled={loginLoading} className="w-full bg-indigo-600 text-white py-3 rounded font-bold hover:bg-indigo-700 disabled:opacity-50">
                                {loginLoading ? t('auth.btn_loading') : t('auth.btn_login_register')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}