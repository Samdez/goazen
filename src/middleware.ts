import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if it's an old URL pattern (directly city after concerts)
  const oldUrlPattern = /^\/concerts\/([^/]+)(?:\/([^/]+)?(?:\/([^/]+))?)?$/
  const match = pathname.match(oldUrlPattern)

  if (match) {
    const [, firstSegment, secondSegment, thirdSegment] = match

    // Skip if it's a special route or region
    if (['evenement', 'pays-basque', 'landes'].includes(firstSegment)) {
      return NextResponse.next()
    }

    try {
      // Get the region from our API route
      const response = await fetch(
        `${request.nextUrl.origin}/api/get-city-region?city=${encodeURIComponent(firstSegment)}`,
      )

      if (!response.ok) {
        // If the API returns an error, let Next.js handle the 404
        return NextResponse.next()
      }

      const data = await response.json()

      if (!data.region) {
        // If no region is found, let Next.js handle the 404
        return NextResponse.next()
      }

      // Construct the new URL with the correct region
      let newPath = `/concerts/${data.region}/${firstSegment}`
      if (secondSegment) {
        newPath += `/${secondSegment}`
        if (thirdSegment) {
          newPath += `/${thirdSegment}`
        }
      }

      // Create a 301 redirect response with cache headers
      const redirectResponse = NextResponse.redirect(new URL(newPath, request.url), 301)

      // Cache the redirect for 1 year
      redirectResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable')

      return redirectResponse
    } catch (error) {
      console.error('Error looking up city region:', error)
      // If there's an error looking up the city, let Next.js handle the 404
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

// Configure the middleware to only run on specific paths
export const config = {
  matcher: '/concerts/:path*',
}
