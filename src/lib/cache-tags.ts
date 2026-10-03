/**
 * Tags de cache des événements.
 *
 * Avant, toutes les requêtes d'événements portaient le seul tag `events`, et
 * chaque enregistrement d'un événement dans l'admin le révalidait : tout le
 * cache sautait, y compris les ~5 600 pages événement et toutes les pages
 * salle, qui se régénéraient ensuite une à une au passage suivant d'un robot.
 *
 * Désormais :
 * - `events` ne couvre plus que les listes transverses (home, régions, villes,
 *   genres, sitemap) ;
 * - une page événement ne dépend que de `event:<id>` (carrousel compris) ;
 * - une page salle dépend de `events:location:<id>`.
 *
 * Modifier un événement ne régénère donc que les listes, sa page et la salle
 * concernée (l'ancienne et la nouvelle si la salle a changé). Le passage du
 * temps est géré à part, par le cron quotidien (src/lib/daily-revalidation.ts).
 */

export const EVENTS_LIST_TAG = 'events'

export function eventTag(eventId: string) {
  return `event:${eventId}`
}

export function locationEventsTag(locationId: string) {
  return `events:location:${locationId}`
}

/** Tags d'une requête d'événements : la salle si elle est ciblée, sinon les listes. */
export function eventsQueryTags({ locationId }: { locationId?: string }) {
  return locationId ? [locationEventsTag(locationId)] : [EVENTS_LIST_TAG]
}

type RelationValue = string | { id: string } | null | undefined

type EventLike = {
  id: string
  location?: RelationValue
  _status?: 'draft' | 'published' | null
}

function relationId(value: RelationValue) {
  if (!value) return undefined
  return typeof value === 'string' ? value : value.id
}

/**
 * Tags à révalider après la création, la modification ou la suppression d'un
 * événement. Liste vide quand le changement ne touche que des brouillons : rien
 * de public n'a bougé.
 */
export function tagsForEventChange(doc: EventLike, previousDoc?: EventLike | null) {
  const isDraft = (event?: EventLike | null) => !event || event._status === 'draft'
  if (isDraft(doc) && isDraft(previousDoc)) return []

  const locationIds = new Set(
    [relationId(doc.location), relationId(previousDoc?.location)].filter(
      (id): id is string => Boolean(id),
    ),
  )

  return [EVENTS_LIST_TAG, eventTag(doc.id), ...[...locationIds].map(locationEventsTag)]
}
