import { describe, expect, it } from 'vitest'
import { convertEventsToCSV, csvField } from './csv-export'
import type { Event } from '@/payload-types'

describe('csvField', () => {
  it('passes simple strings through unquoted', () => {
    expect(csvField('FERDERICO')).toBe('FERDERICO')
  })

  it('quotes fields containing a comma', () => {
    expect(csvField('AFRO-CARIBBEAN, HOUSE')).toBe('"AFRO-CARIBBEAN, HOUSE"')
  })

  it('quotes and doubles inner double-quotes', () => {
    expect(csvField('Le "Garage"')).toBe('"Le ""Garage"""')
  })

  it('quotes fields containing CR or LF', () => {
    expect(csvField('line1\nline2')).toBe('"line1\nline2"')
    expect(csvField('line1\r\nline2')).toBe('"line1\r\nline2"')
  })

  it('returns empty string for null/undefined', () => {
    expect(csvField(null)).toBe('')
    expect(csvField(undefined)).toBe('')
  })
})

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: '1',
    title: 'Test',
    date: '2026-05-15T20:00:00.000Z',
    time: '20H',
    price: '10',
    location_alt: 'Salle',
    ...overrides,
  } as Event
}

describe('convertEventsToCSV', () => {
  it('escapes a multi-genre free-text field that contains commas', () => {
    const csv = convertEventsToCSV([
      makeEvent({ title: 'FERDERICO', genres: 'HOUSE, UKG, AFRO-CARIBBEAN' }),
    ])
    const lines = csv.split('\r\n').filter(Boolean)
    expect(lines).toHaveLength(2) // header + 1 row
    // header has 6 columns, row must also have exactly 6
    expect(lines[0].split(',')).toHaveLength(6)
    // The quoted genre field keeps its commas inside quotes — verify by parsing minimally
    expect(lines[1]).toContain('"HOUSE, UKG, AFRO-CARIBBEAN"')
  })

  it('keeps category relationships joined by " / " without breaking the row', () => {
    const csv = convertEventsToCSV([
      makeEvent({
        category: [
          { id: 'a', name: 'FOLK/CHANSON' },
          { id: 'b', name: 'JAZZ' },
          { id: 'c', name: 'ROCK/METAL' },
        ] as Event['category'],
      }),
    ])
    const lines = csv.split('\r\n').filter(Boolean)
    expect(lines).toHaveLength(2)
    expect(lines[1]).toContain('FOLK/CHANSON / JAZZ / ROCK/METAL')
  })

  it('escapes commas inside event title', () => {
    const csv = convertEventsToCSV([makeEvent({ title: 'BLACK FLAG, EVIL NIGHT' })])
    const row = csv.split('\r\n')[1]
    expect(row.startsWith('"BLACK FLAG, EVIL NIGHT",')).toBe(true)
  })

  it('emits "Gratuit" for free events', () => {
    const csv = convertEventsToCSV([makeEvent({ price: '0' })])
    expect(csv).toContain('Gratuit')
  })

  it('emits header even when events list is empty', () => {
    const csv = convertEventsToCSV([])
    expect(csv).toBe('Titre,Jour,Lieu,Genres,Prix,Type\r\n')
  })
})
