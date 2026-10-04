import { getCategories } from '../../queries/get-categories'
import { AUTRE_CATEGORY_NAME } from '../../constants'
import type { Metadata } from 'next'
import { buildGenreMetadata, GenreView } from './genre-view'

// Pas de durée de vie : régénérée quand un événement change, et chaque nuit
// par le cron quotidien pour passer au jour suivant (tag `events`).
//
// Dès qu'un filtre de date est dans l'URL (`startDate`, `endDate`,
// `activeTime`), next.config.ts réécrit la requête vers ./filtre, rendue à la
// demande. Ne pas relire `searchParams` ici : la page redeviendrait dynamique.
export const revalidate = false

export async function generateStaticParams() {
  const categories = await getCategories()
  return categories
    .filter((c) => c.slug && c.name !== AUTRE_CATEGORY_NAME)
    .map((c) => ({ genre: c.slug as string }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ genre: string }>
}): Promise<Metadata> {
  const { genre } = await params
  return buildGenreMetadata(genre)
}

export default async function Genre({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params
  return <GenreView genre={genre} filters={{}} />
}
