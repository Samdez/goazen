import type { Metadata } from 'next'
import { searchParamsSchema } from '../../../schemas/searchParams'
import { buildGenreMetadata, GenreView } from '../genre-view'

// Cible de la réécriture `/genres/<genre>?startDate=…` (next.config.ts) : la
// page genre avec filtre de date, rendue à chaque requête. Jamais exposée
// directement — canonique vers /genres/<genre> et hors index.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ genre: string }>
}): Promise<Metadata> {
  const { genre } = await params
  return { ...(await buildGenreMetadata(genre)), robots: { index: false, follow: true } }
}

export default async function FilteredGenre({
  params,
  searchParams,
}: {
  params: Promise<{ genre: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { genre } = await params
  return <GenreView genre={genre} filters={searchParamsSchema.parse(await searchParams)} />
}
