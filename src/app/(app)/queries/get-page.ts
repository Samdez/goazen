'use server'
import { unstable_cache } from 'next/cache'
import { payload } from '../(client)/payload-client'

async function _getPage(slug: string) {
  const pages = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })
  return pages.docs[0]
}

export async function getPage(slug: string) {
  return unstable_cache(async () => await _getPage(slug), ['page', slug], {
    tags: ['pages'],
    revalidate: 60 * 60 * 24, // 24 hours
  })()
}

// Slim variant for the sitemap: only published pages, minimal fields.
export async function getPagesForSitemap() {
  return unstable_cache(
    async () => {
      const pages = await payload.find({
        collection: 'pages',
        where: { published: { equals: true } },
        limit: 1000,
        depth: 0,
        select: { slug: true, updatedAt: true },
        overrideAccess: true,
      })
      return pages.docs
    },
    ['pages-sitemap'],
    {
      tags: ['pages'],
      revalidate: 60 * 60 * 24, // 24 hours
    },
  )()
}
