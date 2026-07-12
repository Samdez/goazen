// Day-granular helpers for the "bon plan" banner window on special events
// (see ADR-0004). Banner dates come from a dayOnly picker, so they carry
// day-only intent but are stored with an arbitrary time-of-day — every
// comparison here must ignore the stored time. Both bounds are inclusive:
// the banner is still up on the end date. Days are UTC-approximated Paris
// days, same convention as window-bounds.ts.

export function dayFloorUTC(d: Date): Date {
  const out = new Date(d)
  out.setUTCHours(0, 0, 0, 0)
  return out
}

export function nextDayFloorUTC(d: Date): Date {
  const out = dayFloorUTC(d)
  out.setUTCDate(out.getUTCDate() + 1)
  return out
}

// Query bounds for "window contains this day", robust to stored time-of-day:
// start day <= today  ⇔  start < tomorrowFloor
// end day   >= today  ⇔  end   >= todayFloor
export function bannerActiveQueryBounds(now: Date = new Date()) {
  return { startBefore: nextDayFloorUTC(now), endOnOrAfter: dayFloorUTC(now) }
}

// Query bounds for "window overlaps [start, end]" at day granularity.
// Inclusive on both sides: two windows sharing a single day conflict.
export function bannerOverlapQueryBounds(start: Date, end: Date) {
  return { startBefore: nextDayFloorUTC(end), endOnOrAfter: dayFloorUTC(start) }
}

// Both-or-neither + ordering rule. Returns a French error message, or null
// when the pair is valid (including both empty — the normal state).
export function bannerWindowFieldError(start: Date | null, end: Date | null): string | null {
  if (!start && !end) return null
  if (!start || !end) {
    return 'Les deux dates de bannière doivent être renseignées ensemble (ou laissées vides).'
  }
  if (dayFloorUTC(end) < dayFloorUTC(start)) {
    return 'La date de fin de bannière doit être égale ou postérieure à la date de début.'
  }
  return null
}

export function formatDayFR(d: Date): string {
  return d.toLocaleDateString('fr-FR', { timeZone: 'UTC' })
}
