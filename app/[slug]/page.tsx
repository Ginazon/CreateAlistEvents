import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import EventView from '../components/EventView' // Az önce oluşturduğumuz bileşen

// Server Side Supabase İstemcisi (Sadece okuma yapacak)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Props = {
  params: Promise<{ slug: string }>
}

// 1. Dinamik SEO Verisi Oluşturma (WhatsApp Önizlemesi İçin)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const slug = resolvedParams.slug

  // Veritabanından başlık ve kapak resmini çek
  const { data: event } = await supabase
    .from('events')
    .select('title, image_url, message')
    .eq('slug', slug)
    .single()

  if (!event) {
    return {
      title: 'Etkinlik Bulunamadı - Cereget',
    }
  }

  return {
    title: event.title,
    description: event.message ? event.message.substring(0, 150) + '...' : 'Davetlisiniz!',
    openGraph: {
      title: event.title,
      description: event.message ? event.message.substring(0, 150) + '...' : 'Davetlisiniz!',
      images: event.image_url ? [event.image_url] : [],
    },
  }
}

// 2. Ana Sayfa Bileşeni (Server Side)
export default async function Page({ params }: Props) {
  const resolvedParams = await params
  
  // Client Component'i çağırıyoruz ve slug'ı aktarıyoruz
  return <EventView slug={resolvedParams.slug} />
}