import { describe, expect, it } from 'vitest'
import { eventJsonLd, eventToJsonLd, eventsItemListJsonLd } from './structured-data'
import type { Event } from '@/payload-types'

const atabal = {
  id: 'loc1',
  name: 'Atabal',
  slug: 'atabal',
  'city V2': { id: 'c1', name: 'Biarritz', slug: 'biarritz', region: 'pays-basque' },
}

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'evt1',
    title: 'Concert de test',
    slug: 'concert-de-test',
    date: '2026-09-21T14:00:00.000Z',
    time: '20h30',
    location: atabal,
    ...overrides,
  } as unknown as Event
}

describe('eventToJsonLd', () => {
  it('publishes the time shown on the page, not the arbitrary one stored on `date`', () => {
    expect(eventToJsonLd(makeEvent()).startDate).toBe('2026-09-21T20:30:00+02:00')
  })

  it('falls back to the day alone when no time is known', () => {
    expect(eventToJsonLd(makeEvent({ time: null })).startDate).toBe('2026-09-21')
  })

  it('types a referenced venue as MusicVenue', () => {
    const data = eventToJsonLd(makeEvent()) as { location: Record<string, unknown> }
    expect(data.location['@type']).toBe('MusicVenue')
    expect(data.location.name).toBe('Atabal')
    expect(data.location.address).toMatchObject({
      addressLocality: 'Biarritz',
      addressRegion: 'Pays Basque',
      addressCountry: 'FR',
    })
  })

  it('keeps a free-text venue as a generic Place', () => {
    const event = makeEvent({ location: null, location_alt: 'Chez Machin', region: 'landes' })
    const data = eventToJsonLd(event) as { location: Record<string, unknown> }
    expect(data.location['@type']).toBe('Place')
  })

  it('puts genres in `genre` and never invents a performer', () => {
    const data = eventToJsonLd(makeEvent({ genres: 'Deep House, Techno' }))
    expect(data).toMatchObject({ genre: ['Deep House', 'Techno'] })
    expect(data).not.toHaveProperty('performer')
  })

  it('falls back to categories when the free-text genre is empty', () => {
    const event = makeEvent({
      genres: null,
      category: [{ id: 'cat1', name: 'Folk/Chanson', slug: 'folk-chanson' }],
    } as Partial<Event>)
    expect(eventToJsonLd(event)).toMatchObject({ genre: ['Folk/Chanson'] })
  })

  it('omits `genre` entirely when nothing is known', () => {
    expect(eventToJsonLd(makeEvent({ genres: null, category: [] }))).not.toHaveProperty('genre')
  })

  it('carries no @context — it belongs to the published root', () => {
    expect(eventToJsonLd(makeEvent())).not.toHaveProperty('@context')
  })
})

describe('eventJsonLd', () => {
  it('is the same event, publishable on its own', () => {
    const event = makeEvent()
    expect(eventJsonLd(event)).toEqual({
      '@context': 'https://schema.org',
      ...eventToJsonLd(event),
    })
  })
})

describe('eventsItemListJsonLd', () => {
  it('keeps one @context at the list root only', () => {
    const list = eventsItemListJsonLd([makeEvent()]) as {
      '@context': string
      itemListElement: Array<{ item: Record<string, unknown> }>
    }
    expect(list['@context']).toBe('https://schema.org')
    expect(list.itemListElement[0].item).not.toHaveProperty('@context')
    expect(list.itemListElement[0].item.startDate).toBe('2026-09-21T20:30:00+02:00')
  })
})
