// import Navbar from '@/components/Navbar';
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import type { Metadata } from 'next'
import { Bebas_Neue } from 'next/font/google'
import NextTopLoader from 'nextjs-toploader'

import './globals.css'
import Navbar from './components/Navbar'

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://goazen.info'),
  title: 'Goazen! - Agenda Concerts Pays Basque & Landes',
  description:
    'Découvrez tous les concerts au Pays Basque et dans les Landes ! Agenda complet des événements musicaux : rock, rap, électro, reggae, etc... à Biarritz, Bayonne, Anglet, Hossegor, Capbreton, etc... Trouvez votre prochain concert ou DJ set.',
  verification: {
    google: 'google-site-verification=6jGooaqWsLT2O6T3V0y_9X4eEoscVIdHlIGGj-7e6QM',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={bebas.className}>
        <Navbar />
        <main className="mt-[14vh] min-h-screen bg-[#FFDCA8] pt-4">
          <NextTopLoader color="#ee2244bc" showSpinner={false} />
          {children}
          <Analytics />
          <SpeedInsights />
        </main>
      </body>
    </html>
  )
}
