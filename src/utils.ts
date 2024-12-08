import slugify from 'slugify'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

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
