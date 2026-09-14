/**
 * Génère src/lib/city-region-map.ts à partir de la collection `cities`.
 *
 *   pnpm generate:city-map
 *
 * Pourquoi : le middleware faisait un `fetch` HTTP vers /api/get-city-region à
 * chaque URL legacy /concerts/<ville>/... Cela déclenchait une 2e invocation de
 * function et maintenait l'instance du middleware en mémoire provisionnée
 * pendant tout l'aller-retour — facturé sur le quota fluid compute. Les villes
 * sont peu nombreuses et changent rarement : une map statique supprime l'I/O.
 *
 * À relancer après ajout ou renommage d'une ville. Le middleware garde un
 * fallback HTTP pour les slugs absents de la map, donc un oubli dégrade (une
 * requête lente) sans casser la redirection.
 */
import { getPayload } from 'payload'
import { writeFileSync } from 'fs'
import { join } from 'path'
import config from '../src/payload.config'

const OUT = join(process.cwd(), 'src', 'lib', 'city-region-map.ts')

async function main() {
  const payload = await getPayload({ config })

  const cities = await payload.find({
    collection: 'cities',
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  })

  const entries = cities.docs
    .filter((city) => city.slug && city.region)
    .map((city) => [city.slug as string, city.region as string] as const)
    .sort(([a], [b]) => a.localeCompare(b))

  const body = entries.map(([slug, region]) => `  '${slug}': '${region}',`).join('\n')

  const file = `// GENERATED FILE — ne pas éditer à la main.
// Régénérer avec : pnpm generate:city-map
// Généré le ${new Date().toISOString()} à partir de la collection \`cities\`.

export type CityRegion = 'pays-basque' | 'landes'

export const CITY_REGION: Record<string, CityRegion> = {
${body}
}

export function regionForCity(slug: string): CityRegion | undefined {
  return CITY_REGION[slug]
}
`

  writeFileSync(OUT, file, 'utf-8')
  console.log(`✓ ${entries.length} villes écrites dans src/lib/city-region-map.ts`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
