# Goazen! — Design Critique & Recommendations

**Scope:** Homepage, Event Details page (Atabal / The Abyssinians example), and "Partage ton event" form.
**Focus:** Visual hierarchy & aesthetics + copy/microcopy.
**Audience:** General public looking for events (casual visitors, often on mobile, often in a hurry to decide "où sortir ce soir").

---

## Overall Impression

Goazen! has a strong product idea and a likable brand — Basque name, mascot logo, tutoiement ("Retrouve", "Partage ton event"), bilingual cultural identity. The information is there, but the experience reads more like a content list than a curated agenda. The biggest opportunities aren't visual polish — they're **rhythm, consistency, and trust**. Every event card looks the same regardless of importance; date/time/price formats are improvised event-by-event; and the submission form quietly tells users their email will be sold, which deserves more honesty (and a more reassuring frame) than it currently gets.

If you fix the data formatting layer and tighten three or four templates, the site will feel significantly more professional without redesigning a single screen.

---

## 1. Homepage

### What works

- The H1 / sub-heading combo is clear and on-brand: "Tous les concerts au Pays basque et dans les Landes" / "Retrouve tous les concerts, DJ sets, festivals et soirées près de chez toi". Purpose is obvious in 2 seconds.
- "Partage ton event" appears in the header — good, the contribution loop is visible.
- Tutoiement throughout sets a young, local, friendly tone that suits going-out content.

### Visual hierarchy

- **Every event card has identical weight.** A €30 reggae headliner at Atabal and a free DJ set on a Wednesday look the same. The page is a flat scroll. Consider tiering:
  - **Tonight / This week** — larger cards with image, headline, venue, CTA.
  - **Coming up** — compact rows (date · time · artist · venue · price).
  - **Festivals & specials** — banner-style card with hero image.
- **The two filters ("Tous les genres", "Quand ?") are doing a lot of work and you can't see them at a glance.** They read as small dropdowns competing for attention with the H1. Promote them: a sticky filter bar with chips (Ce soir · Ce week-end · Cette semaine · Gratuit · Pays Basque · Landes · Genre) gives users one-tap access to the queries that matter most for a "ce soir" use case.
- **There's no "Tonight" anchor.** The H1 says "où sortir ce soir" in the meta description but the page doesn't actually surface tonight's events first. Add a "Ce soir" section above the chronological list.

### Copy & microcopy — the data-formatting layer

This is the single biggest aesthetic problem on the homepage. Within twelve cards I counted:

| Field | Formats observed |
|---|---|
| Time | `19:30`, `18h-22h`, `23h - 6h`, `19h30`, `20h`, `18h`, `0h-6h`, `22h/1H30`, missing entirely |
| Price | `25 €`, `Gratuit`, `18€`, `Gratuit €` (renders "Free €"), `Non précisé €`, full sentence with five conditions, `N/A` |
| Venue | `Atabal / Biarritz`, `Rosy BAYONNE`, `Aperock / Anglet`, `Ahoy Capbreton`, `Epic Biarritz` |
| Genre | `Hard disco`, `Urban Pop • RNB`, `Indie rock, folk rocK` (capitalization typo), often missing |
| Event type | `DJ Set`, `Live show`, `Autre` — inconsistent casing, "Autre" is uninformative on a card |

**Recommendations:**

1. Lock a single time format: `19h30` (or `19:30`) — pick one. For ranges, always `19h–22h` with an en-dash. Reject submissions that don't conform, or auto-parse.
2. Price: always `Gratuit`, `25 €`, or `Prévente 10 € / Sur place 12 €`. Never `Gratuit €`, never `Non précisé €`, never `N/A` (display "Prix à confirmer" instead).
3. Venue: pick `Venue · City` (interpunct, no slash) and lowercase city names: `Atabal · Biarritz`, `Ahoy · Capbreton`. The slash reads like a path; the interpunct reads like metadata.
4. Genre: normalize to a controlled list, displayed as a chip in your brand color.
5. Replace "Autre" with no badge at all (silence is better than a non-label).

### Card content order

The current card reads roughly: date → time → type → title → venue → genre → title-repeated → price. The title appears twice (likely image alt text being rendered), and the price floats at the end.

A cleaner card hierarchy for scanning:

```
[Date — large] · [Time]
TITLE (artist / event)
Venue · City  ·  Genre chip
Price  →
```

Make the **artist/event name** the largest type. Right now it's competing with the date.

---

## 2. Event Details Page

### What works

- One clear primary CTA: **Billetterie**. Good — don't let other links steal that focus.
- "Prochains concerts" at the same venue is a smart engagement loop.
- Hero image, description, and venue link are all present.

### Visual hierarchy

- **The H1 is doing all the work.** Date/time appear as small grey text below the title; venue is a link with no visual treatment. Consider a small event-meta band above the title with three pills: 📅 mar. 12 mai · 🕢 19h30 · 📍 Atabal, Biarritz. (Replace emojis with your icon set if you have one.)
- **Empty heading: `## Atabal` is rendered with nothing under it.** Either remove it or populate with a one-line venue blurb + address + map link. Right now it's a dangling label that erodes polish.
- **The "Prochains concerts" carousel has Previous/Next controls but no slide indicators.** Users don't know how many there are or where they are. Either show dots / numbers, or convert to a horizontal scroll row (works better on mobile anyway).
- **The Billetterie CTA should be sticky on mobile.** It's the only conversion event on this page. As users scroll through the description and the "next events" list, the buy button disappears.

### Copy & microcopy

- **Data inconsistency between the title and the description.** The page title says `THE ABYSSINIANS & LONE RANGER` but the body talks about `Big Youth`. The OG meta tag also says Big Youth. If the lineup changed, the title/URL slug wasn't updated — this looks careless to a first-time visitor and breaks trust. Add an editorial step that re-validates the H1 when the description changes.
- **Typo in description:** "Jamaïca" should be "Jamaïque" (or just "Jamaïque, Kingston" reads more naturally).
- **The Billetterie button is generic.** "Réserver ma place" or "Acheter mon billet — 25 €" converts better because it tells users what happens next and reinforces price.
- **No share button.** This is exactly the kind of page people forward in a WhatsApp / Instagram DM. A "Partager" action (native share API) belongs near the CTA.

### Conversion suggestion

A pattern that works well for event pages:

```
[Hero image]
TITLE
mar. 12 mai · 19h30  ·  Atabal · Biarritz
[ Réserver — 25 € ]      [ Partager ]

About this event …
About the venue …
Other concerts at Atabal →
```

---

## 3. "Partage ton event" Form Page

### What works

- The page exists, is one click from the homepage, and the intent is clear.
- "100 % gratuit" is reassuring.
- Tutoiement is consistent with the rest of the site.

### Visual hierarchy & layout

- **The intro paragraph is rendered twice.** "Si tu souhaites voir ton évènement sur Goazen!… c'est ici !" appears verbatim twice in a row. Looks like a template bug — fix or hide one.
- **The form is sparse to the point of being uninformative.** From the page I can only see: event type (DJ Set / Concert / Autre), optional image, location (Pays Basque / Landes), date, and consent checkbox. Where do users enter:
  - Event name?
  - Time / time range?
  - Venue?
  - Description?
  - Genre / style?
  - Price?
  - Ticket link?
  - Contact email & name?

  Either these fields exist but didn't render in my fetch (in which case the page loads slowly or progressively — a UX problem in itself), or they're missing (a much bigger problem — your moderators must be doing manual back-and-forth to fill them in). Either way, worth auditing what users actually see on first paint.
- **Grouping.** When you do build out the form, group fields:
  1. **L'event** — nom, type, genre, date, heure, prix, lien billetterie
  2. **Le lieu** — région, ville, salle
  3. **Visuel** — image
  4. **Toi** — nom, email, accord CGU

  Grouped forms feel half as long.

### Copy & microcopy — the consent moment

This is the most important paragraph on the page and currently the most undersold:

> "En contrepartie, ton adresse email sera partagée avec nos partenaires commerciaux (billetteries, prestataires événementiels) qui pourront te contacter avec des offres liées à l'organisation d'événements."

**Issues:**

1. It's buried in body copy next to "100 % gratuit", so it reads as a footnote rather than a deal.
2. "Partenaires commerciaux" without naming them is vague. Trust drops sharply when users can't see who gets the data.
3. **It is currently mandatory**, not opt-in. Under GDPR ("consentement libre"), bundling free service with mandatory commercial-partner sharing is a risk area. Get a lawyer's eyes on this, but at minimum the recommended UX pattern is:

```
[ ] J'accepte de recevoir des offres de billetteries et
    prestataires événementiels partenaires de Goazen!
    (optionnel — ton event sera publié quoi qu'il en soit)

[ ] J'ai lu et j'accepte les CGU  (obligatoire)
```

If keeping the sharing tied to free publication is essential to your business, then **own it more clearly** — e.g. a small framed callout:

> **Comment Goazen! reste gratuit**
> On partage ton email avec nos partenaires (billetteries, prestataires événementiels) pour qu'ils puissent te proposer leurs services. Tu peux te désinscrire à tout moment via le lien dans leurs emails.

A boxed, plain-language explanation converts better than a buried disclaimer because users feel respected.

### Other copy fixes

- "Sélectionne ton lieu" → "pays basque" / "landes" all lowercase. Inconsistent with capitalized site nav ("Pays Basque", "Landes"). Capitalize.
- "Envoyer" as the submit button is generic. **"Proposer mon event"** is friendlier and more on-brand.
- After submit, the success message should set expectations: "Merci ! On regarde ça et ton event apparaît sous 24-48h." (I couldn't verify the current message.)
- "Image (optionnel - 20mb max)" — write "20 Mo max" (French SI). Also add accepted formats: "JPG, PNG ou WebP, 20 Mo max".

---

## 4. Cross-Page Patterns

### Brand identity

You have a real brand asset in the mascot logo and the Basque name — but the rest of the site reads as a neutral content list. The brand could carry through more:

- A **signature accent color** used only for CTAs and "live tonight" status, so it pops.
- A **type pairing** with a distinctive display face for event titles (something with character — condensed sans, gritty serif, even a stencil — to evoke gig posters) and a clean text face for everything else. Right now everything appears to use the same neutral system font.
- Small **mascot moments** in empty states ("Aucun event ce jour — la mascotte se repose 🛏") so the personality shows up where users would otherwise see a blank screen.

### Navigation

The header looks crowded: Pays Basque · Landes · Les salles de concert · Espace Pro · Logo · Partage ton event. On mobile this likely collapses but the priority isn't obvious. Suggested ordering of importance for the public-facing audience:

1. Logo (home)
2. Pays Basque / Landes (or a single region switcher)
3. Salles
4. Partage ton event (button, branded color)
5. Espace Pro (de-emphasized, smaller, top corner)

### Footer

I didn't see a footer in the fetched content. Confirm it exists with: about, contact, CGU, mentions légales, social links (Instagram is mentioned in body copy — link it).

---

## What Works Well

- Clear, focused product — one job, well-scoped (events in Pays Basque + Landes).
- Tutoiement and Basque branding give it a clear personality competitors don't have.
- The submission loop is visible from the homepage — most local agendas hide this.
- Single primary CTA on event pages (Billetterie) is the right instinct.
- "Prochains concerts" at the same venue is good for engagement and SEO.

---

## Priority Recommendations

1. **Normalize the data formatting layer (time, price, venue, genre).** Highest-impact, lowest-effort change. The site will look an order of magnitude more professional once every event card reads in the same rhythm. Either enforce it at submission, validate it editorially, or transform on render.
2. **Restructure the homepage around "Ce soir / Ce week-end / À venir"** with prominent chip filters. Match how people actually decide what to do tonight.
3. **Tier your event cards.** Hero cards for tonight's biggest events, compact rows for the long tail.
4. **Fix the form: deduplicate the intro, expose the missing fields, reframe the consent paragraph as an honest, opt-in friendly callout.** This is both a trust issue and (potentially) a GDPR issue.
5. **Tighten event detail pages:** sticky Billetterie CTA on mobile, fix the empty `## Atabal` heading, add a share button, validate that the H1 matches the description.
6. **Develop a brand layer:** one accent color, one display font for event titles, mascot in empty states.

---

## Quick Wins (≤1 day each)

- Replace `Gratuit €` and `Non précisé €` with `Gratuit` / `Prix à confirmer`.
- Deduplicate the intro paragraph on `/formulaire`.
- Capitalize "Pays Basque" / "Landes" everywhere.
- Change "Envoyer" to "Proposer mon event".
- Change "Billetterie" to "Réserver — 25 €" (with the price interpolated).
- Fix the `## Atabal` empty heading on event detail pages.
- Add icon + share button next to the Billetterie CTA.
- Fix "Jamaïca" → "Jamaïque" on The Abyssinians page (and audit similar copy across other pages).
