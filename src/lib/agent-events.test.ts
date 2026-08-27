import { describe, expect, it } from 'vitest'
import {
  computeWeekendWindow,
  formatAgentEventKind,
  formatAgentPrice,
  formatTimeRange,
  mapEventToAgentEvent,
  sortAgentEvents,
  splitGenres,
} from './agent-events'
import type { Event as PayloadEvent } from '@/payload-types'

// 12:00 UTC = 14:00 Paris in August (CEST) — safely mid-day on the given date
const parisNoon = (date: string) => new Date(`${date}T12:00:00Z`)

describe('computeWeekendWindow', () => {
  it('monday → thursday of the same week', () => {
    expect(computeWeekendWindow(parisNoon('2026-08-24'))).toEqual({
      startDate: '2026-08-27',
      endDate: '2026-08-30',
    })
  })

  it('thursday → window starts today', () => {
    expect(computeWeekendWindow(parisNoon('2026-08-27'))).toEqual({
      startDate: '2026-08-27',
      endDate: '2026-08-30',
    })
  })

  it('friday/sunday → still the ongoing weekend (thursday included)', () => {
    expect(computeWeekendWindow(parisNoon('2026-08-28')).startDate).toBe('2026-08-27')
    expect(computeWeekendWindow(parisNoon('2026-08-30')).startDate).toBe('2026-08-27')
  })

  it('paris date used, not UTC (23:30 UTC wednesday = thursday in paris)', () => {
    expect(computeWeekendWindow(new Date('2026-08-26T23:30:00Z')).startDate).toBe('2026-08-27')
  })
})

describe('formatTimeRange', () => {
  it('parses ranges crossing midnight with ASCII hyphen', () => {
    expect(formatTimeRange('23h-1h30')).toBe('23:00-01:30')
    expect(formatTimeRange('18:00 – 02:00')).toBe('18:00-02:00')
    expect(formatTimeRange('19h à 23h')).toBe('19:00-23:00')
  })

  it('normalizes after-midnight "26h" notation', () => {
    expect(formatTimeRange('20h-26h')).toBe('20:00-02:00')
  })

  it('single start time', () => {
    expect(formatTimeRange('19h30')).toBe('19:30')
  })

  it('null on missing/unparseable', () => {
    expect(formatTimeRange(null)).toBeNull()
    expect(formatTimeRange('tba')).toBeNull()
    expect(formatTimeRange('en soirée')).toBeNull()
  })
})

describe('field mapping', () => {
  it('event_kind labels with CONCERT default', () => {
    expect(formatAgentEventKind('dj_set')).toBe('DJ SET')
    expect(formatAgentEventKind('live_show')).toBe('LIVE SHOW')
    expect(formatAgentEventKind('other')).toBe('AUTRE')
    expect(formatAgentEventKind(null)).toBe('CONCERT')
  })

  it('genres split and uppercased, empty array if none', () => {
    expect(splitGenres('ebm, italo / trance')).toEqual(['EBM', 'ITALO', 'TRANCE'])
    expect(splitGenres(null)).toEqual([])
  })

  it('price: never invents Gratuit, null when unknown', () => {
    expect(formatAgentPrice({ price: 'gratuit' })).toBe('Gratuit')
    expect(formatAgentPrice({ price: '15' })).toBe('15 €')
    expect(formatAgentPrice({ price: null })).toBeNull()
    expect(formatAgentPrice({ price: 'à confirmer' })).toBeNull()
  })
})

const baseEvent = {
  id: '1',
  title: 'Le Coupe-Gorge',
  date: '2026-08-28T18:00:00.000Z',
  time: '18h-2h',
  region: null,
  genres: 'EBM, Italo',
  price: 'gratuit',
  event_kind: 'dj_set',
  ticketing_url: 'https://example.com/t',
  slug: 'le-coupe-gorge',
  contact_email: 'secret@example.com',
  updatedAt: '',
  createdAt: '',
  location: {
    id: 'loc1',
    name: 'Astra',
    'city V2': { id: 'c1', name: 'Biarritz', region: 'pays-basque', updatedAt: '', createdAt: '' },
    updatedAt: '',
    createdAt: '',
  },
} as unknown as PayloadEvent

describe('mapEventToAgentEvent', () => {
  it('maps the full shape and never leaks contact_email', () => {
    const mapped = mapEventToAgentEvent(baseEvent, 'https://goazen.example/')
    expect(mapped).toEqual({
      title: 'Le Coupe-Gorge',
      date: '2026-08-28',
      time: '18:00-02:00',
      day: 'vendredi',
      venue: 'ASTRA',
      city: 'BIARRITZ',
      region: 'pays-basque',
      genres: ['EBM', 'ITALO'],
      price: 'Gratuit',
      event_kind: 'DJ SET',
      image: '',
      ticketing_url: 'https://example.com/t',
      slug: 'le-coupe-gorge',
    })
    expect('contact_email' in mapped).toBe(false)
  })

  it('legacy location (city V2 null) falls back to city slug + event region', () => {
    const legacy = {
      ...baseEvent,
      region: 'landes',
      location: { id: 'l2', name: 'Le Club', city: 'saint-vincent-de-tyrosse' },
    } as unknown as PayloadEvent
    const mapped = mapEventToAgentEvent(legacy, '')
    expect(mapped.city).toBe('SAINT VINCENT DE TYROSSE')
    expect(mapped.region).toBe('landes')
  })

  it('location_alt event → venue from free text', () => {
    const alt = {
      ...baseEvent,
      location: null,
      location_alt: "Plage d'Hossegor",
      region: 'landes',
    } as unknown as PayloadEvent
    const mapped = mapEventToAgentEvent(alt, '')
    expect(mapped.venue).toBe("PLAGE D'HOSSEGOR")
    expect(mapped.region).toBe('landes')
  })

  it('relative image URL becomes absolute', () => {
    const withImage = {
      ...baseEvent,
      image: { id: 'm1', url: '/api/medias/file/x.jpg', updatedAt: '', createdAt: '' },
    } as unknown as PayloadEvent
    expect(mapEventToAgentEvent(withImage, 'https://goazen.example').image).toBe(
      'https://goazen.example/api/medias/file/x.jpg',
    )
  })
})

describe('sortAgentEvents', () => {
  it('date asc, then start time asc, null times last', () => {
    const mk = (date: string, time: string | null, slug: string) =>
      ({ ...mapEventToAgentEvent(baseEvent, ''), date, time, slug }) as ReturnType<
        typeof mapEventToAgentEvent
      >
    const sorted = sortAgentEvents([
      mk('2026-08-29', '20:00-23:00', 'c'),
      mk('2026-08-28', null, 'b'),
      mk('2026-08-28', '19:00', 'a'),
    ])
    expect(sorted.map((e) => e.slug)).toEqual(['a', 'b', 'c'])
  })
})
