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
  } = formData
  const eventDate = new Date(`${formData.date.date} UTC`).toISOString()
  const image = await payload.create({ collection: 'medias', file: formData.image })
  payload.create({
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
      image: image.id,
    },
  })
}
