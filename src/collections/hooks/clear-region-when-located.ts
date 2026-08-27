import type { CollectionBeforeChangeHook } from 'payload'

/**
 * When an event has a location relationship, the canonical region comes from
 * location.city V2.region — a leftover event-level region (or location_alt)
 * makes the event match both region filters and appear in both weekly exports.
 */
export const clearRegionWhenLocated: CollectionBeforeChangeHook = ({ data }) => {
  if (data.location) {
    data.region = null
    data.location_alt = null
  }
  return data
}
