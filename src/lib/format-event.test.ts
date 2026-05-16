import { describe, expect, it } from 'vitest'
import {
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
