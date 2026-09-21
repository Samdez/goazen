import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { regionForCity } from '@/lib/city-region-map'
import { UNKNOWN_CITY_SEGMENT } from '@/lib/url-segments'

// Segments qui ne sont pas des villes : déjà au nouveau format, ou route spéciale.
const NON_CITY_SEGMENTS = new Set(['evenement', 'pays-basque', 'landes'])

// Anciennes URLs : /concerts/<ville>[/<salle>[/<slug>]]
const OLD_URL_PATTERN = /^\/concerts\/([^/]+)(?:\/([^/]+)?(?:\/([^/]+))?)?$/

// Sentinelle interne publiée par erreur dans les URLs canoniques et le sitemap
// jusqu'à #31, quand aucune ville ne pouvait être résolue.
const LEGACY_NO_LOCATION_PATTERN = /^\/concerts\/([^/]+)\/no-location\/(.+)$/

/**
 * Fallback pour un slug absent de la map générée (ville ajoutée sans avoir
 * relancé `pnpm generate:city-map`).
 *
 * C'est l'ancien chemin : une requête HTTP sortante depuis le middleware, donc
 * une 2e invocation de function et de la mémoire provisionnée facturée pendant
 * tout l'aller-retour. À éviter — d'où la map. Gardé uniquement pour ne pas
 * casser une ville fraîchement créée.
 */
async function lookupRegionOverHttp(request: NextRequest, city: string) {
  try {
    const response = await fetch(
      `${request.nextUrl.origin}/api/get-city-region?city=${encodeURIComponent(city)}`,
    )
    if (!response.ok) return undefined
    const data = await response.json()
    return typeof data?.region === 'string' ? data.region : undefined
  } catch (error) {
    console.error('Error looking up city region:', error)
    return undefined
  }
}

function permanentRedirect(request: NextRequest, path: string) {
  const response = NextResponse.redirect(new URL(path, request.url), 301)
  response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Les URLs `no-location` déjà indexées gardent leur place : même forme, même
  // événement, seul le segment ville change. Zéro I/O, la réécriture est
  // purement textuelle.
  const legacyNoLocation = pathname.match(LEGACY_NO_LOCATION_PATTERN)
  if (legacyNoLocation) {
    const [, region, rest] = legacyNoLocation
    return permanentRedirect(request, `/concerts/${region}/${UNKNOWN_CITY_SEGMENT}/${rest}`)
  }

  const match = pathname.match(OLD_URL_PATTERN)
  if (!match) {
    return NextResponse.next()
  }

  const [, firstSegment, secondSegment, thirdSegment] = match

  if (NON_CITY_SEGMENTS.has(firstSegment)) {
    return NextResponse.next()
  }

  // Chemin nominal : zéro I/O, zéro invocation supplémentaire.
  const region = regionForCity(firstSegment) ?? (await lookupRegionOverHttp(request, firstSegment))

  if (!region) {
    // Ville inconnue — on laisse Next rendre le 404.
    return NextResponse.next()
  }

  let newPath = `/concerts/${region}/${firstSegment}`
  if (secondSegment) {
    newPath += `/${secondSegment}`
    if (thirdSegment) {
      newPath += `/${thirdSegment}`
    }
  }

  return permanentRedirect(request, newPath)
}

// Le matcher reste volontairement étroit : le middleware ne doit jamais tourner
// sur /_next/*, les assets statiques ou les images (chaque passage = 1 invocation).
export const config = {
  matcher: '/concerts/:path*',
}
