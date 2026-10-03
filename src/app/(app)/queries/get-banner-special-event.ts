'use server'
import { unstable_cache } from 'next/cache'
import type { SpecialEvent } from '@/payload-types'
import { payload } from '../(client)/payload-client'
import { bannerActiveQueryBounds } from '@/lib/banner-window'

// Returns the special event whose banner window contains today, or null.
// Replaces the manual `show-special-event` global (ADR-0004): the banner
// windows are guaranteed non-overlapping at save time, so at most one doc
// can match. The day-granular cache key rolls the banner over at (UTC)
// midnight; edits are instant via the `special-events` tag revalidation.
export async function getBannerSpecialEvent(): Promise<SpecialEvent | null> {
  const { startBefore, endOnOrAfter } = bannerActiveQueryBounds()
  return unstable_cache(
    async () => {
      const res = await payload.find({
        collection: 'special-events',
        where: {
          and: [
            { banner_start_date: { less_than: startBefore.toISOString() } },
            { banner_end_date: { greater_than_equal: endOnOrAfter.toISOString() } },
          ],
        },
        limit: 1,
        depth: 2,
      })
      return res.docs[0] ?? null
    },
    ['banner-special-event', endOnOrAfter.toISOString()],
    // Pas de durée de vie (ADR-0005) : la clé change chaque jour UTC, et la
    // home est régénérée chaque nuit par le cron après minuit UTC. Les
    // modifications d'un special-event restent instantanées (tag).
    { tags: ['special-events'], revalidate: false },
  )()
}
