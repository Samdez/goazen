import { describe, expect, it } from 'vitest'
import { EVENTS_LIST_TAG, eventTag, locationEventsTag } from './cache-tags'
import { parisDayStart, previousParisDay, tagsForEndedEvents } from './daily-revalidation'

describe('parisDayStart', () => {
  it('donne minuit à Paris en heure d’été (UTC+2)', () => {
    expect(parisDayStart(new Date('2026-07-14T15:00:00Z')).toISOString()).toBe(
      '2026-07-13T22:00:00.000Z',
    )
  })

  it('donne minuit à Paris en heure d’hiver (UTC+1)', () => {
    expect(parisDayStart(new Date('2026-12-01T15:00:00Z')).toISOString()).toBe(
      '2026-11-30T23:00:00.000Z',
    )
  })

  it('rattache 23 h 30 UTC au lendemain parisien', () => {
    expect(parisDayStart(new Date('2026-07-14T23:30:00Z')).toISOString()).toBe(
      '2026-07-14T22:00:00.000Z',
    )
  })

  it('gère les jours de changement d’heure', () => {
    // Passage à l'heure d'été le 29 mars 2026, à l'heure d'hiver le 25 octobre.
    expect(parisDayStart(new Date('2026-03-29T12:00:00Z')).toISOString()).toBe(
      '2026-03-28T23:00:00.000Z',
    )
    expect(parisDayStart(new Date('2026-10-25T12:00:00Z')).toISOString()).toBe(
      '2026-10-24T22:00:00.000Z',
    )
  })
})

describe('previousParisDay', () => {
  it('couvre la veille parisienne à l’heure du cron (après minuit UTC)', () => {
    // 0 h 30 UTC le 3 octobre = 2 h 30 à Paris le 3 octobre.
    const { start, end } = previousParisDay(new Date('2026-10-03T00:30:00Z'))
    expect(start.toISOString()).toBe('2026-10-01T22:00:00.000Z')
    expect(end.toISOString()).toBe('2026-10-02T22:00:00.000Z')
  })

  it('couvre une journée de 25 h au passage à l’heure d’hiver', () => {
    const { start, end } = previousParisDay(new Date('2026-10-26T00:30:00Z'))
    expect(start.toISOString()).toBe('2026-10-24T22:00:00.000Z')
    expect(end.toISOString()).toBe('2026-10-25T23:00:00.000Z')
  })
})

describe('tagsForEndedEvents', () => {
  it('révalide les listes, chaque événement et chaque salle une seule fois', () => {
    const tags = tagsForEndedEvents([
      { id: 'e1', location: 'loc1' },
      { id: 'e2', location: { id: 'loc1' } },
      { id: 'e3', location: null },
    ])
    expect(tags).toEqual([
      EVENTS_LIST_TAG,
      eventTag('e1'),
      locationEventsTag('loc1'),
      eventTag('e2'),
      eventTag('e3'),
    ])
  })

  it('révalide au moins les listes quand aucun événement n’a eu lieu', () => {
    expect(tagsForEndedEvents([])).toEqual([EVENTS_LIST_TAG])
  })
})
