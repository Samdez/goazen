import { describe, expect, it } from 'vitest'
import {
  collectEventGenres,
  eventStartDateIso,
  parseEventTime,
  formatEventGenres,
  formatEventType,
  formatGenre,
  formatPrice,
  formatTime,
  formatVenue,
  isTonight,
} from './format-event'
import type { Event } from '@/payload-types'

const NBSP = ' '

describe('formatTime', () => {
  it('passes through clean inputs', () => {
    expect(formatTime('19h30')).toBe('19h30')
    expect(formatTime('20h')).toBe('20h')
    expect(formatTime('19h')).toBe('19h')
  })

  it('normalizes casing and whitespace', () => {
    expect(formatTime('19H30')).toBe('19h30')
    expect(formatTime('19h30 ')).toBe('19h30')
    expect(formatTime('17 h')).toBe('17h')
    expect(formatTime('16H')).toBe('16h')
    expect(formatTime('20H')).toBe('20h')
  })

  it('treats colon as h separator', () => {
    expect(formatTime('19:30')).toBe('19h30')
  })

  it('parses ranges with all observed separators', () => {
    expect(formatTime('18h-22h')).toBe(`18h${'–'}22h`)
    expect(formatTime('23h - 6h')).toBe(`23h${'–'}6h`)
    expect(formatTime('18h/2h')).toBe(`18h${'–'}2h`)
    expect(formatTime('22h a 2h')).toBe(`22h${'–'}2h`)
    expect(formatTime('20h - 1h30')).toBe(`20h${'–'}1h30`)
    expect(formatTime('22h/1H30')).toBe(`22h${'–'}1h30`)
    expect(formatTime('00H - 06H30')).toBe(`0h${'–'}6h30`)
  })

  it('rejects garbage', () => {
    expect(formatTime('0')).toBeNull()
    expect(formatTime('')).toBeNull()
    expect(formatTime(null)).toBeNull()
    expect(formatTime(undefined)).toBeNull()
  })
})

describe('formatPrice', () => {
  it('handles sold-out first', () => {
    expect(formatPrice({ price: '25', sold_out: true })).toBe('Complet')
  })

  it('returns Gratuit for free variants', () => {
    expect(formatPrice({ price: '0' })).toBe('Gratuit')
    expect(formatPrice({ price: 'Gratuit' })).toBe('Gratuit')
    expect(formatPrice({ price: 'Gratuit ' })).toBe('Gratuit')
    expect(formatPrice({ price: 'gratuit' })).toBe('Gratuit')
    expect(formatPrice({ price: 'Free!!' })).toBe('Gratuit')
  })

  it('formats numeric strings with NBSP €', () => {
    expect(formatPrice({ price: '30' })).toBe(`30${NBSP}€`)
    expect(formatPrice({ price: '25' })).toBe(`25${NBSP}€`)
  })

  it('normalizes existing € strings', () => {
    expect(formatPrice({ price: '20€' })).toBe(`20${NBSP}€`)
    expect(formatPrice({ price: '12€' })).toBe(`12${NBSP}€`)
  })

  it('returns "Prix à confirmer" for empty / placeholder', () => {
    expect(formatPrice({ price: null })).toBe('Prix à confirmer')
    expect(formatPrice({ price: '' })).toBe('Prix à confirmer')
    expect(formatPrice({ price: 'Non précisé ' })).toBe('Prix à confirmer')
    expect(formatPrice({ price: 'N/A' })).toBe('Prix à confirmer')
  })

  it('preserves multi-tier descriptions while normalizing €', () => {
    expect(formatPrice({ price: '8€ - 12€' })).toBe(`8${NBSP}€ - 12${NBSP}€`)
    expect(formatPrice({ price: '10€ en prévente / 12€ sur place' })).toBe(
      `10${NBSP}€ en prévente / 12${NBSP}€ sur place`,
    )
  })

  it('expands bare integer tiers', () => {
    expect(formatPrice({ price: '12/15/22' })).toBe(`12${NBSP}€ / 15${NBSP}€ / 22${NBSP}€`)
  })

  it('never emits "Gratuit €"', () => {
    expect(formatPrice({ price: '0' })).not.toContain('€')
    expect(formatPrice({ price: 'Gratuit' })).not.toContain('€')
  })
})

describe('formatVenue', () => {
  it('formats venue with city V2', () => {
    const ev = {
      location: {
        id: 'l1',
        name: 'Atabal',
        'city V2': { id: 'c1', name: 'Biarritz' },
      },
    } as unknown as Event
    expect(formatVenue(ev)).toBe('Atabal · Biarritz')
  })

  it('falls back to legacy city enum prettified', () => {
    const ev = {
      location: {
        id: 'l1',
        name: 'Le Garage',
        city: 'saint-jean-de-luz',
      },
    } as unknown as Event
    expect(formatVenue(ev)).toBe('Le Garage · Saint Jean De Luz')
  })

  it('uses location_alt if no relationship', () => {
    const ev = { location: null, location_alt: 'Salle B' } as unknown as Event
    expect(formatVenue(ev)).toBe('Salle B')
  })

  it('returns null when nothing usable', () => {
    expect(formatVenue({ location: null, location_alt: null } as unknown as Event)).toBeNull()
  })
})

describe('formatGenre', () => {
  it('normalizes mixed separators to · and title-cases', () => {
    expect(formatGenre('Indie rock, folk rocK')).toBe('Indie Rock · Folk Rock')
    expect(formatGenre('House / Caribéen / UK / DNB / Techno')).toBe('House · Caribéen · UK · DNB…')
    expect(formatGenre('Urban Pop • RNB')).toBe('Urban Pop · RnB')
    expect(formatGenre('black x death x thrash x nihilism')).toBe(
      'Black · Death · Thrash · Nihilism',
    )
  })

  it('preserves single tokens', () => {
    expect(formatGenre('Hard disco')).toBe('Hard Disco')
    expect(formatGenre('ELECTRO')).toBe('Electro')
  })

  it('returns null when empty', () => {
    expect(formatGenre('')).toBeNull()
    expect(formatGenre(null)).toBeNull()
    expect(formatGenre(undefined)).toBeNull()
  })
})

describe('collectEventGenres', () => {
  const ev = (category: unknown, genres?: string | null) =>
    ({ category, genres }) as Pick<Event, 'category' | 'genres'>

  it('shows the free text when it is filled', () => {
    expect(collectEventGenres(ev([{ id: 'a', name: 'Electro' }], 'deep house'))).toEqual([
      'Deep House',
    ])
    expect(formatEventGenres(ev(null, 'deep house, acid'))).toBe('Deep House · Acid')
  })

  it('falls back to the categories when the free text is empty', () => {
    expect(collectEventGenres(ev([{ id: 'a', name: 'Techno' }], null))).toEqual(['Techno'])
    expect(collectEventGenres(ev([{ id: 'a', name: 'Techno' }], '   '))).toEqual(['Techno'])
    expect(
      formatEventGenres(ev([{ id: 'a', name: 'Electro' }, { id: 'b', name: 'Techno' }], '')),
    ).toBe('Electro · Techno')
  })

  it('never mixes the two sources', () => {
    expect(
      collectEventGenres(ev([{ id: 'a', name: 'Rock/Metal' }], 'garage rock')),
    ).toEqual(['Garage Rock'])
  })

  it('ignores the "Autre" category — it carries no genre', () => {
    expect(collectEventGenres(ev([{ id: 'a', name: 'Autre' }], null))).toEqual([])
    expect(formatEventGenres(ev([{ id: 'a', name: 'Autre' }], null))).toBeNull()
    expect(
      collectEventGenres(ev([{ id: 'a', name: 'Autre' }, { id: 'b', name: 'Rock' }], null)),
    ).toEqual(['Rock'])
  })

  it('ignores unpopulated (string) category relationships', () => {
    expect(collectEventGenres(ev(['someId'], null))).toEqual([])
  })

  it('returns null from formatEventGenres when there is nothing to show', () => {
    expect(formatEventGenres(ev(null, null))).toBeNull()
    expect(formatEventGenres(ev([], ''))).toBeNull()
  })

  it('can skip title-casing', () => {
    expect(collectEventGenres(ev(null, 'HOUSE, UKG'), { titleCase: false })).toEqual([
      'HOUSE',
      'UKG',
    ])
    expect(
      collectEventGenres(ev([{ id: 'a', name: 'FOLK/CHANSON' }], null), { titleCase: false }),
    ).toEqual(['FOLK/CHANSON'])
  })
})

describe('formatEventType', () => {
  it('translates known kinds', () => {
    expect(formatEventType('dj_set')).toBe('DJ Set')
    expect(formatEventType('live_show')).toBe('Live')
  })
  it('returns null for "other" so the pill is hidden', () => {
    expect(formatEventType('other')).toBeNull()
    expect(formatEventType(null)).toBeNull()
    expect(formatEventType(undefined)).toBeNull()
  })
})

describe('isTonight', () => {
  it('matches same Paris day', () => {
    const now = new Date('2026-05-12T10:00:00Z') // ~12:00 Paris
    const ev = new Date('2026-05-12T19:30:00Z')
    expect(isTonight(ev, now)).toBe(true)
  })

  it('matches post-midnight events before 06:00', () => {
    const now = new Date('2026-05-12T22:00:00Z') // late evening Paris
    const ev = new Date('2026-05-13T03:00:00Z') // 05:00 Paris next day
    expect(isTonight(ev, now)).toBe(true)
  })

  it('rejects events tomorrow afternoon', () => {
    const now = new Date('2026-05-12T10:00:00Z')
    const ev = new Date('2026-05-13T19:30:00Z')
    expect(isTonight(ev, now)).toBe(false)
  })
})

describe('parseEventTime', () => {
  it('reads a single time', () => {
    expect(parseEventTime('20h30')).toEqual({ hour: 20, minute: 30 })
    expect(parseEventTime('21H')).toEqual({ hour: 21, minute: 0 })
    expect(parseEventTime('19:45')).toEqual({ hour: 19, minute: 45 })
  })

  it('keeps only the start of a range', () => {
    expect(parseEventTime('20h - 1h30')).toEqual({ hour: 20, minute: 0 })
    expect(parseEventTime('22h a 2h')).toEqual({ hour: 22, minute: 0 })
  })

  it('returns null for unreadable input', () => {
    expect(parseEventTime('0')).toBeNull()
    expect(parseEventTime('à confirmer')).toBeNull()
    expect(parseEventTime(null)).toBeNull()
  })
})

describe('eventStartDateIso', () => {
  it('merges the Paris day of `date` with the free-text `time`', () => {
    // `date` carries an arbitrary time of day (14:00Z) — only the day matters.
    expect(eventStartDateIso({ date: '2026-09-21T14:00:00.000Z', time: '20h30' })).toBe(
      '2026-09-21T20:30:00+02:00',
    )
  })

  it('uses the winter offset outside DST', () => {
    expect(eventStartDateIso({ date: '2026-01-15T14:00:00.000Z', time: '21h' })).toBe(
      '2026-01-15T21:00:00+01:00',
    )
  })

  it('takes the start of a range', () => {
    expect(eventStartDateIso({ date: '2026-06-12T14:00:00.000Z', time: '20h - 1h30' })).toBe(
      '2026-06-12T20:00:00+02:00',
    )
  })

  it('rolls past-midnight hours (25h) to the next day', () => {
    expect(eventStartDateIso({ date: '2026-06-12T14:00:00.000Z', time: '25h' })).toBe(
      '2026-06-13T01:00:00+02:00',
    )
  })

  it('reads the day in Paris, not in UTC', () => {
    // 22:00Z on the 21st is already the 22nd in Paris — the page says so too.
    expect(eventStartDateIso({ date: '2026-09-21T22:00:00.000Z', time: '20h30' })).toBe(
      '2026-09-22T20:30:00+02:00',
    )
  })

  it('falls back to the day alone when `time` is unusable', () => {
    expect(eventStartDateIso({ date: '2026-09-21T14:00:00.000Z', time: null })).toBe('2026-09-21')
    expect(eventStartDateIso({ date: '2026-09-21T14:00:00.000Z', time: 'à confirmer' })).toBe(
      '2026-09-21',
    )
  })

  it('passes an unparsable `date` through untouched', () => {
    expect(eventStartDateIso({ date: 'pas une date', time: '20h30' })).toBe('pas une date')
  })
})
