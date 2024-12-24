'use server'

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
  const browserFile = formData.image as unknown as globalThis.File
  const image = await payload.create({
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
  const res = await payload.create({
    collection: 'events',
    data: {
      date: eventDate,
      title,
      description,
      location: location.id,
      time,
      category: genres.genres.map((genre) => genre),
      genres: preciseGenre,
      price,
      ticketing_url: ticketingLink,
      createdAt: new Date().toISOString(),
      contact_email: email,
      location_alt,
      image: image.id,
      _status: 'draft',
    },
  })
  return res
}
