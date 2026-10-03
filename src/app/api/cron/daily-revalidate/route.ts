import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { payload } from '@/app/(app)/(client)/payload-client'
import { hasBearerSecret } from '@/lib/bearer-auth'
import { previousParisDay, tagsForEndedEvents } from '@/lib/daily-revalidation'

export const dynamic = 'force-dynamic'

/**
 * Cron quotidien (vercel.json), lancé après minuit UTC — entre 1 h et 3 h à
 * Paris sur Hobby (déclenchement à l'heure près). Après minuit UTC, et pas juste
 * après minuit à Paris : les fenêtres de la home (« Ce soir ») et les clés de
 * cache des listes sont découpées en jours UTC.
 * Voir src/lib/daily-revalidation.ts.
 */
export async function GET(req: NextRequest) {
  // Vercel envoie `Authorization: Bearer $CRON_SECRET` à chaque déclenchement.
  if (!hasBearerSecret(req.headers.get('authorization'), process.env.CRON_SECRET)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { start, end } = previousParisDay(new Date())
  const ended = await payload.find({
    collection: 'events',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { date: { greater_than_equal: start.toISOString() } },
        { date: { less_than: end.toISOString() } },
      ],
    },
    pagination: false,
    depth: 0,
    draft: false,
    select: { location: true },
  })

  const tags = tagsForEndedEvents(ended.docs)
  tags.forEach((tag) => revalidateTag(tag))

  return NextResponse.json({
    day: { start: start.toISOString(), end: end.toISOString() },
    endedEvents: ended.docs.length,
    revalidatedTags: tags.length,
  })
}
