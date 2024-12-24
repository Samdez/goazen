'use server'

import { Media } from '@/payload-types'
import { payload } from '../client/payload-client'
import { CreateEventSchemaType } from '../formulaire/form.client'

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
  } = formData
  const eventDate = new Date(`${date.date} UTC`).toISOString()
  let imageRes: Media | undefined
  if (formData.image) {
    const browserFile = formData.image as unknown as globalThis.File
    imageRes = await payload.create({
      collection: 'medias',
      data: {
        title: formData.title,
      },
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
        date: eventDate,
        title,
        description,
        location: location?.id,
        time,
        category: genres?.genres.map((genre) => genre),
        genres: preciseGenre,
        price,
        ticketing_url: ticketingLink,
        createdAt: new Date().toISOString(),
        contact_email: email,
        location_alt,
        ...(imageRes && { image: imageRes.id }),
        _status: 'draft',
      },
    })
    return { ok: true, res }
  } catch (error) {
    throw new Error("Erreur lors de la création de l'évènement")
  }
}
