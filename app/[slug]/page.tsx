import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import EventView from '../components/EventView'
import { dictionary } from '../i18n' // EKLENDİ

// Server Side Supabase İstemcisi
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Props = {
  params: Promise<{ slug: string }>
}

// 1. Dinamik SEO Verisi Oluşturma
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const slug = resolvedParams.slug
  const t = dictionary['tr'] // Server tarafı için varsayılan dil

  const { data: event } = await supabase
    .from('events')
    .select('title, image_url, message')
    .eq('slug', slug)
    .single()

  if (!event) {
    return {
      title: t['metadata.event_not_found'], // GÜNCELLENDİ
    }
  }

  return {
    title: event.title,
    description: event.message ? event.message.substring(0, 150) + '...' : t['metadata.default_description'], // GÜNCELLENDİ
    openGraph: {
      title: event.title,
      description: event.message ? event.message.substring(0, 150) + '...' : t['metadata.default_description'], // GÜNCELLENDİ
      images: event.image_url ? [event.image_url] : [],
    },
  }
}

// 2. Ana Sayfa Bileşeni
export default async function Page({ params }: Props) {
  const resolvedParams = await params
  return <EventView slug={resolvedParams.slug} />
}