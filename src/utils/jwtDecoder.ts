export interface JwtHeader {
  alg?: string
  typ?: string
  kid?: string
  [key: string]: unknown
}

export interface JwtPayload {
  iss?: string
  sub?: string
  aud?: string | string[]
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
  [key: string]: unknown
}

export interface JwtExpirationStatus {
  isExpired: boolean
  expiresAt?: Date
  issuedAt?: Date
  notBeforeAt?: Date
  timeRemainingOrPast?: string
}

export interface JwtDecodeResult {
  isValid: boolean
  rawHeader: string
  rawPayload: string
  signature: string
  header: JwtHeader
  payload: JwtPayload
  formattedHeader: string
  formattedPayload: string
  expiration: JwtExpirationStatus
  error?: string
}

/**
 * Base64Url decoding helper
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4 !== 0) {
    base64 += '='
  }
  try {
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(base64), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
  } catch {
    return atob(base64)
  }
}

/**
 * Formats time difference in human readable format (e.g. "in 4 hours", "2 days ago")
 */
function formatRelativeTime(targetDate: Date): { isPast: boolean; text: string } {
  const now = new Date().getTime()
  const target = targetDate.getTime()
  const diffMs = Math.abs(target - now)
  const isPast = now > target

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  let text = ''
  if (days > 0) {
    text = `${days} ${days === 1 ? 'day' : 'days'}`
  } else if (hours > 0) {
    text = `${hours} ${hours === 1 ? 'hour' : 'hours'}`
  } else if (minutes > 0) {
    text = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
  } else {
    text = `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`
  }

  return { isPast, text: isPast ? `${text} ago` : `in ${text}` }
}

/**
 * Decodes and inspects a JSON Web Token (JWT)
 */
export function decodeJwt(tokenString: string): JwtDecodeResult {
  const trimmed = tokenString.trim()

  if (!trimmed) {
    return {
      isValid: false,
      rawHeader: '',
      rawPayload: '',
      signature: '',
      header: {},
      payload: {},
      formattedHeader: '',
      formattedPayload: '',
      expiration: { isExpired: false },
    }
  }

  const parts = trimmed.split('.')
  if (parts.length !== 3) {
    return {
      isValid: false,
      rawHeader: '',
      rawPayload: '',
      signature: '',
      header: {},
      payload: {},
      formattedHeader: '',
      formattedPayload: '',
      expiration: { isExpired: false },
      error: 'Invalid JWT format. Token must consist of 3 parts separated by dots (header.payload.signature).',
    }
  }

  const [rawHeader, rawPayload, signature] = parts

  let header: JwtHeader = {}
  let payload: JwtPayload = {}
  let formattedHeader = ''
  let formattedPayload = ''

  try {
    const decodedHeaderStr = base64UrlDecode(rawHeader)
    header = JSON.parse(decodedHeaderStr)
    formattedHeader = JSON.stringify(header, null, 2)
  } catch (err) {
    return {
      isValid: false,
      rawHeader,
      rawPayload,
      signature,
      header: {},
      payload: {},
      formattedHeader: '',
      formattedPayload: '',
      expiration: { isExpired: false },
      error: `Failed to decode JWT Header: ${(err as Error).message}`,
    }
  }

  try {
    const decodedPayloadStr = base64UrlDecode(rawPayload)
    payload = JSON.parse(decodedPayloadStr)
    formattedPayload = JSON.stringify(payload, null, 2)
  } catch (err) {
    return {
      isValid: false,
      rawHeader,
      rawPayload,
      signature,
      header,
      payload: {},
      formattedHeader,
      formattedPayload: '',
      expiration: { isExpired: false },
      error: `Failed to decode JWT Payload: ${(err as Error).message}`,
    }
  }

  // Calculate token claims expiration status
  const expiration: JwtExpirationStatus = { isExpired: false }

  if (payload.exp && typeof payload.exp === 'number') {
    const expDate = new Date(payload.exp * 1000)
    expiration.expiresAt = expDate
    const rel = formatRelativeTime(expDate)
    expiration.isExpired = rel.isPast
    expiration.timeRemainingOrPast = rel.text
  }

  if (payload.iat && typeof payload.iat === 'number') {
    expiration.issuedAt = new Date(payload.iat * 1000)
  }

  if (payload.nbf && typeof payload.nbf === 'number') {
    expiration.notBeforeAt = new Date(payload.nbf * 1000)
  }

  return {
    isValid: true,
    rawHeader,
    rawPayload,
    signature,
    header,
    payload,
    formattedHeader,
    formattedPayload,
    expiration,
  }
}

/** Sample valid JWT for quick testing */
export const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ikx1Y2FzIEdhYnJpZWwiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MjUyNDYwODAwMCwicm9sZSI6ImRldmVsb3BlciIsImFwcCI6ImRldi1raXQudGVjaCJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
