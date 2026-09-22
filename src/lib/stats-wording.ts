/**
 * Mise en forme des compteurs.
 *
 * Les chiffres sont mis en cache 24 h et revalidés à la publication : entre
 * deux revalidations, un total exact peut être dépassé. On arrondit donc vers
 * le bas et on annonce « plus de » — une phrase qui reste vraie quoi qu'il
 * arrive, et qu'un moteur génératif peut citer sans nous faire mentir.
 */

/** « 5 619 » — séparateur de milliers français (espace insécable). */
export function formatCount(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value)
}

/**
 * « plus de 5 600 » au-delà de 100, le compte exact en dessous.
 *
 * Arrondi à la centaine à partir de 1 000, à la dizaine entre 100 et 1 000 :
 * en dessous, arrondir ferait perdre plus d'information que ça n'en protège.
 */
export function approxCount(value: number): string {
  if (value >= 1000) return `plus de ${formatCount(Math.floor(value / 100) * 100)}`
  if (value >= 100) return `plus de ${formatCount(Math.floor(value / 10) * 10)}`
  return formatCount(value)
}

export function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase('fr-FR') + text.slice(1)
}

/** « 1 concert » / « 12 concerts ». */
export function pluralize(value: number, singular: string, plural = `${singular}s`): string {
  return `${formatCount(value)} ${value > 1 ? plural : singular}`
}
