import { describe, expect, it } from 'vitest'
import {
  buildEventUrl,
  getLocationInfo,
  UNKNOWN_CITY_SEGMENT,
  UNKNOWN_REGION_SEGMENT,
  UNKNOWN_VENUE_SEGMENT,
} from './utils'
import type { Event } from './payload-types'

function event(overrides: Partial<Event>): Event {
  return {
    id: '6aac31c974fa434e099b88d7',
    title: 'Gaëtane',
    slug: 'gaetane',
    date: '2026-09-23T14:00:00.000Z',
    ...overrides,
  } as unknown as Event
}

const withCityV2 = event({
  location: {
    id: 'loc1',
    name: 'Atabal',
    slug: 'atabal',
    'city V2': { id: 'c1', name: 'Biarritz', slug: 'biarritz', region: 'pays-basque' },
  },
} as Partial<Event>)

describe('getLocationInfo', () => {
  it('prefers the city V2 relation, which also carries the region', () => {
    expect(getLocationInfo(withCityV2)).toMatchObject({
      citySlug: 'biarritz',
      cityName: 'Biarritz',
      locationSlug: 'atabal',
      locationName: 'Atabal',
      region: 'pays-basque',
    })
  })

  it('falls back to the legacy `city` enum of a location not yet migrated', () => {
    const ev = event({
      region: 'landes',
      location: { id: 'loc2', name: 'Le Baya', slug: 'le-baya', city: 'capbreton' },
    } as Partial<Event>)
    expect(getLocationInfo(ev)).toMatchObject({
      citySlug: 'capbreton',
      cityName: 'capbreton',
      region: 'landes',
    })
  })

  it('reads the city from a free-text venue, venue first', () => {
    const ev = event({ region: 'landes', location_alt: 'Quiksilver Store - Soorts' })
    expect(getLocationInfo(ev)).toMatchObject({
      citySlug: 'Soorts',
      cityName: 'Soorts',
      locationSlug: 'Quiksilver-Store',
      locationName: 'Quiksilver Store',
    })
  })

  it('accepts the other separators used by contributors', () => {
    expect(getLocationInfo(event({ location_alt: 'Le Baya, Capbreton' })).citySlug).toBe('Capbreton')
    expect(getLocationInfo(event({ location_alt: 'Le Baya / Capbreton' })).citySlug).toBe('Capbreton')
  })

  it('never returns the `no-location` sentinel when the city is unknown', () => {
    const info = getLocationInfo(event({ region: 'pays-basque', location_alt: 'La Luna negra' }))
    expect(info.citySlug).toBe(UNKNOWN_CITY_SEGMENT)
    expect(info.citySlug).not.toContain('no-location')
    // On garde le nom du lieu : c'est la seule chose qu'on sait vraiment.
    expect(info).toMatchObject({
      cityName: null,
      locationSlug: 'La-Luna-negra',
      locationName: 'La Luna negra',
      region: 'pays-basque',
    })
  })

  it('falls back on both segments when nothing at all is known', () => {
    expect(getLocationInfo(event({ region: null, location_alt: null }))).toMatchObject({
      citySlug: UNKNOWN_CITY_SEGMENT,
      locationSlug: UNKNOWN_VENUE_SEGMENT,
      region: UNKNOWN_REGION_SEGMENT,
      cityName: null,
      locationName: null,
    })
  })
})

describe('buildEventUrl', () => {
  it('builds the canonical URL of a fully resolved event', () => {
    expect(buildEventUrl(withCityV2)).toBe(
      '/concerts/pays-basque/biarritz/atabal/gaetane_6aac31c974fa434e099b88d7',
    )
  })

  it('publishes no internal sentinel when the city is unknown', () => {
    const url = buildEventUrl(event({ region: 'pays-basque', location_alt: 'La Luna negra' }))
    expect(url).toBe(
      '/concerts/pays-basque/ville-non-precisee/La-Luna-negra/gaetane_6aac31c974fa434e099b88d7',
    )
    expect(url).not.toContain('no-location')
    expect(url).not.toContain('undefined')
  })

  it('keeps four segments so the URL cannot collide with a venue page', () => {
    const url = buildEventUrl(event({ region: null, location_alt: null }))
    expect(url.split('/').filter(Boolean)).toHaveLength(5) // concerts + 4
  })
})
