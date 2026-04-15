'use server'

import { env } from 'env'
import { Resend } from 'resend'
import { FormEventSchemaType } from '../formulaire/create-event-form-schema'
import { payload } from '../(client)/payload-client'

const resend = new Resend(env.RESEND_API_KEY)

async function formatCategoryIdsForEmail(ids: string[]): Promise<string> {
  if (ids.length === 0) {
    return ''
  }
  const result = await payload.find({
    collection: 'categories',
    where: { id: { in: ids } },
    limit: ids.length,
    overrideAccess: true,
  })
  const nameById = new Map(result.docs.map((d) => [d.id, d.name]))
  return ids.map((id) => nameById.get(id) ?? id).join(', ')
}

export type SendEmailProps = {
  email: string
} & (
  | {
      message: string
    }
  | FormEventSchemaType
)

export async function sendEmail(props: SendEmailProps) {
  if ('message' in props) {
    const { email, message } = props
    try {
      const res = await resend.emails.send({
        from: 'Goazen <contact@goazen.info>',
        to: env.GOAZEN_EMAIL_ADDRESS,
        subject: 'Nouveau message',
        text: `Nouveau mail de : ${email}, ${message}`,
        replyTo: email,
      })
      return { ok: true, res }
    } catch (error) {
      return { ok: false, error: error }
    }
  } else {
    const {
      title,
      location,
      location_alt,
      date,
      time,
      genres,
      preciseGenre,
      price,
      email,
      ticketingLink,
      event_kind,
    } = props
    try {
      const genresLabel = await formatCategoryIdsForEmail(genres)
      const res = await resend.emails.send({
        from: 'Goazen <events@goazen.info>',
        to: env.GOAZEN_EMAIL_ADDRESS,
        subject: `Nouvel event: ${title} - ${location?.name || location_alt}`,
        text: `Nouvel event: 
        title: ${title}, 
        type: ${event_kind.event_kind}, 
        location: ${location?.name || location_alt}, 
        date: ${date.date}, 
        time: ${time}, 
        genres: ${genresLabel}, 
        preciseGenre: ${preciseGenre}, 
        price: ${price}, 
        email: ${email}, 
        ticketingLink: ${ticketingLink}`,
        replyTo: email,
      })
      return { ok: true, res }
    } catch (error) {
      return { ok: false, error: error }
    }
  }
}
