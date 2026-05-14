import { describe, it, expect } from 'vitest'
import { formatCompactNumber, formatCurrency, formatPercent, formatDuration } from '@/lib/formatters'

describe('formatCompactNumber', () => {
  it('formats thousands with k suffix', () => {
    expect(formatCompactNumber(1234)).toBe('1.2k')
    expect(formatCompactNumber(1500)).toBe('1.5k')
    expect(formatCompactNumber(9999)).toBe('10k')
  })

  it('formats millions with m suffix', () => {
    expect(formatCompactNumber(1234567)).toBe('1.2m')
    expect(formatCompactNumber(2500000)).toBe('2.5m')
  })

  it('formats billions with b suffix', () => {
    expect(formatCompactNumber(1234567890)).toBe('1.2b')
  })

  it('returns string for numbers below 1000', () => {
    expect(formatCompactNumber(0)).toBe('0')
    expect(formatCompactNumber(42)).toBe('42')
    expect(formatCompactNumber(999)).toBe('999')
  })

  it('handles negative numbers', () => {
    expect(formatCompactNumber(-1234)).toBe('-1.2k')
    expect(formatCompactNumber(-1500000)).toBe('-1.5m')
  })

  it('returns fallback for null/undefined', () => {
    expect(formatCompactNumber(null as unknown as number)).toBe('--')
    expect(formatCompactNumber(undefined as unknown as number)).toBe('--')
  })
})

describe('formatCurrency', () => {
  it('formats with yen symbol', () => {
    expect(formatCurrency(123.45)).toBe('￥123.45')
    expect(formatCurrency(0)).toBe('￥0.00')
    expect(formatCurrency(5)).toBe('￥5.00')
  })

  it('handles large amounts', () => {
    expect(formatCurrency(1234567.89)).toBe('￥1234567.89')
  })

  it('handles negative amounts', () => {
    expect(formatCurrency(-50)).toBe('￥-50.00')
  })

  it('returns fallback for null/undefined', () => {
    expect(formatCurrency(null as unknown as number)).toBe('--')
    expect(formatCurrency(undefined as unknown as number)).toBe('--')
  })
})

describe('formatPercent', () => {
  it('formats ratio with leading percent sign', () => {
    expect(formatPercent(0.123)).toBe('%12.3')
    expect(formatPercent(1)).toBe('%100')
    expect(formatPercent(0)).toBe('%0')
  })

  it('handles decimal precision', () => {
    expect(formatPercent(0.3333)).toBe('%33.3')
    expect(formatPercent(0.005)).toBe('%0.5')
  })

  it('handles negative percentages', () => {
    expect(formatPercent(-0.15)).toBe('%-15')
  })

  it('returns fallback for null/undefined', () => {
    expect(formatPercent(null as unknown as number)).toBe('--')
    expect(formatPercent(undefined as unknown as number)).toBe('--')
  })
})

describe('formatDuration', () => {
  it('formats seconds only', () => {
    expect(formatDuration(45)).toBe('45s')
    expect(formatDuration(0)).toBe('0s')
  })

  it('formats minutes and seconds', () => {
    expect(formatDuration(90)).toBe('1m30s')
    expect(formatDuration(125)).toBe('2m5s')
  })

  it('formats hours minutes seconds', () => {
    expect(formatDuration(3661)).toBe('1h1m1s')
    expect(formatDuration(3600)).toBe('1h')
    expect(formatDuration(7205)).toBe('2h5s')
  })

  it('formats hours only', () => {
    expect(formatDuration(7200)).toBe('2h')
  })

  it('handles negative durations', () => {
    expect(formatDuration(-90)).toBe('-1m30s')
  })

  it('returns fallback for null/undefined', () => {
    expect(formatDuration(null as unknown as number)).toBe('--')
    expect(formatDuration(undefined as unknown as number)).toBe('--')
  })
})
