import { describe, expect, it } from 'vitest'
import { approxCount, capitalize, formatCount, pluralize } from './stats-wording'

const NBSP = ' '

describe('formatCount', () => {
  it('groups thousands the French way', () => {
    expect(formatCount(5619)).toBe(`5${NBSP}619`)
    expect(formatCount(47)).toBe('47')
  })
})

describe('approxCount', () => {
  it('rounds down to the hundred above a thousand', () => {
    expect(approxCount(5619)).toBe(`plus de 5${NBSP}600`)
    expect(approxCount(5600)).toBe(`plus de 5${NBSP}600`)
    expect(approxCount(1000)).toBe(`plus de 1${NBSP}000`)
  })

  it('rounds down to the ten between 100 and 1000', () => {
    expect(approxCount(160)).toBe('plus de 160')
    expect(approxCount(169)).toBe('plus de 160')
  })

  it('stays exact below 100, where rounding would cost more than it protects', () => {
    expect(approxCount(47)).toBe('47')
    expect(approxCount(0)).toBe('0')
  })

  it('never announces more than reality', () => {
    for (const value of [100, 101, 999, 1001, 5619, 12345]) {
      const digits = Number(approxCount(value).replace(/[^0-9]/g, ''))
      expect(digits).toBeLessThanOrEqual(value)
    }
  })
})

describe('pluralize', () => {
  it('agrees with the count', () => {
    expect(pluralize(1, 'concert')).toBe('1 concert')
    expect(pluralize(12, 'concert')).toBe('12 concerts')
    expect(pluralize(0, 'concert')).toBe('0 concert')
  })
})

describe('capitalize', () => {
  it('uppercases the first letter only', () => {
    expect(capitalize('plus de 5 600')).toBe('Plus de 5 600')
  })
})
