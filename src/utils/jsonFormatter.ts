export interface JsonFormattingOptions {
  indent?: number | '\t'
  minify?: boolean
  fixTrailingCommas?: boolean
}

export interface JsonFormattingResult {
  output: string
  isValid: boolean
  lineCount: number
  charCount: number
  byteSize: number
  keyCount: number
  maxDepth: number
  error?: {
    message: string
    line?: number
    column?: number
  }
}

/** Format byte size to human readable string (Bytes, KB, MB) */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Counts total keys and max nesting depth in a JSON object
 */
function analyzeJsonObject(obj: unknown, currentDepth = 1): { totalKeys: number; maxDepth: number } {
  if (typeof obj !== 'object' || obj === null) {
    return { totalKeys: 0, maxDepth: currentDepth }
  }

  let totalKeys = 0
  let maxDepth = currentDepth

  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (typeof item === 'object' && item !== null) {
        const child = analyzeJsonObject(item, currentDepth + 1)
        totalKeys += child.totalKeys
        if (child.maxDepth > maxDepth) maxDepth = child.maxDepth
      }
    }
  } else {
    const keys = Object.keys(obj)
    totalKeys += keys.length

    for (const key of keys) {
      const val = (obj as Record<string, unknown>)[key]
      if (typeof val === 'object' && val !== null) {
        const child = analyzeJsonObject(val, currentDepth + 1)
        totalKeys += child.totalKeys
        if (child.maxDepth > maxDepth) maxDepth = child.maxDepth
      }
    }
  }

  return { totalKeys, maxDepth }
}

/**
 * Attempts to repair common JSON syntax mistakes (trailing commas, unquoted keys, single quotes)
 */
export function repairJsonSyntax(jsonText: string): string {
  let cleaned = jsonText.trim()
  // Remove trailing commas in objects and arrays
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1')
  // Replace single quotes with double quotes around strings
  cleaned = cleaned.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"')
  return cleaned
}

/**
 * Formats, validates, and analyzes JSON text
 */
export function formatJson(
  jsonText: string,
  options: JsonFormattingOptions = {}
): JsonFormattingResult {
  const { indent = 2, minify = false, fixTrailingCommas = false } = options

  if (!jsonText.trim()) {
    return {
      output: '',
      isValid: true,
      lineCount: 0,
      charCount: 0,
      byteSize: 0,
      keyCount: 0,
      maxDepth: 0,
    }
  }

  let inputToParse = jsonText
  if (fixTrailingCommas) {
    inputToParse = repairJsonSyntax(jsonText)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(inputToParse)
  } catch (err) {
    const message = (err as Error).message
    let line: number | undefined
    let column: number | undefined

    // Attempt to extract position from SyntaxError (e.g. "at position 45" or "line 2 column 5")
    const posMatch = message.match(/position (\d+)/i)
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10)
      const lines = jsonText.substring(0, pos).split('\n')
      line = lines.length
      column = lines[lines.length - 1].length + 1
    }

    const lineColMatch = message.match(/line (\d+) column (\d+)/i)
    if (lineColMatch) {
      line = parseInt(lineColMatch[1], 10)
      column = parseInt(lineColMatch[2], 10)
    }

    return {
      output: '',
      isValid: false,
      lineCount: jsonText.trim().split('\n').length,
      charCount: jsonText.length,
      byteSize: new TextEncoder().encode(jsonText).byteLength,
      keyCount: 0,
      maxDepth: 0,
      error: { message, line, column },
    }
  }

  const output = minify
    ? JSON.stringify(parsed)
    : JSON.stringify(parsed, null, indent)

  const { totalKeys, maxDepth } = analyzeJsonObject(parsed)
  const bytes = new TextEncoder().encode(output).byteLength

  return {
    output,
    isValid: true,
    lineCount: output.trim().split('\n').length,
    charCount: output.length,
    byteSize: bytes,
    keyCount: totalKeys,
    maxDepth,
  }
}
