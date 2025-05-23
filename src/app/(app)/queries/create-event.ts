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
  console.log('🚀 ~ createEvent ~ original date:', date.date)
  //Store date in same format as payload dashboard
  const eventDate = new Date(date.date)
  eventDate.setDate(eventDate.getDate() + 1) // Add one day
  eventDate.setUTCHours(14, 0, 0, 0) // Set to 2 PM (14:00) UTC
  const formattedEventDate = eventDate.toISOString().replace('Z', '') // Remove the Z suffix
  console.log('🚀 ~ createEvent ~ formatted date:', formattedEventDate)

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
