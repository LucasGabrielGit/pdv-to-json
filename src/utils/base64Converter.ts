export interface Base64Options {
  urlSafe?: boolean
  outputFormat?: 'raw' | 'data-uri' | 'img-tag' | 'css-url'
  mimeType?: string
}

export interface Base64Result {
  output: string
  charCount: number
  byteSize: number
  mimeType?: string
  isBinary?: boolean
  fileCategory?: 'image' | 'pdf' | 'audio' | 'video' | 'text' | 'binary'
  dataUri?: string
}

/**
 * Extracts Data URI or Base64 payload if wrapped in HTML tags (<img src="...">), CSS (url(...)), or quotes
 */
export function extractDataUriOrBase64(input: string): string {
  let str = input.trim()

  // 1. Extract embedded data: URI from HTML tags (<img src="data:...">), CSS url("data:..."), etc.
  const dataUriMatch = str.match(/data:([a-zA-Z0-9-]+\/[a-zA-Z0-9-+.]+)?;base64,([A-Za-z0-9+/=_-]+)/)
  if (dataUriMatch) {
    return dataUriMatch[0]
  }

  // 2. Extract Base64 payload if string is quoted
  const quotedMatch = str.match(/^["']([A-Za-z0-9+/=_-]+)["']$/)
  if (quotedMatch) {
    return quotedMatch[1]
  }

  return str
}

/**
 * Detects MIME type and category from raw Base64 string or Data URI
 */
export function detectBase64Type(input: string): {
  mimeType: string
  category: 'image' | 'pdf' | 'audio' | 'video' | 'text' | 'binary'
  dataUri?: string
  rawBase64: string
} {
  const trimmed = extractDataUriOrBase64(input)

  // 1. Data URI pattern
  const dataUriMatch = trimmed.match(/^data:([^;]+);base64,([\s\S]*)$/)
  if (dataUriMatch) {
    const mimeType = dataUriMatch[1]
    const rawBase64 = dataUriMatch[2]

    let category: 'image' | 'pdf' | 'audio' | 'video' | 'text' | 'binary' = 'binary'
    if (mimeType.startsWith('image/')) category = 'image'
    else if (mimeType === 'application/pdf') category = 'pdf'
    else if (mimeType.startsWith('audio/')) category = 'audio'
    else if (mimeType.startsWith('video/')) category = 'video'
    else if (mimeType.startsWith('text/')) category = 'text'

    return { mimeType, category, dataUri: trimmed, rawBase64 }
  }

  // 2. Detect magic bytes in raw Base64
  let mimeType = 'text/plain'
  let category: 'image' | 'pdf' | 'audio' | 'video' | 'text' | 'binary' = 'text'

  if (trimmed.startsWith('iVBORw0KGgo')) {
    mimeType = 'image/png'
    category = 'image'
  } else if (trimmed.startsWith('/9j/')) {
    mimeType = 'image/jpeg'
    category = 'image'
  } else if (trimmed.startsWith('R0lGOD')) {
    mimeType = 'image/gif'
    category = 'image'
  } else if (trimmed.startsWith('UklGR')) {
    mimeType = 'image/webp'
    category = 'image'
  } else if (trimmed.startsWith('PHN2Zw')) {
    mimeType = 'image/svg+xml'
    category = 'image'
  } else if (trimmed.startsWith('JVBERi0')) {
    mimeType = 'application/pdf'
    category = 'pdf'
  } else if (trimmed.startsWith('UEsDB')) {
    mimeType = 'application/zip'
    category = 'binary'
  }

  const dataUri = category !== 'text' ? `data:${mimeType};base64,${trimmed}` : undefined

  return { mimeType, category, dataUri, rawBase64: trimmed }
}

/**
 * Encodes UTF-8 string into Base64 format
 */
export function encodeBase64(
  text: string,
  options: Base64Options = {}
): Base64Result {
  const { urlSafe = false, outputFormat = 'raw', mimeType: customMime } = options

  if (!text) {
    return { output: '', charCount: 0, byteSize: 0 }
  }

  const extracted = extractDataUriOrBase64(text)

  let rawB64 = ''
  let detectedMime = customMime || 'text/plain'
  let category: Base64Result['fileCategory'] = 'text'

  if (extracted.startsWith('data:')) {
    const typeInfo = detectBase64Type(extracted)
    rawB64 = typeInfo.rawBase64
    detectedMime = typeInfo.mimeType
    category = typeInfo.category
  } else {
    // Convert UTF-8 string to bytes then to Base64
    const bytes = new TextEncoder().encode(text)
    let binString = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binString += String.fromCharCode(bytes[i])
    }
    rawB64 = btoa(binString)
  }

  if (urlSafe) {
    rawB64 = rawB64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }

  const dataUri = `data:${detectedMime};base64,${rawB64}`
  let finalOutput = rawB64

  if (outputFormat === 'data-uri') {
    finalOutput = dataUri
  } else if (outputFormat === 'img-tag') {
    finalOutput = `<img src="${dataUri}" alt="Base64 Image" />`
  } else if (outputFormat === 'css-url') {
    finalOutput = `url("${dataUri}")`
  }

  return {
    output: finalOutput,
    charCount: finalOutput.length,
    byteSize: Math.round((rawB64.length * 3) / 4),
    mimeType: detectedMime,
    isBinary: category !== 'text',
    fileCategory: category,
    dataUri,
  }
}

/**
 * Decodes Base64 string back into UTF-8 text or Data URI
 */
export function decodeBase64(
  base64Text: string,
  options: Base64Options = {}
): Base64Result {
  const { urlSafe = false } = options
  const extracted = extractDataUriOrBase64(base64Text)

  if (!extracted) {
    return { output: '', charCount: 0, byteSize: 0 }
  }

  const typeInfo = detectBase64Type(extracted)
  let payloadToDecode = typeInfo.rawBase64

  if (urlSafe) {
    payloadToDecode = payloadToDecode.replace(/-/g, '+').replace(/_/g, '/')
    while (payloadToDecode.length % 4 !== 0) {
      payloadToDecode += '='
    }
  }

  // If input is binary (Image, PDF, Zip), return Data URI as decoded output for rich preview & download
  if (typeInfo.category !== 'text') {
    return {
      output: typeInfo.dataUri || extracted,
      charCount: payloadToDecode.length,
      byteSize: Math.round((payloadToDecode.length * 3) / 4),
      mimeType: typeInfo.mimeType,
      isBinary: true,
      fileCategory: typeInfo.category,
      dataUri: typeInfo.dataUri,
    }
  }

  try {
    const binString = atob(payloadToDecode)
    const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0))
    const decodedText = new TextDecoder().decode(bytes)

    return {
      output: decodedText,
      charCount: decodedText.length,
      byteSize: bytes.byteLength,
      mimeType: 'text/plain',
      isBinary: false,
      fileCategory: 'text',
    }
  } catch (err) {
    throw new Error(`Invalid Base64 string: ${(err as Error).message}`)
  }
}
