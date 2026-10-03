import { EVENTS_LIST_TAG, eventTag, locationEventsTag } from './cache-tags'

/**
 * Révalidation quotidienne : le seul déclencheur « dans le temps » du site.
 *
 * Aucune page n'a plus de durée de vie (ISR sans `revalidate`). Ce qui change
 * avec le calendrier est rafraîchi une fois par nuit (cron après minuit UTC),
 * et seulement là où c'est nécessaire :
 * - les événements de la veille passent « terminés » (et `noindex`) — leur
 *   dernière régénération, ils sont figés ensuite ;
 * - leurs salles retirent ces dates de leur programmation ;
 * - les listes (`events`) changent de jour.
 */

const PARIS = 'Europe/Paris'

/** Décalage de Paris par rapport à UTC à cet instant, en millisecondes. */
function parisOffsetMs(instant: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: PARIS,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
      .formatToParts(instant)
      .map((part) => [part.type, part.value]),
  )
  const wallClockAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  )
  return wallClockAsUtc - Math.floor(instant.getTime() / 1000) * 1000
}

/** Instant UTC de minuit, heure de Paris, le jour (parisien) de `date`. */
export function parisDayStart(date: Date) {
  const day = date.toLocaleDateString('en-CA', { timeZone: PARIS })
  const utcMidnight = new Date(`${day}T00:00:00Z`)
  // Les changements d'heure ont lieu à 2 h ou 3 h : à minuit UTC, le décalage
  // est encore celui de la nuit parisienne qui nous intéresse.
  return new Date(utcMidnight.getTime() - parisOffsetMs(utcMidnight))
}

/** La journée d'hier, heure de Paris : `[start, end[`. */
export function previousParisDay(now: Date) {
  const end = parisDayStart(now)
  const start = parisDayStart(new Date(end.getTime() - 12 * 60 * 60 * 1000))
  return { start, end }
}

type EndedEvent = { id: string; location?: string | { id: string } | null }

/** Tags à révalider pour les événements terminés la veille. */
export function tagsForEndedEvents(events: EndedEvent[]) {
  const tags = new Set([EVENTS_LIST_TAG])
  for (const event of events) {
    tags.add(eventTag(event.id))
    const locationId = typeof event.location === 'string' ? event.location : event.location?.id
    if (locationId) tags.add(locationEventsTag(locationId))
  }
  return [...tags]
}
