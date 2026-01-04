'use server'

import { env } from 'env'
import { Resend } from 'resend'
import { CreateEventSchemaType } from '../formulaire/form.client'

const resend = new Resend(env.RESEND_API_KEY)

export type SendEmailProps = {
  email: string
} & (
  | {
      message: string
    }
  | CreateEventSchemaType
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
    } = props
    try {
      const res = await resend.emails.send({
        from: 'Goazen <events@goazen.info>',
        to: env.GOAZEN_EMAIL_ADDRESS,
        subject: `Nouvel event: ${title} - ${location?.name || location_alt}`,
        text: `Nouvel event: 
        title: ${title}, 
        location: ${location?.name || location_alt}, 
        date: ${date.date}, 
        time: ${time}, 
        genres: ${genres?.genres.map((genre) => genre).join(', ')}, 
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
