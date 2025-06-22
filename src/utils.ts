import slugify from 'slugify'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Event } from './payload-types'

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
    timeZone: 'Europe/Paris',
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
  url += category ? (category === 'all' ? '/' : `/genres/${category}`) : '/'

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
  return url
}

export function buildEventUrl(event: Event) {
  const locationInfo = getLocationInfo(event)
  return `/concerts/${locationInfo?.region || event.region}/${locationInfo?.citySlug}/${locationInfo?.locationSlug}/${event.slug}_${event.id}`
}

export function getLocationInfo(event: Event) {
  if (typeof event.location === 'string' || !event.location) {
    return {
      citySlug: slugify(event.location_alt?.split(/[-/,]/)?.at(1) || 'no-location'),
      cityName: slugify(event.location_alt?.split(/[-/,]/)?.at(1) || 'no-location'),
      locationSlug: slugify(event.location_alt?.split(/[-/,]/)?.at(0) || 'no-location'),
      locationName: event.location_alt?.split(/[-/,]/)?.at(0) || 'no-location',
    }
  }
  if (event.location['city V2'] && typeof event.location['city V2'] !== 'string') {
    return {
      citySlug: event.location['city V2'].slug,
      cityName: event.location['city V2'].name,
      locationSlug: event.location.slug,
      locationName: event.location.name,
      region: event.location['city V2'].region,
    }
  }
  return {
    citySlug: event.location.city,
    cityName: event.location.city,
    locationSlug: event.location.slug,
    locationName: event.location.name,
  }
}
