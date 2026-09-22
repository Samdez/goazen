import type { Where } from 'payload'

/**
 * Le filtre région/ville des événements, en un seul endroit.
 *
 * Deux chemins coexistent tant que la migration `city` → `city V2` n'est pas
 * finie : la région d'un événement vient de `location.city V2.region` quand la
 * relation existe, sinon du champ `region` de l'événement. Une liste et un
 * compteur qui n'appliqueraient pas la même règle afficheraient « 12 concerts »
 * au-dessus de 9 cartes.
 */
export function regionWhere(region: string): Where {
  return {
    or: [
      {
        and: [
          { 'location.city V2.region': { exists: true } },
          { 'location.city V2.region': { equals: region } },
        ],
      },
      {
        and: [{ 'location.city V2.region': { exists: false } }, { region: { equals: region } }],
      },
    ],
  }
}

export function cityWhere(city: string): Where {
  return { or: [{ 'location.city V2.slug': { equals: city } }] }
}

export type EventScope = {
  region?: string
  city?: string
  locationId?: string
}

/** Les conditions de périmètre communes aux listes et aux compteurs. */
export function scopeWhere(scope: EventScope): Where[] {
  return [
    ...(scope.locationId ? [{ location: { equals: scope.locationId } }] : []),
    ...(scope.region ? [regionWhere(scope.region)] : []),
    ...(scope.city ? [cityWhere(scope.city)] : []),
  ]
}
