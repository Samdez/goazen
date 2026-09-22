import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '../components/JsonLd'
import { getCategories } from '../queries/get-categories'
import { AUTRE_CATEGORY_NAME } from '../constants'
import { breadcrumbJsonLd, SITE_URL, OG_IMAGE } from '@/lib/structured-data'

export const revalidate = 86400

const TITLE = 'Genres musicaux — concerts au Pays Basque et dans les Landes | Goazen!'
const DESCRIPTION =
  'Tous les genres de l’agenda Goazen! : rock, électro, reggae, jazz, chanson… Choisis un genre et retrouve les concerts et DJ sets à venir près de chez toi.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/genres` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/genres`,
    siteName: 'Goazen!',
    images: [OG_IMAGE],
    locale: 'fr_FR',
    type: 'website',
  },
}

/**
 * Index des genres.
 *
 * Le lien « Genres » du footer pointait ici alors que seule la route
 * /genres/[genre] existait : 404. La page sert aussi de nœud interne vers
 * chacune des pages genre, qui n'étaient liées que depuis les filtres.
 */
export default async function GenresPage() {
  const categories = await getCategories()
  const genres = categories
    .filter((category) => category.slug && category.name !== AUTRE_CATEGORY_NAME)
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'fr'))

  return (
    <>
      <JsonLd
        id="genres-breadcrumb"
        data={breadcrumbJsonLd([
          { name: 'Accueil', path: '/' },
          { name: 'Genres', path: '/genres' },
        ])}
      />

      <div className="mx-auto max-w-3xl px-4 py-12 font-text">
        <h1 className="text-balance text-3xl font-bold">Les genres de l&apos;agenda</h1>
        <p className="mt-3 text-lg">
          Choisis un genre pour voir les concerts, DJ sets et soirées à venir au Pays Basque et dans
          les Landes.
        </p>

        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {genres.map((genre) => (
            <li key={genre.id}>
              <Link
                href={`/genres/${genre.slug}`}
                className="block rounded-lg border-4 border-black px-4 py-3 text-xl font-bold transition hover:bg-[#E45110] hover:text-white"
              >
                Concerts {genre.name}
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-lg">
          Tu ne trouves pas ton genre ? Tous les événements sont sur la{' '}
          <Link href="/" className="underline">
            page d&apos;accueil
          </Link>
          , et par région sur{' '}
          <Link href="/concerts/pays-basque" className="underline">
            Pays Basque
          </Link>{' '}
          et{' '}
          <Link href="/concerts/landes" className="underline">
            Landes
          </Link>
          .
        </p>
      </div>
    </>
  )
}
