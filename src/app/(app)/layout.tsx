// import Navbar from '@/components/Navbar';
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import type { Metadata } from 'next'
import { Bebas_Neue } from 'next/font/google'
import NextTopLoader from 'nextjs-toploader'
import { ClerkProvider } from '@clerk/nextjs'

import './globals.css'
import Navbar from './components/Navbar'
import { Toaster } from '@/components/ui/toaster'

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://goazen.info'),
  title: 'Goazen! - Agenda Concerts & Soirées Biarritz, Pays Basque, Landes',
  description:
    'Trouvez tous les concerts et soirées à Biarritz, Bayonne et dans le Pays Basque ! Agenda complet des événements musicaux : rock, électro, DJ sets. Programmation des meilleures salles de concert de la région. Découvrez où sortir ce soir !',
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
      'Trouvez tous les concerts et soirées à Biarritz et dans le Pays Basque ! Agenda complet des événements musicaux et DJ sets. Découvrez où sortir ce soir !',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Goazen! - Agenda Concerts Biarritz & Pays Basque',
    description:
      'Trouvez tous les concerts et soirées à Biarritz et dans le Pays Basque ! Agenda complet des événements musicaux et DJ sets.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body className={bebas.className}>
          <Navbar />
          <main className="mt-[14vh] min-h-screen bg-[#FFDCA8] pt-4">
            <NextTopLoader color="#ee2244bc" showSpinner={false} />
            {children}
            <Analytics />
            <SpeedInsights />
          </main>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
