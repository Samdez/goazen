import type { Event } from '../../../payload-types'
import { getEventKindDisplayLabel } from '@/utils/event-kind'

const DAYS_FR = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
] as const

function getDayFr(date: Date): string {
  return DAYS_FR[date.getDay()]
}

export function csvField(value: unknown): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const HEADERS = ['Titre', 'Jour', 'Lieu', 'Genres', 'Prix', 'Type'] as const

function eventToRow(event: Event): string {
  const location = event.location
    ? typeof event.location === 'string'
      ? event.location
      : event.location.name
    : event.location_alt
  const locationCity =
    typeof event.location !== 'string' &&
    event.location?.['city V2'] &&
    typeof event.location?.['city V2'] === 'object'
      ? event.location['city V2'].name
      : ''
  const categories = event.category
    ?.map((cat) => (typeof cat !== 'string' ? cat.name : ''))
    .filter(Boolean)
    .join(' / ')

  const locationCell = `${location ?? ''} / ${locationCity} - ${event.time ?? ''}`
  const genresCell = event.genres || categories || ''
  const priceCell = event.price === '0' ? 'Gratuit' : event.price ? `${event.price}€` : ''

  return [
    csvField(event.title),
    csvField(getDayFr(new Date(event.date))),
    csvField(locationCell),
    csvField(genresCell),
    csvField(priceCell),
    csvField(getEventKindDisplayLabel(event)),
  ].join(',')
}

export function convertEventsToCSV(events: Event[]): string {
  const header = HEADERS.map(csvField).join(',')
  const body = events.map(eventToRow).join('\r\n')
  return body ? `${header}\r\n${body}\r\n` : `${header}\r\n`
}

export function downloadCSV(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
