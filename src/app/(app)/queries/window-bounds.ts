import type { Where } from 'payload'

export type Region = 'pays-basque' | 'landes'

export interface WindowOpts {
  region?: Region
  city?: string
  genres?: string[]
  limit?: number
}

export function commonFilters(opts: WindowOpts): Where[] {
  const out: Where[] = []
  if (opts.region) {
    out.push({
      or: [
        { 'location.city V2.region': { equals: opts.region } },
        { region: { equals: opts.region } },
      ],
    })
  }
  if (opts.city) {
    out.push({ 'location.city V2.slug': { equals: opts.city } })
  }
  if (opts.genres && opts.genres.length > 0) {
    out.push({ 'category.slug': { in: opts.genres } })
  }
  return out
}

export interface WindowBounds {
  start: Date
  end: Date
}

export function tonightBounds(now: Date = new Date()): WindowBounds {
  const end = new Date(now)
  end.setUTCHours(end.getUTCHours() + 24)
  end.setUTCHours(6, 0, 0, 0)
  return { start: now, end }
}

export function thisWeekBounds(now: Date = new Date()): WindowBounds {
  const start = new Date(now)
  start.setUTCHours(start.getUTCHours() + 24)
  start.setUTCHours(6, 0, 0, 0)

  const end = new Date(now)
  const dow = end.getUTCDay()
  const daysUntilSunday = (7 - dow) % 7 || 7
  end.setUTCDate(end.getUTCDate() + daysUntilSunday)
  end.setUTCHours(22, 0, 0, 0)

  return { start, end }
}

export function weekendBounds(now: Date = new Date()): WindowBounds {
  const dow = now.getUTCDay()
  // Sun: -2, Mon: 4, Tue: 3, Wed: 2, Thu: 1, Fri: 0, Sat: -1
  const fridayDelta = dow === 0 ? -2 : dow === 6 ? -1 : 5 - dow

  const friday = new Date(now)
  friday.setUTCDate(friday.getUTCDate() + fridayDelta)
  friday.setUTCHours(16, 0, 0, 0)

  const start = now > friday ? new Date(now) : friday

  const end = new Date(friday)
  end.setUTCDate(end.getUTCDate() + 2)
  end.setUTCHours(22, 0, 0, 0)

  return { start, end }
}

export function upcomingBounds(now: Date = new Date()): WindowBounds {
  const start = new Date(now)
  const dow = start.getUTCDay()
  const daysUntilMonday = (1 - dow + 7) % 7 || 7
  start.setUTCDate(start.getUTCDate() + daysUntilMonday)
  start.setUTCHours(6, 0, 0, 0)

  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 90)

  return { start, end }
}
