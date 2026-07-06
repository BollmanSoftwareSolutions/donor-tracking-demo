import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatCompactCurrency,
  formatDate,
} from '../components/format'

describe('formatCurrency', () => {
  it('formats whole dollar amounts with no fraction digits', () => {
    expect(formatCurrency(1650)).toBe('$1,650')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0')
  })

  it('rounds to the nearest dollar', () => {
    expect(formatCurrency(1650.49)).toBe('$1,650')
  })
})

describe('formatCompactCurrency', () => {
  it('uses compact notation for thousands', () => {
    const result = formatCompactCurrency(511365)
    expect(result.startsWith('$')).toBe(true)
    expect(result).toMatch(/K$/)
  })

  it('uses compact notation for millions', () => {
    expect(formatCompactCurrency(1_000_000)).toBe('$1M')
  })
})

describe('formatDate', () => {
  it('formats an ISO date into a readable label', () => {
    const result = formatDate('2026-07-15')
    expect(result).toMatch(/Jul/)
    expect(result).toMatch(/2026/)
  })
})
