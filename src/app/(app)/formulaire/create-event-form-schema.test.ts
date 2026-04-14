import { describe, expect, it } from 'vitest'
import { createEventSchema } from './create-event-form-schema'

function validPayload() {
  return {
    title: 'Soirée test',
    event_kind: { event_kind: 'dj_set' as const },
    date: { date: new Date('2026-08-01T12:00:00.000Z') },
    genres: ['507f1f77bcf86cd799439011'],
    price: '12',
    email: 'contact@example.com',
    location: { name: 'Salle Test', id: 'loc-1' },
    cguAccepted: true as const,
  }
}

describe('createEventSchema', () => {
  it('accepts a complete valid payload with location from the list', () => {
    const result = createEventSchema.safeParse(validPayload())
    expect(result.success).toBe(true)
  })

  it('accepts a valid payload with alternate venue and region', () => {
    const result = createEventSchema.safeParse({
      ...validPayload(),
      location: undefined,
      location_alt: 'Terrain vague',
      region: { region: 'landes' },
    })
    expect(result.success).toBe(true)
  })

  it('rejects when title is missing', () => {
    const { title: _t, ...rest } = validPayload()
    const result = createEventSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = createEventSchema.safeParse({
      ...validPayload(),
      email: 'not-an-email',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty genres array', () => {
    const result = createEventSchema.safeParse({
      ...validPayload(),
      genres: [],
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty price', () => {
    const result = createEventSchema.safeParse({
      ...validPayload(),
      price: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects price longer than 20 characters', () => {
    const result = createEventSchema.safeParse({
      ...validPayload(),
      price: 'x'.repeat(21),
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid event_kind', () => {
    const result = createEventSchema.safeParse({
      ...validPayload(),
      event_kind: { event_kind: 'invalid' },
    } as Parameters<typeof createEventSchema.safeParse>[0])
    expect(result.success).toBe(false)
  })

  it('rejects when neither location nor alternate venue + region is provided', () => {
    const result = createEventSchema.safeParse({
      ...validPayload(),
      location: undefined,
      location_alt: undefined,
      region: undefined,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.region?.length).toBeGreaterThan(0)
    }
  })

  it('rejects alternate venue without region', () => {
    const result = createEventSchema.safeParse({
      ...validPayload(),
      location: undefined,
      location_alt: 'Somewhere',
      region: undefined,
    })
    expect(result.success).toBe(false)
  })

  it('accepts payload with cguAccepted: true', () => {
    const result = createEventSchema.safeParse({ ...validPayload(), cguAccepted: true })
    expect(result.success).toBe(true)
  })

  it('rejects payload with cguAccepted: false', () => {
    const result = createEventSchema.safeParse({
      ...validPayload(),
      cguAccepted: false,
    } as Parameters<typeof createEventSchema.safeParse>[0])
    expect(result.success).toBe(false)
  })

  it('rejects payload with cguAccepted absent', () => {
    const { cguAccepted: _c, ...rest } = validPayload()
    const result = createEventSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })
})
