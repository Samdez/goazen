import type { Event } from '@/payload-types'

type EventWithKind = Event & { event_kind: NonNullable<Event['event_kind']> }

/**
 * True when the document has an `event_kind` value. Legacy events have no field in the database.
 */
export function hasEventKind(event: Event): event is EventWithKind {
  return event.event_kind != null
}

/**
 * Label for UI/CSV; empty when {@link hasEventKind} is false.
 */
export function getEventKindDisplayLabel(event: Event): string {
  return hasEventKind(event) ? getEventKindLabel(event.event_kind) : ''
}

/**
 * Returns the French label for an event kind (UI, CSV). Empty when unset.
 */
export function getEventKindLabel(kind: Event['event_kind']): string {
  switch (kind) {
    case 'dj_set':
      return 'DJ Set'
    case 'live_show':
      return 'Live show'
    case 'other':
      return 'Autre'
    default:
      return ''
  }
}

/**
 * Tailwind classes for event kind badges on cards and detail pages.
 */
export function getEventKindBadgeClassName(kind: NonNullable<Event['event_kind']>): string {
  switch (kind) {
    case 'dj_set':
      return 'border-black bg-violet-600 text-black'
    case 'live_show':
      return 'border-black bg-rose-200 text-black'
    case 'other':
      return 'border-black bg-zinc-300 text-black'
  }
}
