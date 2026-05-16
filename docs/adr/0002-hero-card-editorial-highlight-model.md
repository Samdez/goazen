# ADR-0002: The Hero card is driven by an editorial `highlighted` flag, with one highlight per day enforced by a write hook

**Status:** Accepted
**Date:** 2026-05-15

## Context

The redesigned homepage's `TonightHeroCard` was rendered as
`events[0]` of the tonight window — i.e. the chronologically next event
of the evening. That is *not* a headliner: it is whichever event happens
to start earliest. The label *Tête d'affiche* over-promised what the
selection was doing.

The UX review separately asked for a Wed–Fri fallback: when tonight is
empty, show "Tête d'affiche ce week-end" with the upcoming weekend's
headliner. This raised a fundamental question: what data signal makes
an event a headliner?

The Events collection has no `featured` field (the one in
`payload-types.ts` is stale or plugin-injected and is unused). The only
adjacent editorial signal is `add_to_selection`, but it is conditional
on a `special_event` relation, so it cannot mark a standalone concert
as a headliner.

## Decision

Add a new `highlighted: boolean` field to the Events collection.

**Invariant:** at most one highlighted event per calendar day. Enforced
by a Payload `beforeChange` hook: when an event is saved with
`highlighted=true`, the hook clears `highlighted` on any other event on
the same calendar day.

**Hero selection algorithm** (browse mode):

1. If the tonight window has events:
   - Hero = the highlighted event in the tonight window, else the
     chronologically first event in tonight.
   - Label: *Tête d'affiche ce soir*.
2. Else if today is Wed/Thu/Fri:
   - Hero = the highlighted event in the weekend window, else the
     chronologically first event in the weekend.
   - Label: *Tête d'affiche ce week-end*.
3. Else (Mon/Tue, or Sat/Sun afternoon with empty tonight):
   - Hero = the highlighted event in the *Cette semaine* window, else
     the chronologically first event of that window.
   - Label: *Tête d'affiche cette semaine*.

In focused mode the hero appears only for `when=tonight` and follows
rule 1 above. For `when=weekend` or `when=week` the focused listing
renders a plain grid with no hero.

## Consequences

**Positive:**
- "Headliner" is now an editorial choice, not a sort-order accident.
- The same field generalises across all three windows — no per-window
  schema.
- The one-per-day invariant prevents the admin from accidentally
  flagging multiple events on the same date (an ambiguous state with no
  obvious resolution).
- Falling back to chronological-first means the homepage never shows
  "no hero" when there are events — UX stays full even on weeks no one
  curated.

**Negative:**
- Curators must remember to flag events. If they forget, the hero is
  silently a chronological pick — visually identical but editorially
  unsignalled.
- The hook silently mutates other documents (auto-unflagging the
  previous highlight on the same day). This is convenient for the admin
  but unusual behaviour — needs to be visible in the field's admin
  description so curators understand what happened.
- A new label variant is required per window (3 total). Not a heavy
  cost but the hero chrome now branches.

## Alternatives considered

- **Reuse `add_to_selection`.** Rejected: tied to `special_event`;
  widening would muddy its existing semantics.
- **Reuse `getFeaturedFestival`.** Rejected: restricts headliners to
  festival-linked events. A standalone Atabal concert could never be
  a headliner.
- **Pure chronological heuristic.** Rejected: this is the status quo
  the redesign was trying to fix.
- **Multiple highlights per day.** Rejected: would force a tie-break
  rule at read time and create ambiguous editorial state.
