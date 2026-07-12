# Date-scheduled bon plan banner, no manual toggle

The homepage "Le bon plan Goazen!" banner was driven by a manual global
(`show-special-event`: checkbox + event picker) that someone had to remember
to turn on *and off*. We replaced it with a **banner window** on
`special-events` (`banner_start_date` → `banner_end_date`, inclusive,
admin-only fields): the banner shows for whichever event's window contains
today, and the global is deleted — there is deliberately **no on/off
switch**. Emergency takedown = edit the end date; the `afterChange`
revalidation hook makes it instant.

## Considered options

- **Keep the global as a kill switch on top of the dates** — rejected: two
  mechanisms with precedence rules recreate the "forgotten toggle" failure
  mode this feature exists to eliminate.
- **Warn (non-blocking) on overlapping banner windows** — rejected in favor
  of a **blocking validation**: windows may never overlap, so "at most one
  banner window covers any given day" is a hard invariant and the homepage
  query needs no tie-break rule. Same write-time-enforcement philosophy as
  the one-highlight-per-day hook on Events.

## Consequences

- Banner on/off flips at day boundaries ride the 1h `unstable_cache` TTL
  (≤1h slop after midnight, accepted); edits via admin are instant via tag
  revalidation.
- Banner fields are admin-only (field-level access) even though venue
  editors can update `special-events` — the homepage slot stays editorial,
  matching the admin-only access of the deleted global.
- `featured`/`FestivalBanner` is independent: the same event may show in
  both placements at once; de-duplication is an editorial choice, not code.
