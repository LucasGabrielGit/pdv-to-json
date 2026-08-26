import { describe, it, expect } from 'vitest'
import {
  generateSecurePassword,
  calculatePasswordStrength,
  generateApiTokens,
} from '../tokenGenerator'

describe('tokenGenerator', () => {
  it('should generate secure password with expected length and charset', () => {
    const password = generateSecurePassword({
      length: 16,
      includeUpper: true,
      includeLower: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeAmbiguous: false,
    })

    expect(password.length).toBe(16)
    expect(typeof password).toBe('string')
  })

  it('should calculate password entropy and strength correctly', () => {
    const weak = calculatePasswordStrength('123456')
    expect(weak.score).toBeLessThanOrEqual(1)
    expect(weak.label).toMatch(/Weak/)

    const strong = calculatePasswordStrength('Kx9#mP$2vL@8qZ!w')
    expect(strong.score).toBeGreaterThanOrEqual(3)
    expect(strong.label).toMatch(/Strong/)
  })

  it('should generate API tokens with prefix and correct format', () => {
    const tokens = generateApiTokens({
      prefix: 'sk_live_',
      length: 32,
      format: 'alphanumeric',
      count: 3,
    })

    expect(tokens.length).toBe(3)
    tokens.forEach((t) => {
      expect(t.startsWith('sk_live_')).toBe(true)
      expect(t.length).toBe(40) // 8 prefix + 32 body
    })
  })
})
