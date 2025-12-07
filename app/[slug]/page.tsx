import { supabase } from '../lib/supabaseClient'
// YENİ: Form bileşenini sayfaya çağırıyoruz
import RsvpForm from '../components/RsvpForm'

async function getEvent(slug: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  return { data, error }
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: event, error } = await getEvent(slug)

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold">404 - Etkinlik Bulunamadı</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pb-20">
     {/* YENİ: Görsel Alanı */}
     {event.image_url ? (
        // Eğer resim varsa onu göster
        <div className="w-full max-h-[500px] overflow-hidden bg-gray-100 flex items-center justify-center">
          <img src={event.image_url} alt={event.title} className="object-contain w-full h-full" />
        </div>
      ) : (
        // Resim yoksa eski gri kutuyu göster
        <div className="w-full h-64 bg-indigo-100 flex items-center justify-center">
          <span className="text-indigo-400 font-medium">Görsel Eklenmemiş</span>
        </div>
      )}

      <div className="max-w-xl w-full px-6 -mt-10">
        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
          
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
            {event.title}
          </h1>

          <div className="text-center text-gray-500 mb-8">
             <p className="mb-2">Hoşgeldiniz! Bu özel günümüzde sizi de aramızda görmekten mutluluk duyarız.</p>
             <hr className="my-4"/>
             {/* Buraya veritabanından tarih/konum da gelebilir ileride */}
             <p>📍 Konum Detayı</p>
             <p>📅 Tarih Detayı</p>
          </div>

          {/* YENİ: LCV Formunu Buraya Yerleştiriyoruz */}
          {/* event.id bilgisini forma gönderiyoruz ki hangi etkinliğe kayıt olacağını bilsin */}
          <RsvpForm eventId={event.id} />

        </div>
      </div>
      
      <footer className="mt-12 text-gray-400 text-sm">
        Cereget ile oluşturuldu
      </footer>
    </div>
  )
}