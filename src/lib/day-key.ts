/**
 * Ramène une date ISO à sa journée UTC (`YYYY-MM-DD`).
 *
 * Sert à construire des clés de cache stables pour les requêtes dont les bornes
 * sont de toute façon recalées sur une frontière de journée. Sans ça, un
 * `new Date().toISOString()` côté appelant rend la clé unique à chaque requête :
 * le cache n'est jamais lu et une nouvelle entrée est écrite à chaque rendu.
 *
 * Retourne une chaîne vide pour une entrée absente ou invalide, de façon à
 * rester interchangeable avec le `?? ''` des clés de cache existantes.
 */
export function toDayKey(date?: string | Date | null): string {
  if (!date) return ''
  const parsed = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().slice(0, 10)
}
