import type { Event } from '@/payload-types'
import { getEventKindDisplayLabel } from '@/utils/event-kind'

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

export function getDay(date: Date) {
  return DAYS[date.getDay()]
}

function csvField(v: unknown): string {
  const s = v == null ? '' : String(v)
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function convertEventsToCSV(events: Event[]): string {
  let str = ''
  for (const event of events) {
    const location = event.location
      ? typeof event.location === 'string'
        ? event.location
        : event.location.name
      : event.location_alt
    const locationCity =
      typeof event.location !== 'string' &&
      event.location?.['city V2'] &&
      typeof event.location['city V2'] === 'object'
        ? event.location['city V2'].name
        : ''
    const categories = event.category
      ?.map((cat) => (typeof cat !== 'string' ? cat.name : ''))
      .filter(Boolean)
      .join(' / ')

    const row = [
      event.title,
      getDay(new Date(event.date)),
      `${location ?? ''} / ${locationCity} - ${event.time ?? ''}`,
      event.genres || categories || '',
      event.price === '0' ? 'Gratuit' : `${event.price}€`,
      getEventKindDisplayLabel(event),
    ]
    str += row.map(csvField).join(',') + '\r\n'
  }
  return str
}
