import { describe, expect, it } from 'vitest'
import { toDayKey } from './day-key'

describe('toDayKey', () => {
  it('réduit un timestamp ISO à sa journée UTC', () => {
    expect(toDayKey('2026-09-14T13:42:07.913Z')).toBe('2026-09-14')
  })

  it('donne la même clé pour deux instants de la même journée UTC', () => {
    const matin = toDayKey('2026-09-14T00:00:00.001Z')
    const soir = toDayKey('2026-09-14T23:59:59.999Z')
    expect(matin).toBe(soir)
  })

  it('change de clé au passage de minuit UTC', () => {
    expect(toDayKey('2026-09-14T23:59:59.999Z')).not.toBe(toDayKey('2026-09-15T00:00:00.000Z'))
  })

  it('accepte un objet Date', () => {
    expect(toDayKey(new Date('2026-01-05T09:30:00Z'))).toBe('2026-01-05')
  })

  it('retourne une chaîne vide pour une entrée absente ou invalide', () => {
    expect(toDayKey(undefined)).toBe('')
    expect(toDayKey(null)).toBe('')
    expect(toDayKey('')).toBe('')
    expect(toDayKey('pas-une-date')).toBe('')
  })
})
