import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto p-12 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">Gizlilik Politikası ve KVKK Aydınlatma Metni</h1>
      <p className="text-sm text-red-600 mb-8 p-3 border border-red-200 bg-red-50 rounded">
        ⚠️ BURASI YASAL ALAN: Lütfen bu varsayılan metinleri silerek avukatınızdan gelen GERÇEK metinlerle değiştirin. Bu içerikler yasal tavsiye DEĞİLDİR.
      </p>
      
      <div className="space-y-4 text-gray-700">
        <h2 className="text-xl font-bold mt-8">1. Veri Toplama</h2>
        <p>
          Hizmetimiz, etkinlik oluşturma ve LCV toplama amaçlarıyla e-posta adresi, isim ve şifre (hashlenmiş) gibi verileri toplar. Fotoğraf yükleme esnasında IP adresleri loglanabilir.
        </p>
        <h2 className="text-xl font-bold mt-8">2. Verilerin Güvenliği</h2>
        <p>
          Tüm verileriniz Supabase üzerinde güvenli sunucularda tutulmakta olup, şifreli JWT ve RLS kuralları ile korunmaktadır.
        </p>
        {/* BU BÖLÜMLERE GERÇEK YASAL METİNLERİNİZ GELECEK */}
      </div>
      
      <Link href="/" className="mt-12 inline-block text-indigo-600 hover:underline">
        ← Ana Sayfaya Dön
      </Link>
    </div>
  )
}