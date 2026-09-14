// GENERATED FILE — ne pas éditer à la main.
// Régénérer avec : pnpm generate:city-map
//
// Volontairement vide tant que le script n'a pas été lancé : le middleware
// retombe alors sur le lookup HTTP, donc rien ne casse en attendant.

export type CityRegion = 'pays-basque' | 'landes'

export const CITY_REGION: Record<string, CityRegion> = {}

export function regionForCity(slug: string): CityRegion | undefined {
  return CITY_REGION[slug]
}
