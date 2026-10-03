import { withPayload } from '@payloadcms/next/withPayload'

// Paramètres d'URL qui activent un filtre sur la home (voir FilterBar).
const HOME_FILTER_PARAMS = ['when', 'region', 'city', 'genres']

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
  // /home-filtree, rendue à la demande. Réécriture (l'URL visible ne change
  // pas) faite par le routeur, sans middleware ni invocation supplémentaire.
  async rewrites() {
    return {
      beforeFiles: HOME_FILTER_PARAMS.map((key) => ({
        source: '/',
        has: [{ type: 'query' as const, key }],
        destination: '/home-filtree',
      })),
    }
  },
}

export default withPayload(nextConfig)
