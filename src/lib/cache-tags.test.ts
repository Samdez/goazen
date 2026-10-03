import { describe, expect, it } from 'vitest'
import {
  EVENTS_LIST_TAG,
  eventTag,
  eventsQueryTags,
  locationEventsTag,
  tagsForEventChange,
} from './cache-tags'

describe('eventsQueryTags', () => {
  it('rattache une requête par salle au seul tag de la salle', () => {
    expect(eventsQueryTags({ locationId: 'loc1' })).toEqual([locationEventsTag('loc1')])
  })

  it('rattache les autres requêtes au tag des listes', () => {
    expect(eventsQueryTags({})).toEqual([EVENTS_LIST_TAG])
  })
})

describe('tagsForEventChange', () => {
  it('révalide les listes, la page de l’événement et sa salle', () => {
    expect(
      tagsForEventChange({ id: 'e1', location: 'loc1', _status: 'published' }, null),
    ).toEqual([EVENTS_LIST_TAG, eventTag('e1'), locationEventsTag('loc1')])
  })

  it('accepte une salle peuplée', () => {
    expect(
      tagsForEventChange({ id: 'e1', location: { id: 'loc1' }, _status: 'published' }),
    ).toContain(locationEventsTag('loc1'))
  })

  it('révalide l’ancienne et la nouvelle salle quand la salle change', () => {
    const tags = tagsForEventChange(
      { id: 'e1', location: 'loc2', _status: 'published' },
      { id: 'e1', location: 'loc1', _status: 'published' },
    )
    expect(tags).toContain(locationEventsTag('loc1'))
    expect(tags).toContain(locationEventsTag('loc2'))
  })

  it('ne duplique pas la salle quand elle ne change pas', () => {
    const tags = tagsForEventChange(
      { id: 'e1', location: 'loc1', _status: 'published' },
      { id: 'e1', location: 'loc1', _status: 'published' },
    )
    expect(tags.filter((tag) => tag === locationEventsTag('loc1'))).toHaveLength(1)
  })

  it('ne révalide rien quand seul un brouillon change', () => {
    expect(
      tagsForEventChange(
        { id: 'e1', location: 'loc1', _status: 'draft' },
        { id: 'e1', location: 'loc1', _status: 'draft' },
      ),
    ).toEqual([])
    expect(tagsForEventChange({ id: 'e1', _status: 'draft' }, null)).toEqual([])
  })

  it('révalide quand un événement publié repasse en brouillon', () => {
    expect(
      tagsForEventChange(
        { id: 'e1', location: 'loc1', _status: 'draft' },
        { id: 'e1', location: 'loc1', _status: 'published' },
      ),
    ).toContain(eventTag('e1'))
  })

  it('révalide un événement sans salle (lieu en texte libre)', () => {
    expect(tagsForEventChange({ id: 'e1', location: null, _status: 'published' })).toEqual([
      EVENTS_LIST_TAG,
      eventTag('e1'),
    ])
  })
})
