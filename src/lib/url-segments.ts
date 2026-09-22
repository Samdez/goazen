/**
 * Segments neutres des URLs d'événement quand la donnée manque.
 *
 * Avant, `getLocationInfo` renvoyait la sentinelle interne `no-location`, qui
 * finissait telle quelle dans l'URL canonique et le sitemap : mauvais signal
 * pour Google, et lisible comme « lieu inconnu » par un LLM. Un segment en
 * français dit la même chose honnêtement, sans exposer un identifiant interne.
 *
 * Le segment reste obligatoire : la route est
 * `/concerts/[region]/[city]/[location]/[slug]`, et l'omettre ferait tomber
 * l'URL sur la route des pages salle (3 segments). `evenement` n'est pas
 * réutilisable non plus, il désigne déjà les pages événement spécial
 * (`/concerts/evenement/<slug>`).
 *
 * Module volontairement minuscule et sans dépendance : le middleware l'importe,
 * et tout ce qu'il importe est embarqué dans son bundle, chargé à chaque
 * requête /concerts/*.
 */
export const UNKNOWN_REGION_SEGMENT = 'region-non-precisee'
export const UNKNOWN_CITY_SEGMENT = 'ville-non-precisee'
export const UNKNOWN_VENUE_SEGMENT = 'lieu-non-precise'

/** Segments à ne jamais publier comme nom de lieu (JSON-LD, fils d'Ariane…). */
export const PLACEHOLDER_SEGMENTS = new Set<string>([
  UNKNOWN_REGION_SEGMENT,
  UNKNOWN_CITY_SEGMENT,
  UNKNOWN_VENUE_SEGMENT,
  // Ancienne sentinelle : encore présente dans des URLs indexées.
  'no-location',
])
