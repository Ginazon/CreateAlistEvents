import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto p-12 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">Kullanım Şartları (Terms of Service)</h1>
      <p className="text-sm text-red-600 mb-8 p-3 border border-red-200 bg-red-50 rounded">
        ⚠️ BURASI YASAL ALAN: Lütfen bu varsayılan metinleri silerek avukatınızdan gelen GERÇEK metinlerle değiştirin. Bu içerikler yasal tavsiye DEĞİLDİR.
      </p>
      
      <div className="space-y-4 text-gray-700">
        <h2 className="text-xl font-bold mt-8">1. Hizmetin Kabulü</h2>
        <p>
          Cereget'i kullanarak, bu kullanım şartlarını ve gizlilik politikamızı kabul etmiş sayılırsınız. Hizmeti kullanmaya devam etmeden önce bu metinleri okuduğunuzdan emin olun.
        </p>
        <h2 className="text-xl font-bold mt-8">2. Kullanıcı Sorumlulukları</h2>
        <p>
          Yüklediğiniz tüm içeriklerin (fotoğraflar, mesajlar) yasalara ve topluluk kurallarına uygunluğundan yalnızca siz sorumlusunuz.
        </p>
        {/* BU BÖLÜMLERE GERÇEK YASAL METİNLERİNİZ GELECEK */}
      </div>
      
      <Link href="/" className="mt-12 inline-block text-indigo-600 hover:underline">
        ← Ana Sayfaya Dön
      </Link>
    </div>
  )
}