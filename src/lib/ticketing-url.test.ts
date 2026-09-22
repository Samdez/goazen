import { describe, expect, it } from 'vitest'
import { normalizeTicketingUrl } from './ticketing-url'

describe('normalizeTicketingUrl', () => {
  it('keeps an absolute http(s) URL', () => {
    expect(normalizeTicketingUrl('https://www.billetweb.fr/concert')).toBe(
      'https://www.billetweb.fr/concert',
    )
    expect(normalizeTicketingUrl('http://atabal.fr')).toBe('http://atabal.fr/')
  })

  it('completes a scheme-less domain, which a href would otherwise read as a relative path', () => {
    expect(normalizeTicketingUrl('www.atabal-biarritz.fr/billets')).toBe(
      'https://www.atabal-biarritz.fr/billets',
    )
    expect(normalizeTicketingUrl('billetweb.fr/e/123?src=goazen')).toBe(
      'https://billetweb.fr/e/123?src=goazen',
    )
  })

  it('trims surrounding whitespace', () => {
    expect(normalizeTicketingUrl('  https://shotgun.live/fr/events/x  ')).toBe(
      'https://shotgun.live/fr/events/x',
    )
  })

  it('rejects free text, which is what Google flags as an invalid offers.url', () => {
    expect(normalizeTicketingUrl('Sur place')).toBeUndefined()
    expect(normalizeTicketingUrl('sur place le soir même')).toBeUndefined()
    expect(normalizeTicketingUrl('@lasalle_biarritz')).toBeUndefined()
    expect(normalizeTicketingUrl('gratuit')).toBeUndefined()
    expect(normalizeTicketingUrl('06 12 34 56 78')).toBeUndefined()
  })

  it('rejects an empty or missing value', () => {
    expect(normalizeTicketingUrl(undefined)).toBeUndefined()
    expect(normalizeTicketingUrl(null)).toBeUndefined()
    expect(normalizeTicketingUrl('')).toBeUndefined()
    expect(normalizeTicketingUrl('   ')).toBeUndefined()
  })

  it('rejects other schemes — the submission form is public, so a href must never carry javascript:', () => {
    expect(normalizeTicketingUrl('javascript:alert(1)')).toBeUndefined()
    expect(normalizeTicketingUrl('mailto:contact@atabal.fr')).toBeUndefined()
    expect(normalizeTicketingUrl('data:text/html,<script>')).toBeUndefined()
  })

  it('rejects a hostname that is not a domain', () => {
    expect(normalizeTicketingUrl('https://localhost')).toBeUndefined()
    expect(normalizeTicketingUrl('billetterie')).toBeUndefined()
  })
})
