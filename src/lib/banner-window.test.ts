import { describe, expect, it } from 'vitest'
import {
  bannerActiveQueryBounds,
  bannerOverlapQueryBounds,
  bannerWindowFieldError,
  dayFloorUTC,
  nextDayFloorUTC,
} from './banner-window'

const d = (iso: string) => new Date(iso)

describe('dayFloorUTC / nextDayFloorUTC', () => {
  it('floors any time-of-day to UTC midnight', () => {
    expect(dayFloorUTC(d('2026-07-15T12:00:00.000Z')).toISOString()).toBe(
      '2026-07-15T00:00:00.000Z',
    )
    expect(dayFloorUTC(d('2026-07-15T23:59:59.999Z')).toISOString()).toBe(
      '2026-07-15T00:00:00.000Z',
    )
  })

  it('rolls over month boundaries', () => {
    expect(nextDayFloorUTC(d('2026-07-31T08:00:00.000Z')).toISOString()).toBe(
      '2026-08-01T00:00:00.000Z',
    )
  })
})

describe('bannerActiveQueryBounds', () => {
  // Window is active iff start_date < startBefore AND end_date >= endOnOrAfter.
  const activeAt = (now: Date, start: Date, end: Date) => {
    const { startBefore, endOnOrAfter } = bannerActiveQueryBounds(now)
    return start < startBefore && end >= endOnOrAfter
  }

  const start = d('2026-07-12T12:00:00.000Z')
  const end = d('2026-07-19T12:00:00.000Z')

  it('is inactive the day before the start date', () => {
    expect(activeAt(d('2026-07-11T23:00:00.000Z'), start, end)).toBe(false)
  })

  it('is active on the start date, whatever the stored time-of-day', () => {
    expect(activeAt(d('2026-07-12T00:30:00.000Z'), start, end)).toBe(true)
  })

  it('is still active on the end date (inclusive)', () => {
    expect(activeAt(d('2026-07-19T23:00:00.000Z'), start, end)).toBe(true)
  })

  it('is inactive the day after the end date', () => {
    expect(activeAt(d('2026-07-20T00:30:00.000Z'), start, end)).toBe(false)
  })

  it('handles a single-day window', () => {
    const day = d('2026-07-15T12:00:00.000Z')
    expect(activeAt(d('2026-07-15T18:00:00.000Z'), day, day)).toBe(true)
    expect(activeAt(d('2026-07-16T01:00:00.000Z'), day, day)).toBe(false)
  })
})

describe('bannerOverlapQueryBounds', () => {
  // Docs conflict iff other.start < startBefore AND other.end >= endOnOrAfter.
  const overlaps = (mine: [Date, Date], other: [Date, Date]) => {
    const { startBefore, endOnOrAfter } = bannerOverlapQueryBounds(mine[0], mine[1])
    return other[0] < startBefore && other[1] >= endOnOrAfter
  }

  const mine: [Date, Date] = [d('2026-07-10T12:00:00.000Z'), d('2026-07-15T12:00:00.000Z')]

  it('detects a fully contained window', () => {
    expect(overlaps(mine, [d('2026-07-11T12:00:00.000Z'), d('2026-07-12T12:00:00.000Z')])).toBe(
      true,
    )
  })

  it('conflicts when windows share a single day, even with different stored times', () => {
    // Other starts the day mine ends — later in the day. Same day = conflict.
    expect(overlaps(mine, [d('2026-07-15T18:00:00.000Z'), d('2026-07-20T12:00:00.000Z')])).toBe(
      true,
    )
    // Other ends the day mine starts — earlier in the day. Same day = conflict.
    expect(overlaps(mine, [d('2026-07-05T12:00:00.000Z'), d('2026-07-10T02:00:00.000Z')])).toBe(
      true,
    )
  })

  it('does not conflict with adjacent windows on distinct days', () => {
    expect(overlaps(mine, [d('2026-07-16T00:30:00.000Z'), d('2026-07-20T12:00:00.000Z')])).toBe(
      false,
    )
    expect(overlaps(mine, [d('2026-07-05T12:00:00.000Z'), d('2026-07-09T23:30:00.000Z')])).toBe(
      false,
    )
  })
})

describe('bannerWindowFieldError', () => {
  const day = d('2026-07-15T12:00:00.000Z')

  it('accepts both empty (the normal state)', () => {
    expect(bannerWindowFieldError(null, null)).toBeNull()
  })

  it('rejects a half-filled window', () => {
    expect(bannerWindowFieldError(day, null)).toMatch(/ensemble/)
    expect(bannerWindowFieldError(null, day)).toMatch(/ensemble/)
  })

  it('rejects end before start', () => {
    expect(bannerWindowFieldError(day, d('2026-07-14T12:00:00.000Z'))).toMatch(/postérieure/)
  })

  it('accepts a single-day window even with reversed times within the day', () => {
    expect(bannerWindowFieldError(d('2026-07-15T18:00:00.000Z'), d('2026-07-15T02:00:00.000Z'))).toBeNull()
  })

  it('accepts a normal window', () => {
    expect(bannerWindowFieldError(day, d('2026-07-19T12:00:00.000Z'))).toBeNull()
  })
})
