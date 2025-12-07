import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cereget - Etkinlik Platformu',
  description: 'Modern davetiye oluşturucu',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        {/* GOOGLE FONTS EKLEMESİ */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Inter:wght@400;700&family=Merriweather:wght@400;700&family=Montserrat:wght@400;700&family=Playfair+Display:wght@700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>{children}</body>
    </html>
  )
}