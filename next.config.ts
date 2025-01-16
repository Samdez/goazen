import { withPayload } from '@payloadcms/next/withPayload'

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
}

export default withPayload(nextConfig)
