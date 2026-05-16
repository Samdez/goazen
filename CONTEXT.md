---
name: Goazen homepage glossary
description: Canonical terms for the homepage redesign — filter chips, page modes, time windows
type: project
---

# CONTEXT.md

Domain glossary for Goazen. This file is a glossary only — no implementation
details, no decisions (those live in `docs/adr/`).

## Decisions

- [ADR-0001](docs/adr/0001-homepage-browse-vs-focused-mode.md) — Homepage
  has two modes (browse / focused), driven by `?when=…`.
- [ADR-0002](docs/adr/0002-hero-card-editorial-highlight-model.md) — Hero
  is driven by an editorial `highlighted` flag, one per day.
- [ADR-0003](docs/adr/0003-client-side-image-compression.md) — Image
  uploads are resized and re-encoded in the browser before submit (Vercel
  serverless 4.5MB body cap).

## Terms

### Browse mode
The homepage's default state when no time chip is active. Renders three
editorial sections stacked vertically: *Ce soir*, *Cette semaine*, *À venir*.

### Focused mode
The homepage's state when a time chip is active. The three sections collapse
into a single windowed listing scoped to that chip's window. The hero card
adapts (see *Hero adaptation*).

### Time chip
A `FilterBar` chip that selects a temporal window. Mutually exclusive
(single-select): one of `tonight`, `weekend`, `week`, or none. Toggling
between *browse mode* and *focused mode* is driven entirely by the time chip.
Encoded in URL as `?when=tonight|weekend|week`.

### City chip
A `FilterBar` chip that narrows results to a single city. Single-select.
Visible only when a *Region chip* is active (cascade). The set is curated,
not data-driven:
- Pays Basque: Biarritz, Bayonne, Anglet.
- Landes: Hossegor, Capbreton, Seignosse.

The Landes set is editorially the *coastal festival towns*, not the
administrative centers (Dax, Mont-de-Marsan). This is deliberate — Goazen's
audience is concert/festival-goers, not commuters.

### Region chip
A `FilterBar` chip that selects a geographic region. Mutually exclusive:
`pays-basque`, `landes`, or none. Encoded as `?region=…`. Applies in both
browse mode and focused mode without changing the layout.

### Free chip
A toggle in `FilterBar` (label: *Gratuit*) that restricts to free events.
Encoded as `?free=1`. Applies in both modes.

### Genre chip
A `FilterBar` chip representing a music genre / event category. Multi-select
with **OR** semantics (selecting *Rock* + *Techno* widens results to either).
Cross-cutting filter — never triggers focused mode, always composes with
whatever mode is active.

### FilterBar rows
The `FilterBar` is structured as two rows with distinct semantics:
- **Row 1 (scope, sticky):** time + region + city + free. Answers
  *"is this event relevant to me right now?"* Stays pinned on scroll.
- **Row 2 (taste, non-sticky):** genres. Answers *"is this event the kind of
  thing I like?"* Scrolls off with the page.

### Window
A bounded time range used by the event-window queries
(`getEventsTonight` / `getEventsThisWeek` / `getEventsUpcoming`). Windows are
non-overlapping and Paris-local in intent (UTC-approximated in code).

### Hero
The editorial card at the top of the homepage. Editorially scoped to
*tonight*. Appears in:
- Browse mode (when tonight is non-empty).
- Focused mode when `when=tonight`.
Never appears for `when=weekend` or `when=week` — those modes render a plain
grid. A separate Wed–Fri *fallback hero* may appear in browse mode when
tonight is empty (see ADR-0001 once written).

### Event kind
A required-ish select on Events with three values: `dj_set` (*DJ Set*),
`live_show` (*Live show*), `other` (*Autre*). Legacy events may have it null.
Surfaced as a small badge with kind-specific colour
(`getEventKindBadgeClassName`) on event cards and — when present — on the
*Hero* card alongside the *Ce soir* pill.

### Highlight
An editorial flag on an Event (`highlighted: boolean`) marking it as the
*headliner* for its day. Invariant: **at most one highlighted event per
calendar day.** Setting `highlighted=true` on a new event automatically
clears the flag on any previously highlighted event on the same day (enforced
by a Payload `beforeChange` hook).

A Highlight is the editorial signal that drives the *Hero* card. If no event
on the relevant day is highlighted, the hero silently falls back to the
chronologically first event of the window.

### Featured festival
A `special-events` document flagged `featured: true` and whose date range
overlaps the active window. Rendered as `FestivalBanner`. In browse mode the
window is the next 7 days; in focused mode the window matches the active
*Time chip*. Suppressed entirely if no festival overlaps the active window.

### Broaden suggestion
A user-facing empty-state pattern: when filters compose to zero results, the
page offers one-tap removal of each active filter rather than a wholesale
reset. Active filters are ranked by likelihood of over-restriction
(genres → city → free → region → time) so the first suggestion drops the
most-narrowing chip.

### Section teaser
A 1-line placeholder used in browse mode when one of the three sections is
empty but others have content. Example: *"Rien ce soir — voir cette
semaine ↓"*. Replaces silent section-hiding; keeps the page's navigational
structure intact.

### See-all CTA
The link from a section header (e.g. *Ce soir · Voir tous →*) into focused
mode for that window. Always navigates to the same homepage with the
appropriate `?when=…` set — never to a separate route. The URL is the source
of truth for which list the user is viewing.

### Event image
The optional photo attached to an Event. Rendered at retina resolution via
two Payload variants: `hero` (1920×1200) for *TonightHeroCard*, `eventCard`
(1280×800) for the card grids, carousel, and *EventsGrid*. The event detail
page currently bypasses variants and serves the original.
_Avoid_: photo, picture, cover.

### Location image
The optional photo attached to a Location. Distinct from *Event image* —
different Payload variant (`card`, 640×360), different render path
(`LocationCard`), different display contexts (venue lists, not event lists).
The two should never share a render path.

### Event submission form
The public-facing form at `/formulaire`. Distinct from the Payload admin UI,
which curators use. Submissions are created as drafts and reviewed before
publication. Image uploads here go through client-side compression before
the server action (see [ADR-0003](docs/adr/0003-client-side-image-compression.md)).
