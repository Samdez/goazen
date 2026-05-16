# ADR-0001: Homepage has two modes — browse and focused — driven by a single URL param

**Status:** Accepted
**Date:** 2026-05-15

## Context

The homepage redesign on `feat/homepage-redesign-mockup-v2` introduced a sticky
chip-based `FilterBar` with three time chips (*Ce soir*, *Ce week-end*,
*Cette semaine*), region chips, a free toggle, and three editorial sections
(*Ce soir* / *Cette semaine* / *À venir*).

The chips wrote `?when=tonight|weekend|week` to the URL, but `page.tsx`
never consumed `when` — so tapping a time chip changed the URL invisibly
and rendered the same 3-section layout regardless. This was the gap behind
the UX-review item "filter chip ↔ three-section interaction."

We needed a single rule that makes the chips do something legible.

## Decision

The homepage has two distinct modes, driven entirely by `?when=…`:

- **Browse mode** (no `when` set): the editorial 3-section layout
  (*Ce soir* → *Cette semaine* → *À venir*), with the *Hero* card on top
  when tonight is non-empty.
- **Focused mode** (`when=tonight|weekend|week`): a single windowed listing
  scoped to that chip's window. The *Hero* card appears only when
  `when=tonight`; for other windows, the focused listing is a plain grid.

Other chips (region, city, free, genre) are **cross-cutting filters** that
apply in either mode without changing the layout.

The URL is the single source of truth. The *See-all CTA* on a section header
sets `?when=…` and re-renders the same homepage — there is **no separate
list route** (e.g. no `/ce-soir`).

## Consequences

**Positive:**
- Tapping a time chip now produces a visible re-scope. The chip is no longer
  a no-op.
- One canonical URL per list view → SEO-friendly, easy to share.
- The 4-chip-class system stays coherent: time selects mode, everything else
  filters within mode.

**Negative:**
- Focused mode loses the editorial "scan three windows at once" feel of
  browse mode. Acceptable because the user has expressed clear intent.
- The label set for the hero grows to three variants (*Tête d'affiche ce
  soir* / *…ce week-end* / *…cette semaine*). See ADR-0002.

## Alternatives considered

- **Time chips as section anchors / TOC.** Rejected: the mutually-exclusive
  `?when` param already encodes mode, not anchor; and Dice/Shotgun/RA all
  treat tonight/this-weekend as scoping filters.
- **Separate `/ce-soir` route.** Rejected: creates two parallel hierarchies
  showing the same data, ambiguous canonicals for SEO.
- **`/concerts/[region]` as the see-all target.** Rejected: dumps the user
  into a region listing where tonight's events are mixed with the next
  90 days — defeats the purpose of "see all tonight."
