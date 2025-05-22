'use server'

import type { Media } from '@/payload-types'
import { payload } from '../client/payload-client'
import type { CreateEventSchemaType } from '../formulaire/form.client'

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
  // Get the date components in local timezone
  const year = date.date.getFullYear()
  const month = String(date.date.getMonth() + 1).padStart(2, '0')
  const day = String(date.date.getDate()).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`
  // Create date at noon UTC to ensure the date is preserved
  const eventDate = new Date(`${dateStr}T12:00:00.000Z`).toISOString()
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
      draft: true,
    })
    return { ok: true, res }
  } catch (error) {
    if (error instanceof Error) {
      console.log(error)
      throw new Error(`Erreur lors de la création de l'évènement: ${error}`)
    }
  }
}
