import type { CollectionBeforeChangeHook } from 'payload'

function parisDayKey(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

export const clearOtherHighlightsOnSameDay: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!data.highlighted || !data.date) return data
  if (req.context?.skipHighlightHook) return data

  const targetDay = parisDayKey(new Date(data.date))

  const existing = await req.payload.find({
    collection: 'events',
    where: {
      and: [
        { highlighted: { equals: true } },
        ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
      ],
    },
    limit: 500,
    overrideAccess: true,
    depth: 0,
  })

  const sameDay = existing.docs.filter((doc) => {
    return doc.date && parisDayKey(new Date(doc.date)) === targetDay
  })

  await Promise.all(
    sameDay.map((doc) =>
      req.payload.update({
        collection: 'events',
        id: doc.id,
        data: { highlighted: false },
        overrideAccess: true,
        context: { skipHighlightHook: true },
      }),
    ),
  )

  return data
}
