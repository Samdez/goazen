import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { regionForCity } from '@/lib/city-region-map'

// Segments qui ne sont pas des villes : déjà au nouveau format, ou route spéciale.
const NON_CITY_SEGMENTS = new Set(['evenement', 'pays-basque', 'landes'])

// Anciennes URLs : /concerts/<ville>[/<salle>[/<slug>]]
const OLD_URL_PATTERN = /^\/concerts\/([^/]+)(?:\/([^/]+)?(?:\/([^/]+))?)?$/

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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

  const redirectResponse = NextResponse.redirect(new URL(newPath, request.url), 301)
  redirectResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable')

  return redirectResponse
}

// Le matcher reste volontairement étroit : le middleware ne doit jamais tourner
// sur /_next/*, les assets statiques ou les images (chaque passage = 1 invocation).
export const config = {
  matcher: '/concerts/:path*',
}
