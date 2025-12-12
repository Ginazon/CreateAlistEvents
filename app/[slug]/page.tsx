import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import EventView from '../components/EventView'
import { dictionary } from '../i18n' // EKLENDİ

// Server Side Supabase İstemcisi
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
type Props = {
  params: Promise<{ slug: string }>
}

// 1. Dinamik SEO Verisi Oluşturma
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const slug = resolvedParams.slug
  const t = dictionary['tr']

  try {
    const { data: event } = await supabase
      .from('events')
      .select('title, image_url, message, location_name, event_date')
      .eq('slug', slug)
      .single()

    if (!event) {
      return {
        title: t['metadata.event_not_found'],
        robots: {
          index: false,
          follow: false,
        },
      }
    }

    const description = event.message 
      ? event.message.substring(0, 160) + '...' 
      : t['metadata.default_description']

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://createalist.com'
    const pageUrl = `${siteUrl}/${slug}`

    return {
      title: event.title,
      description,
      
      // ✅ Open Graph (Facebook, LinkedIn)
      openGraph: {
        type: 'website',
        url: pageUrl,
        title: event.title,
        description,
        siteName: 'CreateAlist',
        locale: 'tr_TR',
        images: event.image_url ? [
          {
            url: event.image_url,
            width: 1200,
            height: 630,
            alt: event.title,
          }
        ] : [],
      },

      // ✅ Twitter Cards
      twitter: {
        card: 'summary_large_image',
        title: event.title,
        description,
        images: event.image_url ? [event.image_url] : [],
      },

      // ✅ Robots & Canonical
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      alternates: {
        canonical: pageUrl,
      },

      // ✅ Keywords
      keywords: [
        'etkinlik',
        'davetiye',
        'event',
        'invitation',
        'rsvp',
        event.title,
        event.location_name,
      ].filter(Boolean).join(', '),
    }
  } catch (error) {
    console.error('Metadata generation error:', error)
    return {
      title: t['metadata.event_not_found'],
    }
  }
}

// 2. Ana Sayfa Bileşeni
export default async function Page({ params }: Props) {
  const resolvedParams = await params
  return <EventView slug={resolvedParams.slug} />
}