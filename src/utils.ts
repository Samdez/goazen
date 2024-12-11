import slugify from 'slugify'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Event } from './payload-types'
import { getPayload, SanitizedConfig } from 'payload'

export function slugifyString(string: string) {
  const slug = string.replace('/', '-')
  return slugify(slug, { replacement: '-', lower: true, trim: true })
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }
  return new Date(date).toLocaleDateString('fr-FR', options)
}

function getEndOfWeek(date: Date) {
  const lastday = date.getDate() - (date.getDay() - 1) + 6
  return new Date(date.setDate(lastday)).toISOString().split('T')[0]
}

export function createHref({
  time,
  category,
  activeTime,
}: {
  time?: 'day' | 'week'
  category?: string
  activeTime?: string
}): string {
  const today = new Date().toISOString().split('T')[0]
  const dayLimit = `startDate=${today}&endDate=${today}&activeTime=day`
  const weekLimit = `startDate=${today}&endDate=${getEndOfWeek(new Date())}&activeTime=week`
  let url = ''
  url += category ? `/genres/${category}` : '/'

  if (!activeTime) {
    if (time === 'day') return `${url}?${dayLimit}`
    if (time === 'week') return `${url}?${weekLimit}`
  }
  if (activeTime === 'day') {
    if (time === 'day') return url
    if (time === 'week') return `${url}?${weekLimit}`
  }
  if (activeTime === 'week') {
    if (time === 'day') return `${url}?${dayLimit}`
    if (time === 'week') return url
  }
  return ''
}

export function buildEventUrl(event: Event) {
  const locationName = event.location
    ? !(typeof event.location === 'string') && event.location?.name
    : slugify(event.location_alt?.split(/[-/,]/)?.at(0) || 'no-location')
  const locationCity = event.location
    ? !(typeof event.location === 'string') && event.location?.city
    : slugify(event.location_alt?.split(/[-/,]/)?.at(1) || 'no-location')
  const locationSlug = !(typeof event.location === 'string') && event.location?.slug

  return `/concerts/${locationCity}/${locationSlug || locationName}/${event.slug}_${event.id}`
}

export async function buildEventSEOTitle(
  doc: any,
  config: SanitizedConfig | Promise<SanitizedConfig>,
) {
  const payload = await getPayload({ config })
  const location =
    doc.location &&
    (await payload.findByID({
      collection: 'locations',
      id: doc.location,
    }))
  const date = new Date(doc.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const locationName = location?.name || doc.location_alt.split(/[-/,]/)?.at(0) || ''
  const cityName = location?.city || doc.location_alt.split(/[-/,]/)?.at(1) || ''
  const title = `${doc.title} - ${locationName.trim()}, ${cityName.trim()} ${date}`

  const maxLength = 45
  const truncatedTitle =
    title.length <= maxLength
      ? `${title} | Concert`
      : `${title.substring(0, maxLength)}... | Concert`

  return truncatedTitle
}

export async function buildLocationSEOTitle(
  doc: any,
  config: SanitizedConfig | Promise<SanitizedConfig>,
) {
  console.log(doc)

  const payload = await getPayload({ config })
  const location =
    doc.location &&
    (await payload.findByID({
      collection: 'locations',
      id: doc.location,
    }))
  const date = new Date(doc.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const locationName = location?.name || doc.location_alt.split(/[-/,]/)?.at(0) || ''
  const cityName = location?.city || doc.location_alt.split(/[-/,]/)?.at(1) || ''
  const title = `${doc.title} - ${locationName.trim()}, ${cityName.trim()} ${date}`

  const maxLength = 45
  const truncatedTitle =
    title.length <= maxLength
      ? `${title} | Concert`
      : `${title.substring(0, maxLength)}... | Concert`

  return truncatedTitle
}

export async function buildEventSEODescription(
  doc: any,
  config: SanitizedConfig | Promise<SanitizedConfig>,
) {
  const payload = await getPayload({ config })
  const location =
    doc.location &&
    (await payload.findByID({
      collection: 'locations',
      id: doc.location,
    }))
  const date = new Date(doc.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const locationName = location?.name || doc.location_alt.split(/[-/,]/)?.at(0) || ''
  const cityName = location?.city || doc.location_alt.split(/[-/,]/)?.at(1) || ''

  const baseDesc = `Découvrez ${doc.title} en concert à ${locationName.trim()} ${cityName.trim()} le ${date}.`
  const description = doc.description
    ? `${baseDesc} ${doc.description.substring(0, 145 - baseDesc.length)}...`
    : `${baseDesc} Réservez vos places pour ce concert live au Pays Basque.`

  return description
}
