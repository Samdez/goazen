# ADR-0005: Pages are invalidated by events only — no time-based revalidation

**Status:** Accepted
**Date:** 2026-10-03

## Context

Goazen moves back to Vercel's Hobby plan, with a 50 % safety margin: ~2 h of
Fluid Active CPU and ~100 k ISR writes per month. Overage on Hobby does not
bill — it takes the site down until the cycle ends.

Before this decision the site used ~13 h of CPU and ~540 k ISR writes per
month. Observability over 10 days attributed the CPU to: event pages 40 %,
media files 20 %, listings 15 %, home 9 %, venue pages 6 %. The cause was
`revalidate = 300` on every event-driven page (`254fcd2`): each of the ~5 600
event pages re-rendered on the next crawler hit after 5 minutes. On top of
that, every event save revalidated the single `events` tag, i.e. the whole
cache; media files were proxied by Payload with `max-age=0`; the home was
rendered on every request.

The editorial rhythm makes time-based freshness unnecessary: organizers
submit **draft events** through the form, and the editor publishes them in
batches once or twice a week.

## Decision

No public page has a time-based lifetime (`revalidate = false`, data caches
with `revalidate: false`). A page is regenerated only when something it shows
actually changed:

- **Event page** — depends only on `event:<id>`, including its "prochains
  concerts" carousel (a snapshot; past dates are hidden client-side).
  Regenerated when the event is edited, and **once** the night after it took
  place, to render it *terminé* and `noindex`. Frozen for good afterwards.
  Past event pages are kept (not deleted, not redirected): they cost nothing
  once frozen and keep shared links, venue archives and catalog depth (GEO).
- **Venue page** — `events:location:<id>` and `locations`: when the venue or
  its programming changes, including a date passing.
- **Venue directory** (`/salles-de-concert/[city]`) — `locations` and
  `cities` only.
- **Listings, sitemap, home without filters** — `events`: on any publish,
  unpublish or edit of a published event, and nightly.
- **Draft events** never trigger anything.
- **Home with filters** (`?when`, `?region`, `?city`, `?genres`) is rewritten
  in `next.config.ts` to `/home-filtree`, rendered on demand. Genre and
  festival pages stay rendered on demand too (negligible cost).
- **Media files** are served with `Cache-Control: public, max-age=31536000,
  immutable`: an image is never replaced in place, a new image is a new file.

Time only enters through **one daily cron** (`/api/cron/daily-revalidate`,
after midnight UTC): it revalidates `events`, plus `event:<id>` and the
venue tag of each event that took place the previous day (Paris time).

`/api/revalidate` requires `REVALIDATE_SECRET`; the cron requires
`CRON_SECRET`.

## Considered options

- **Longer `revalidate` durations (24 h / 6 h)** — rejected: with ~5 600
  crawlable event pages, even one regeneration per page per day can exceed
  the budget, and it regenerates pages whose content did not change.
- **Remove past event pages (404 / 301 to the venue)** — rejected: no saving
  (a frozen page costs nothing), loses shared links, venue archives and the
  catalog depth that backs the "5 600 concerts" claim.
- **Client-side only past/upcoming switch** — rejected: crawlers would keep
  seeing "Billetterie" and the page would never get `noindex`. Kept only as a
  safety net if the cron misses a night.
- **Serving media directly from S3** — deferred: changes every image URL and
  needs a public bucket; caching the proxy removes the CPU cost alone.

## Consequences

- After midnight, listings and the home switch day when the cron runs
  (between 1 h and 3 h Paris time on Hobby), not continuously. This replaces
  the "≤ 1 h slop" of ADR-0004 for the bon plan banner.
- If the cron misses a night, the previous day's events stay "à venir" in
  their HTML (the client hides them in carousels) until they are edited.
- An upcoming event page does not show events added later at the same venue
  until it is itself edited.
- Each deployment starts with an empty page cache (to be confirmed by
  measurement): pages re-render once on their next visit. Group deploys.
- Adding a cached query: give it tags, no `revalidate` duration — a duration
  on any `unstable_cache` shortens the lifetime of every page that uses it.
