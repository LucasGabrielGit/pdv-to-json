export type EscapeMode =
  | 'html-encode'
  | 'html-decode'
  | 'json-escape'
  | 'json-unescape'
  | 'js-escape'
  | 'js-unescape'

export type EntityFormat = 'named' | 'decimal' | 'hex'

const NAMED_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
}

const REVERSE_NAMED_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#039;': "'",
  '&apos;': "'",
  '&#x2F;': '/',
  '&#x60;': '`',
  '&#x3D;': '=',
  '&nbsp;': ' ',
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&euro;': '€',
  '&pound;': '£',
  '&yen;': '¥',
  '&cent;': '¢',
}

export function encodeHtmlEntities(
  text: string,
  format: EntityFormat = 'named',
  encodeAllNonAscii: boolean = false
): string {
  if (!text) return ''

  return text.replace(/[&<>"'/`=]|[\u007F-\uFFFF]/g, (char) => {
    if (format === 'named' && NAMED_ENTITIES[char]) {
      return NAMED_ENTITIES[char]
    }

    const code = char.codePointAt(0)
    if (!code) return char

    if (code > 127 || encodeAllNonAscii || NAMED_ENTITIES[char]) {
      if (format === 'hex') {
        return `&#x${code.toString(16).toUpperCase()};`
      }
      return `&#${code};`
    }

    return char
  })
}

export function decodeHtmlEntities(text: string): string {
  if (!text) return ''

  let result = text

  // 1. Replace known named entities
  for (const [entity, char] of Object.entries(REVERSE_NAMED_ENTITIES)) {
    result = result.replaceAll(entity, char)
  }

  // 2. Replace Hex entities (&#xNN;)
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
    try {
      const code = parseInt(hex, 16)
      return String.fromCodePoint(code)
    } catch {
      return _
    }
  })

  // 3. Replace Decimal entities (&#NNN;)
  result = result.replace(/&#([0-9]+);/g, (_, dec) => {
    try {
      const code = parseInt(dec, 10)
      return String.fromCodePoint(code)
    } catch {
      return _
    }
  })

  return result
}

export function escapeJsonString(text: string): string {
  return JSON.stringify(text).slice(1, -1)
}

export function unescapeJsonString(text: string): string {
  try {
    return JSON.parse(`"${text.replace(/"/g, '\\"')}"`)
  } catch {
    return text
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '\r')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
  }
}

export function escapeJsString(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
}

export function unescapeJsString(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
}

export interface UnicodeCharInfo {
  char: string
  codePoint: string
  decimal: number
  htmlEntity: string
  hex: string
}

export function inspectUnicodeChars(text: string): UnicodeCharInfo[] {
  const chars = Array.from(text)
  return chars.slice(0, 50).map((char) => {
    const code = char.codePointAt(0) || 0
    const hex = code.toString(16).toUpperCase().padStart(4, '0')
    return {
      char,
      codePoint: `U+${hex}`,
      decimal: code,
      htmlEntity: `&#${code};`,
      hex: `&#x${hex};`,
    }
  })
}
