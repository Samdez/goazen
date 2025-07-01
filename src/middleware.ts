import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if it's an old URL pattern (directly city after concerts)
  const oldUrlPattern = /^\/concerts\/([^/]+)\/([^/]+)(?:\/([^/]+))?$/
  const match = pathname.match(oldUrlPattern)

  if (match) {
    const [, city, location, slug] = match

    // Skip if it's a special route or region
    if (['evenement', 'pays-basque', 'landes'].includes(city)) {
      return NextResponse.next()
    }

    try {
      // Get the region from our API route
      const response = await fetch(
        `${request.nextUrl.origin}/api/get-city-region?city=${encodeURIComponent(city)}`,
      )
      const data = await response.json()
      const region = data.region || 'pays-basque'

      // Construct the new URL with the correct region
      const newPath = slug
        ? `/concerts/${region}/${city}/${location}/${slug}`
        : `/concerts/${region}/${city}/${location}`

      // Create a 301 redirect response with cache headers
      const redirectResponse = NextResponse.redirect(new URL(newPath, request.url), 301)

      // Cache the redirect for 1 year
      redirectResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable')

      return redirectResponse
    } catch (error) {
      console.error('Error looking up city region:', error)
      // If there's an error looking up the city, default to pays-basque
      const newPath = slug
        ? `/concerts/pays-basque/${city}/${location}/${slug}`
        : `/concerts/pays-basque/${city}/${location}`

      const response = NextResponse.redirect(new URL(newPath, request.url), 301)
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
      return response
    }
  }

  return NextResponse.next()
}

// Configure the middleware to only run on specific paths
export const config = {
  matcher: '/concerts/:path*',
}
