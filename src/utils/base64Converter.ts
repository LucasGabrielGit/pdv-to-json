export interface Base64Options {
  urlSafe?: boolean
}

export interface Base64Result {
  output: string
  charCount: number
  byteSize: number
}

/**
 * Encodes UTF-8 string into Base64 format
 */
export function encodeBase64(
  text: string,
  options: Base64Options = {}
): Base64Result {
  const { urlSafe = false } = options

  if (!text) {
    return { output: '', charCount: 0, byteSize: 0 }
  }

  // Convert UTF-8 string to bytes then to Base64 (handles special characters, emojis, etc.)
  const bytes = new TextEncoder().encode(text)
  let binString = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binString += String.fromCharCode(bytes[i])
  }

  let base64 = btoa(binString)

  if (urlSafe) {
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }

  return {
    output: base64,
    charCount: base64.length,
    byteSize: bytes.byteLength,
  }
}

/**
 * Decodes Base64 string back into UTF-8 text
 */
export function decodeBase64(
  base64Text: string,
  options: Base64Options = {}
): Base64Result {
  const { urlSafe = false } = options
  let cleanInput = base64Text.trim()

  if (!cleanInput) {
    return { output: '', charCount: 0, byteSize: 0 }
  }

  if (urlSafe) {
    cleanInput = cleanInput.replace(/-/g, '+').replace(/_/g, '/')
    while (cleanInput.length % 4 !== 0) {
      cleanInput += '='
    }
  }

  try {
    const binString = atob(cleanInput)
    const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0))
    const decodedText = new TextDecoder().decode(bytes)

    return {
      output: decodedText,
      charCount: decodedText.length,
      byteSize: bytes.byteLength,
    }
  } catch (err) {
    throw new Error(`Invalid Base64 string: ${(err as Error).message}`)
  }
}
