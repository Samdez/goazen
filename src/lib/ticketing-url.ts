/**
 * `ticketing_url` est un champ texte libre : la saisie admin comme le
 * formulaire public y laissent passer n'importe quoi. En base on trouve donc
 * aussi bien `https://billetweb.fr/xxx` que `www.lasalle.fr`, `Sur place`,
 * une adresse mail ou un `@compte_insta`.
 *
 * Publié tel quel dans `offers.url`, ça vaut le « Invalid URL in field "url"
 * (in "offers") » de la Search Console ; rendu tel quel dans un `href`, un
 * `www.…` sans schéma est résolu en lien *relatif* (`/concerts/…/www.lasalle.fr`)
 * et le lien billetterie est mort.
 *
 * Ce module est le seul endroit qui décide si une valeur est une URL
 * publiable — JSON-LD, liens du site et validation Payload lisent tous celui-ci.
 */

/** Un domaine plausible : au moins un point et un TLD alphabétique. */
const DOMAIN_LIKE = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}(?=$|[/?#:])/i

/**
 * Renvoie une URL absolue `http(s)` sûre, ou `undefined` si la valeur n'en est
 * pas une. Un domaine sans schéma (`www.x.fr/billets`) est complété en
 * `https://` : c'est l'intention évidente de la saisie. Tout autre schéma est
 * refusé — `mailto:` n'est pas une billetterie, et `javascript:` dans un `href`
 * serait une XSS stockée, le formulaire d'ajout étant public.
 */
export function normalizeTicketingUrl(value?: string | null): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed || /\s/.test(trimmed)) return undefined

  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : // Un autre schéma explicite (`mailto:`, `javascript:`…) n'est pas complétable.
      /^[a-z][a-z0-9+.-]*:/i.test(trimmed) || !DOMAIN_LIKE.test(trimmed)
      ? undefined
      : `https://${trimmed}`

  if (!candidate) return undefined

  try {
    const url = new URL(candidate)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined
    if (!DOMAIN_LIKE.test(url.hostname)) return undefined
    return url.href
  } catch {
    return undefined
  }
}
