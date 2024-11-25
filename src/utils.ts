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
