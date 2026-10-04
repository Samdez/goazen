import { withPayload } from '@payloadcms/next/withPayload'

// Paramètres d'URL qui activent un filtre sur la home (voir FilterBar).
const HOME_FILTER_PARAMS = ['when', 'region', 'city', 'genres']
// Paramètres d'URL du filtre de date des pages genre (voir createHref).
const GENRE_FILTER_PARAMS = ['startDate', 'endDate', 'activeTime']

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    staticGenerationRetryCount: 1,
    staticGenerationMaxConcurrency: 2,
    staticGenerationMinPagesPerWorker: 25,
    serverActions: {
      bodySizeLimit: 25 * 1024 * 1024,
    },
  },
  // `/` sans filtre est une page en cache ; avec un filtre, elle est servie par
  // /home-filtree, rendue à la demande. Même principe pour /genres/<genre> et
  // sa variante ./filtre. Réécriture (l'URL visible ne change pas) faite par le
  // routeur, sans middleware ni invocation supplémentaire.
  async rewrites() {
    return {
      beforeFiles: [
        ...HOME_FILTER_PARAMS.map((key) => ({
          source: '/',
          has: [{ type: 'query' as const, key }],
          destination: '/home-filtree',
        })),
        ...GENRE_FILTER_PARAMS.map((key) => ({
          source: '/genres/:genre',
          has: [{ type: 'query' as const, key }],
          destination: '/genres/:genre/filtre',
        })),
      ],
    }
  },
  // Ancien filtre `/salles-de-concert?city=<slug>` (liens externes, index
  // Google) : la page par ville existe et est en cache.
  async redirects() {
    return [
      {
        source: '/salles-de-concert',
        has: [{ type: 'query' as const, key: 'city', value: '(?<city>[a-z0-9-]+)' }],
        destination: '/salles-de-concert/:city',
        permanent: true,
      },
    ]
  },
}

export default withPayload(nextConfig)
