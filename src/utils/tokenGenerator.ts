/**
 * tokenGenerator.ts
 * 100% Client-side cryptographic token and password generator using Web Crypto API.
 */

export interface PasswordOptions {
  length: number
  includeUpper: boolean
  includeLower: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeAmbiguous: boolean
}

export interface ApiTokenOptions {
  prefix: string
  length: number
  format: 'hex' | 'base64url' | 'base64' | 'alphanumeric'
  count: number
}

export interface PasswordStrength {
  entropy: number
  score: number // 0 - 4
  label: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong'
  crackTime: string
  color: string
}

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'
const AMBIGUOUS = '0O1lI'

export function generateSecurePassword(options: PasswordOptions): string {
  let chars = ''
  if (options.includeUpper) chars += UPPER
  if (options.includeLower) chars += LOWER
  if (options.includeNumbers) chars += NUMBERS
  if (options.includeSymbols) chars += SYMBOLS

  if (options.excludeAmbiguous) {
    chars = chars.split('').filter((c) => !AMBIGUOUS.includes(c)).join('')
  }

  if (!chars) return ''

  const length = Math.max(4, Math.min(128, options.length))
  const randomBytes = new Uint32Array(length)
  crypto.getRandomValues(randomBytes)

  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length]
  }

  return result
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      entropy: 0,
      score: 0,
      label: 'Very Weak',
      crackTime: 'Instant',
      color: 'text-rose-500',
    }
  }

  let poolSize = 0
  if (/[a-z]/.test(password)) poolSize += 26
  if (/[A-Z]/.test(password)) poolSize += 26
  if (/[0-9]/.test(password)) poolSize += 10
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33

  if (poolSize === 0) poolSize = 1

  const entropy = Math.round(password.length * Math.log2(poolSize))

  let score = 0
  let label: PasswordStrength['label'] = 'Very Weak'
  let crackTime = 'Instant'
  let color = 'text-rose-500'

  if (entropy < 28) {
    score = 0
    label = 'Very Weak'
    crackTime = '< 1 millisecond'
    color = 'text-rose-500'
  } else if (entropy < 36) {
    score = 1
    label = 'Weak'
    crackTime = 'Few seconds'
    color = 'text-amber-500'
  } else if (entropy < 60) {
    score = 2
    label = 'Medium'
    crackTime = 'Few hours to days'
    color = 'text-yellow-400'
  } else if (entropy < 80) {
    score = 3
    label = 'Strong'
    crackTime = 'Several centuries'
    color = 'text-emerald-400'
  } else {
    score = 4
    label = 'Very Strong'
    crackTime = 'Billions of years (Quantum Safe)'
    color = 'text-cyan-400'
  }

  return { entropy, score, label, crackTime, color }
}

export function generateApiTokens(options: ApiTokenOptions): string[] {
  const count = Math.max(1, Math.min(50, options.count))
  const length = Math.max(8, Math.min(128, options.length))
  const results: string[] = []

  for (let i = 0; i < count; i++) {
    let tokenBody = ''

    if (options.format === 'hex') {
      const bytes = new Uint8Array(Math.ceil(length / 2))
      crypto.getRandomValues(bytes)
      tokenBody = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, length)
    } else if (options.format === 'base64' || options.format === 'base64url') {
      const bytes = new Uint8Array(Math.ceil((length * 3) / 4))
      crypto.getRandomValues(bytes)
      let b64 = btoa(String.fromCharCode(...bytes))
      if (options.format === 'base64url') {
        b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      }
      tokenBody = b64.slice(0, length)
    } else {
      // Alphanumeric
      const chars = UPPER + LOWER + NUMBERS
      const bytes = new Uint32Array(length)
      crypto.getRandomValues(bytes)
      for (let j = 0; j < length; j++) {
        tokenBody += chars[bytes[j] % chars.length]
      }
    }

    const fullToken = options.prefix ? `${options.prefix}${tokenBody}` : tokenBody
    results.push(fullToken)
  }

  return results
}
