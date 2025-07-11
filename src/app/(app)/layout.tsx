// import Navbar from '@/components/Navbar';
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import type { Metadata } from 'next'
import { Bebas_Neue } from 'next/font/google'
import NextTopLoader from 'nextjs-toploader'

import './globals.css'
import Navbar from './components/Navbar'
import { Toaster } from '@/components/ui/toaster'
import { bebas } from './fonts'

export const metadata: Metadata = {
  metadataBase: new URL('https://goazen.info'),
  title: 'Goazen! - Agenda Concerts & Soirées Biarritz, Pays Basque, Landes',
  description:
    'Tous les concerts et soirées à Biarritz, Bayonne et Pays Basque. Agenda des événements musicaux : rock, électro, DJ sets. Où sortir ce soir ?',
  keywords: [
    'concerts biarritz',
    'concerts pays basque',
    'soiree biarritz',
    'agenda concerts biarritz',
    'sortir biarritz',
    'concert bayonne',
    'dj set pays basque',
    'agenda culturel pays basque',
  ],
  verification: {
    google: 'google-site-verification=6jGooaqWsLT2O6T3V0y_9X4eEoscVIdHlIGGj-7e6QM',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://goazen.info',
    siteName: 'Goazen!',
    title: 'Goazen! - Agenda Concerts & Soirées Biarritz, Pays Basque',
    description:
      'Tous les concerts et soirées à Biarritz et dans le Pays Basque. Agenda des événements musicaux : rock, électro, DJ sets. Où sortir ce soir ?',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Goazen! - Agenda Concerts Biarritz & Pays Basque',
    description:
      'Tous les concerts et soirées à Biarritz et dans le Pays Basque. Agenda des événements musicaux : rock, électro, DJ sets. Où sortir ce soir ?',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={bebas.className} suppressHydrationWarning>
        <Navbar />
        <main className="mt-32 min-h-screen bg-[#FFF2DD] py-8">
          <NextTopLoader color="#E45110" showSpinner={false} />
          {children}
          <Analytics />
          <SpeedInsights />
        </main>
        <Toaster />
      </body>
    </html>
  )
}
