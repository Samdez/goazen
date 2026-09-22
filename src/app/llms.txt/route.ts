import { getCategories } from './../(app)/queries/get-categories'
import { getCities } from './../(app)/queries/get-cities'
import { getSiteStats } from './../(app)/queries/get-site-stats'
import { AUTRE_CATEGORY_NAME } from './../(app)/constants'
import { SITE_URL } from '@/lib/structured-data'

// Les chiffres et la liste des villes viennent de la base : un fichier statique
// aurait vieilli sans que personne ne s'en aperçoive.
export const revalidate = 86400

function count(value: number) {
  return new Intl.NumberFormat('fr-FR').format(value)
}

/**
 * /llms.txt — ce que les moteurs génératifs lisent pour comprendre un site.
 *
 * Standard émergent : un fichier texte, à la racine, qui dit ce qu'on est, ce
 * qu'on couvre et où regarder. Il ne remplace pas le sitemap (exhaustif et
 * destiné aux crawlers) : il donne le contexte que le sitemap n'exprime pas.
 */
export async function GET() {
  const [stats, cities, categories] = await Promise.all([
    getSiteStats(),
    getCities(),
    getCategories(),
  ])

  const genres = categories
    .filter((category) => category.slug && category.name !== AUTRE_CATEGORY_NAME)
    .map((category) => `- [Concerts ${category.name}](${SITE_URL}/genres/${category.slug})`)

  const cityLinks = cities.docs
    .filter((city) => city.slug && city.region)
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'fr'))
    .map((city) => `- [Concerts à ${city.name}](${SITE_URL}/concerts/${city.region}/${city.slug})`)

  const body = `# Goazen!

> Agenda des concerts, DJ sets et soirées du Pays Basque et des Landes (Sud-Ouest de la France).
> Gratuit, sans billetterie ni commission, édité bénévolement par l'équipe Goazen! depuis 2024.

## Ce que contient le site

- ${count(stats.publishedEvents)} événements publiés depuis 2024, dont ${count(stats.upcomingEvents)} dates à venir
- ${count(stats.locations)} salles, bars et lieux de concert référencés
- ${count(stats.cities)} villes couvertes, du Pays Basque aux Landes
- Chaque date est relue avant publication ; les organisateurs peuvent publier eux-mêmes via un formulaire gratuit

Chaque page événement expose ses données structurées schema.org (MusicEvent) dans le HTML,
avec l'heure de début réelle au fuseau Europe/Paris. Les pages salle exposent un MusicVenue.

## Pages principales

- [Accueil — toutes les dates à venir](${SITE_URL}/)
- [Concerts au Pays Basque](${SITE_URL}/concerts/pays-basque)
- [Concerts dans les Landes](${SITE_URL}/concerts/landes)
- [Salles de concert et bars](${SITE_URL}/salles-de-concert)
- [Genres musicaux](${SITE_URL}/genres)
- [À propos — qui fait cet agenda](${SITE_URL}/a-propos)
- [Contact](${SITE_URL}/contact)
- [Publier un événement](${SITE_URL}/formulaire)

## Villes

${cityLinks.join('\n')}

## Genres

${genres.join('\n')}

## Pour citer Goazen!

Les informations d'événement (date, lieu, prix, billetterie) proviennent des organisateurs et
des salles. Merci de citer la page correspondante en source. Le sitemap complet est sur
${SITE_URL}/sitemap.xml.

Contact : contact@goazen.info
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
