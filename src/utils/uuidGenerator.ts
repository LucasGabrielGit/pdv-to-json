export type IdType = 'uuidv4' | 'uuidv7' | 'ulid'
export type ExportFormat = 'plain' | 'json' | 'csv' | 'sql'

export interface UuidGeneratorOptions {
  type: IdType
  quantity: number
  uppercase?: boolean
  noHyphens?: boolean
  braces?: boolean
  tableName?: string
}

export interface GeneratedIdItem {
  id: string
  raw: string
  createdAt?: Date
}

export interface UuidGeneratorResult {
  items: GeneratedIdItem[]
  formattedOutput: string
  totalCount: number
}

// Crockford's Base32 character set for ULID
const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

/**
 * Generates a ULID (Universally Unique Lexicographically Sortable Identifier)
 */
export function generateUlid(now = Date.now()): string {
  let time = now
  const timeChars = new Array(10)
  for (let i = 9; i >= 0; i--) {
    timeChars[i] = ENCODING[time % 32]
    time = Math.floor(time / 32)
  }

  const randChars = new Array(16)
  const randBytes = new Uint8Array(16)
  crypto.getRandomValues(randBytes)
  for (let i = 0; i < 16; i++) {
    randChars[i] = ENCODING[randBytes[i] % 32]
  }

  return timeChars.join('') + randChars.join('')
}

/**
 * Generates a UUID v7 (Unix epoch time + random bits)
 */
export function generateUuidV7(now = Date.now()): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)

  // Timestamp in 48 bits
  bytes[0] = Math.floor(now / 0x10000000000) & 0xff
  bytes[1] = Math.floor(now / 0x100000000) & 0xff
  bytes[2] = Math.floor(now / 0x1000000) & 0xff
  bytes[3] = Math.floor(now / 0x10000) & 0xff
  bytes[4] = Math.floor(now / 0x100) & 0xff
  bytes[5] = now & 0xff

  // Version 7 in 4 bits
  bytes[6] = (bytes[6] & 0x0f) | 0x70
  // Variant 10 in 2 bits
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(
    12,
    16
  )}-${hex.substring(16, 20)}-${hex.substring(20)}`
}

/**
 * Generates UUID v4 using Web Crypto API
 */
export function generateUuidV4(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(
    12,
    16
  )}-${hex.substring(16, 20)}-${hex.substring(20)}`
}

/**
 * Formats a raw ID string according to options (uppercase, hyphens, braces)
 */
export function formatIdString(
  rawId: string,
  options: Pick<UuidGeneratorOptions, 'uppercase' | 'noHyphens' | 'braces'>
): string {
  let res = rawId
  if (options.noHyphens) {
    res = res.replace(/-/g, '')
  }
  if (options.uppercase) {
    res = res.toUpperCase()
  } else {
    res = res.toLowerCase()
  }
  if (options.braces) {
    res = `{${res}}`
  }
  return res
}

/**
 * Batch generates UUID v4, UUID v7, or ULID identifiers
 */
export function generateIds(
  options: UuidGeneratorOptions,
  format: ExportFormat = 'plain'
): UuidGeneratorResult {
  const { type, quantity, uppercase = false, noHyphens = false, braces = false, tableName = 'users' } = options
  const count = Math.max(1, Math.min(100, quantity))

  const items: GeneratedIdItem[] = []

  for (let i = 0; i < count; i++) {
    let raw = ''
    if (type === 'uuidv4') {
      raw = generateUuidV4()
    } else if (type === 'uuidv7') {
      raw = generateUuidV7()
    } else {
      raw = generateUlid()
    }

    const formatted = formatIdString(raw, { uppercase, noHyphens, braces })
    items.push({ id: formatted, raw })
  }

  let formattedOutput = ''
  if (format === 'plain') {
    formattedOutput = items.map((it) => it.id).join('\n')
  } else if (format === 'json') {
    formattedOutput = JSON.stringify(
      items.map((it) => it.id),
      null,
      2
    )
  } else if (format === 'csv') {
    formattedOutput = 'id\n' + items.map((it) => `"${it.id}"`).join('\n')
  } else if (format === 'sql') {
    formattedOutput = items
      .map((it) => `INSERT INTO ${tableName} (id) VALUES ('${it.id}');`)
      .join('\n')
  }

  return {
    items,
    formattedOutput,
    totalCount: items.length,
  }
}
