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

// The Event `date` field stores the event day with an arbitrary time-of-day
// (usually noon-ish UTC); the real start time lives in the separate `time`
// text field. So windows match events by day, not by show start time.
export function tonightBounds(now: Date = new Date()): WindowBounds {
  const start = new Date(now)
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 1)
  end.setUTCHours(6, 0, 0, 0)
  return { start, end }
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
  friday.setUTCHours(0, 0, 0, 0)

  const today = new Date(now)
  today.setUTCHours(0, 0, 0, 0)

  // If we're already past Friday (Fri/Sat/Sun), start from today so events
  // for the current day still surface.
  const start = today > friday ? today : friday

  const end = new Date(friday)
  end.setUTCDate(end.getUTCDate() + 3)
  end.setUTCHours(0, 0, 0, 0)

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
