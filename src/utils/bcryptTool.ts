import bcrypt from 'bcryptjs'

export interface BcryptGenerateResult {
  hash: string
  salt: string
  rounds: number
  durationMs: number
}

export interface BcryptVerifyResult {
  isMatch: boolean
  durationMs: number
  hashDetails?: BcryptHashDetails
  error?: string
}

export interface BcryptHashDetails {
  version: string
  rounds: number
  salt: string
  checksum: string
}

export function inspectBcryptHash(hash: string): BcryptHashDetails | null {
  const clean = hash.trim()
  // Bcrypt format: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
  const match = clean.match(/^\$2([aby])\$(\d\d)\$([A-Za-z0-9./]{22})([A-Za-z0-9./]{31})$/)
  if (!match) return null

  return {
    version: `$2${match[1]}`,
    rounds: parseInt(match[2], 10),
    salt: match[3],
    checksum: match[4],
  }
}

export async function generateBcryptHash(
  plainText: string,
  rounds: number = 10
): Promise<BcryptGenerateResult> {
  const start = performance.now()
  const salt = await bcrypt.genSalt(rounds)
  const hash = await bcrypt.hash(plainText, salt)
  const end = performance.now()

  return {
    hash,
    salt,
    rounds,
    durationMs: Number((end - start).toFixed(1)),
  }
}

export async function verifyBcryptHash(
  plainText: string,
  hash: string
): Promise<BcryptVerifyResult> {
  const start = performance.now()
  const details = inspectBcryptHash(hash)

  if (!details) {
    return {
      isMatch: false,
      durationMs: 0,
      error: 'Invalid Bcrypt hash format. Expected a $2a$, $2b$, or $2y$ 60-character hash string.',
    }
  }

  try {
    const isMatch = await bcrypt.compare(plainText, hash.trim())
    const end = performance.now()
    return {
      isMatch,
      durationMs: Number((end - start).toFixed(1)),
      hashDetails: details,
    }
  } catch (err) {
    return {
      isMatch: false,
      durationMs: 0,
      error: (err as Error).message,
    }
  }
}
