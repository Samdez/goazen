/**
 * Audit en lecture seule de la collection `medias`.
 *
 *   pnpm payload run scripts/audit-medias.ts
 *
 * Pourquoi : jusqu'à ce correctif, `medias` acceptait `create` en anonyme via
 * l'API REST (POST /api/medias) et tout `image/*`, SVG compris. Ce script liste
 * ce qui a pu passer par là :
 *   - les fichiers dont le type n'est pas une image matricielle autorisée ;
 *   - les médias référencés par aucun document (event, location, special
 *     event, global ImagePlaceholder) — un upload REST direct n'est rattaché à
 *     rien, alors que le formulaire public lie toujours l'image à un event.
 *
 * N'écrit rien et ne supprime rien.
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])

function idOf(value: unknown): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return value
  if (typeof value === 'object' && 'id' in value) return String((value as { id: unknown }).id)
  return undefined
}

async function main() {
  const payload = await getPayload({ config })

  const medias = await payload.find({
    collection: 'medias',
    limit: 0,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })

  const referenced = new Set<string>()
  const add = (v: unknown) => {
    const id = idOf(v)
    if (id) referenced.add(id)
  }

  const [events, locations, specialEvents, placeholder] = await Promise.all([
    payload.find({ collection: 'events', pagination: false, depth: 0, draft: true, overrideAccess: true, select: { image: true } }),
    payload.find({ collection: 'locations', pagination: false, depth: 0, overrideAccess: true, select: { image: true } }),
    payload.find({
      collection: 'special-events',
      pagination: false,
      depth: 0,
      overrideAccess: true,
      select: { image: true, image_mobile: true },
    }),
    payload.findGlobal({ slug: 'image-placeholder', depth: 0, overrideAccess: true }),
  ])
  events.docs.forEach((d) => add(d.image))
  locations.docs.forEach((d) => add(d.image))
  specialEvents.docs.forEach((d) => {
    add(d.image)
    add(d.image_mobile)
  })
  add(placeholder.ImagePlaceholder)

  const badMime = medias.docs.filter((m) => !m.mimeType || !ALLOWED_MIMES.has(m.mimeType))
  const orphans = medias.docs.filter((m) => !referenced.has(String(m.id)))

  const row = (m: (typeof medias.docs)[number]) =>
    `  ${m.id}  ${m.createdAt}  ${m.mimeType ?? '?'}  ${m.filesize ?? '?'} o  ${m.filename}`

  console.log(`${medias.docs.length} médias au total, ${referenced.size} référencés.\n`)

  console.log(`Type non autorisé (${badMime.length}) :`)
  badMime.forEach((m) => console.log(row(m)))

  console.log(`\nOrphelins (${orphans.length}), du plus récent au plus ancien :`)
  orphans
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .forEach((m) => console.log(row(m)))

  process.exit(0)
}

// `payload run` quitte dès la fin de l'évaluation du module : on attend main() au top level.
await main().catch((err) => {
  console.error(err)
  process.exit(1)
})
