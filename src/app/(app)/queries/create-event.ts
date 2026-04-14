'use server'

import type { Media } from '@/payload-types'
import { payload } from '../(client)/payload-client'
import type { CreateEventSchemaType } from '../formulaire/create-event-form-schema'

export async function createEvent(formData: CreateEventSchemaType) {
  const {
    title,
    description,
    location,
    date,
    time,
    genres,
    preciseGenre,
    price,
    email,
    ticketingLink,
    location_alt,
    region,
    event_kind,
  } = formData
  const genresText = preciseGenre?.trim() || undefined
  //Store date in same format as payload dashboard
  const eventDate = new Date(date.date)
  eventDate.setDate(eventDate.getDate() + 1) // Add one day
  eventDate.setUTCHours(14, 0, 0, 0) // Set to 2 PM (14:00) UTC
  const formattedEventDate = eventDate.toISOString().replace('Z', '') // Remove the Z suffix

  let imageRes: Media | undefined
  if (formData.image) {
    const browserFile = formData.image as unknown as globalThis.File
    imageRes = await payload.create({
      collection: 'medias',
      data: {},
      file: {
        name: browserFile.name,
        mimetype: browserFile.type,
        size: browserFile.size,
        data: Buffer.from(await browserFile.arrayBuffer()),
      },
    })
  }
  try {
    const res = await payload.create({
      collection: 'events',
      data: {
        date: formattedEventDate,
        title,
        description,
        location: location?.id,
        time,
        ...(genres.length > 0 && { category: genres }),
        genres: genresText,
        price,
        ticketing_url: ticketingLink,
        createdAt: new Date().toISOString(),
        contact_email: email,
        location_alt,
        event_kind: event_kind.event_kind,
        ...(imageRes && { image: imageRes.id }),
        _status: 'draft',
        region: region?.region === 'pays basque' ? 'pays-basque' : 'landes',
      },
      draft: true,
    })

    // Upsert EmailConsents — non-bloquant
    try {
      const existing = await payload.find({
        collection: 'email-consents',
        where: { email: { equals: email } },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        const doc = existing.docs[0]
        const currentEvents = (doc.events as Array<{ id: string } | string> | null)
          ?.map((e) => (typeof e === 'string' ? e : e.id)) ?? []
        await payload.update({
          collection: 'email-consents',
          id: doc.id,
          data: { events: [...currentEvents, res.id] },
        })
      } else {
        await payload.create({
          collection: 'email-consents',
          data: {
            email,
            consentedAt: new Date().toISOString(),
            events: [res.id],
          },
        })
      }
    } catch (err) {
      console.error('EmailConsents upsert failed (non-blocking):', err)
    }

    return { ok: true, res }
  } catch (error) {
    if (error instanceof Error) {
      console.log(error)
      throw new Error(`Erreur lors de la création de l'évènement: ${error}`)
    }
  }
}
