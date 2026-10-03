import { describe, expect, it } from 'vitest'
import { hasBearerSecret } from './bearer-auth'

describe('hasBearerSecret', () => {
  it('accepte le bon secret', () => {
    expect(hasBearerSecret('Bearer s3cret', 's3cret')).toBe(true)
  })

  it('refuse un mauvais secret ou un en-tête absent', () => {
    expect(hasBearerSecret('Bearer autre', 's3cret')).toBe(false)
    expect(hasBearerSecret(null, 's3cret')).toBe(false)
  })

  it('refuse tout quand le secret n’est pas configuré', () => {
    expect(hasBearerSecret('Bearer ', undefined)).toBe(false)
    expect(hasBearerSecret('Bearer ', '')).toBe(false)
  })
})
