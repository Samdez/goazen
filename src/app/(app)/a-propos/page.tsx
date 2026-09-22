import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '../components/JsonLd'
import { getSiteStats } from '../queries/get-site-stats'
import { organizationJsonLd, SITE_URL, OG_IMAGE } from '@/lib/structured-data'

// ISR : les chiffres affichés doivent suivre la base, pas la date du build.
export const revalidate = 86400

const TITLE = 'À propos de Goazen! — qui fait cet agenda'
const DESCRIPTION =
  'Goazen! est un agenda de concerts du Pays Basque et des Landes, tenu bénévolement et gratuit pour tous. Qui le fait, comment les événements sont collectés, comment nous contacter.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/a-propos` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/a-propos`,
    siteName: 'Goazen!',
    images: [OG_IMAGE],
    locale: 'fr_FR',
    type: 'website',
  },
}

function formatCount(value: number) {
  return new Intl.NumberFormat('fr-FR').format(value)
}

export default async function AboutPage() {
  const stats = await getSiteStats()

  return (
    <>
      <JsonLd
        id="about-structured-data"
        data={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: TITLE,
          description: DESCRIPTION,
          url: `${SITE_URL}/a-propos`,
          inLanguage: 'fr-FR',
          mainEntity: organizationJsonLd({ description: DESCRIPTION }),
        }}
      />

      <div className="mx-auto max-w-3xl px-4 py-12 font-text text-lg [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-brand-orange">
        <h1 className="text-balance text-3xl font-bold">À propos de Goazen!</h1>

        <p className="mt-4">
          Goazen! est un agenda des concerts, DJ sets et soirées du Pays Basque et des Landes. Il
          est <strong>gratuit pour tout le monde</strong> — pour celles et ceux qui cherchent une
          sortie comme pour les organisateurs qui y publient leurs dates.
        </p>

        <h2 className="mt-10 text-2xl font-bold">Qui le fait</h2>
        <p className="mt-4">
          Le site est édité et exploité <strong>bénévolement par l&apos;équipe Goazen!</strong>. Ce
          n&apos;est ni une billetterie, ni une régie publicitaire : nous ne vendons pas de places
          et ne prenons aucune commission sur les événements référencés.
        </p>

        <h2 className="mt-10 text-2xl font-bold">Ce qu&apos;il y a dedans</h2>
        <ul className="mt-4 list-disc space-y-1 pl-6">
          <li>
            <strong>{formatCount(stats.publishedEvents)} événements</strong> publiés depuis 2024
          </li>
          <li>
            <strong>{formatCount(stats.upcomingEvents)} dates à venir</strong> en ce moment
          </li>
          <li>
            <strong>{formatCount(stats.locations)} salles, bars et lieux</strong> référencés
          </li>
          <li>
            <strong>{formatCount(stats.cities)} villes</strong> couvertes, de Bayonne à
            Mont-de-Marsan
          </li>
        </ul>

        <h2 className="mt-10 text-2xl font-bold">Comment les événements sont collectés</h2>
        <p className="mt-4">
          Deux chemins. Les organisateurs publient eux-mêmes leurs dates avec le{' '}
          <Link href="/formulaire">formulaire</Link> — gratuit, sans compte à créer. Le reste est
          ajouté par l&apos;équipe à partir des programmations des salles et des annonces reçues par
          mail ou sur Instagram.
        </p>
        <p className="mt-4">
          Dans les deux cas, <strong>une date soumise est relue avant d&apos;être publiée</strong>.
          Les erreurs restent possibles : une salle décale une heure, un concert est annulé. Si vous
          en repérez une, <Link href="/contact">dites-le nous</Link>, nous corrigeons.
        </p>

        <h2 className="mt-10 text-2xl font-bold">Zone couverte</h2>
        <p className="mt-4">
          Le <Link href="/concerts/pays-basque">Pays Basque</Link> et les{' '}
          <Link href="/concerts/landes">Landes</Link> : Bayonne, Biarritz, Anglet,
          Saint-Jean-de-Luz, Hendaye, Capbreton, Hossegor, Seignosse, Dax, Mont-de-Marsan et les
          communes alentour. La liste complète des lieux est sur la page{' '}
          <Link href="/salles-de-concert">salles de concert</Link>.
        </p>

        <h2 className="mt-10 text-2xl font-bold">Nous écrire</h2>
        <p className="mt-4">
          Une date à ajouter, une correction, une question :{' '}
          <a href="mailto:contact@goazen.info">contact@goazen.info</a>, ou sur{' '}
          <a href="https://www.instagram.com/goazen.info/" target="_blank" rel="noopener">
            Instagram
          </a>
          . Les professionnels trouveront nos prestations sur l&apos;
          <Link href="/pro">espace pro</Link>.
        </p>
      </div>
    </>
  )
}
