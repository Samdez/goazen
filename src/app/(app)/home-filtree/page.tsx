import type { Metadata } from 'next'
import { HomeView, type HomeSearchParams } from '../home-view'

// Cible de la réécriture `/?when=…` (next.config.ts) : la home avec filtres,
// rendue à chaque requête. Jamais exposée directement — canonique vers `/` et
// hors index si on y accède par son propre chemin.
export const metadata: Metadata = {
  alternates: { canonical: 'https://goazen.info' },
  robots: { index: false, follow: true },
}

export default async function FilteredHomePage({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>
}) {
  return <HomeView searchParams={await searchParams} />
}
