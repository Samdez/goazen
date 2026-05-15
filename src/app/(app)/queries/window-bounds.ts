export type Region = 'pays-basque' | 'landes'

export interface WindowOpts {
  region?: Region
  city?: string
  genres?: string[]
  free?: boolean
  limit?: number
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
  const start = new Date(now)
  const dow = start.getUTCDay()
  const daysUntilFriday = (5 - dow + 7) % 7
  start.setUTCDate(start.getUTCDate() + daysUntilFriday)
  start.setUTCHours(16, 0, 0, 0)

  const end = new Date(start)
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
