/**
 * Flattens a nested object into a single-level object with dot-notation keys.
 * e.g. { a: { b: 1 } } -> { "a.b": 1 }
 */
export function flattenObject(
  obj: Record<string, unknown>,
  prefix = '',
  delimiter = '.'
): Record<string, string> {
  return Object.entries(obj).reduce<Record<string, string>>((acc, [key, value]) => {
    const fullKey = prefix ? `${prefix}${delimiter}${key}` : key

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(acc, flattenObject(value as Record<string, unknown>, fullKey, delimiter))
    } else if (Array.isArray(value)) {
      acc[fullKey] = JSON.stringify(value)
    } else {
      acc[fullKey] = value === null || value === undefined ? '' : String(value)
    }

    return acc
  }, {})
}

/**
 * Escapes a CSV cell value:
 * - Wraps in double quotes if it contains a comma, newline, or double quote.
 * - Escapes internal double quotes by doubling them.
 */
export function escapeCsvCell(value: string): string {
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export interface ConversionResult {
  csv: string
  rowCount: number
  columnCount: number
  headers: string[]
}

export interface ConversionError {
  message: string
  details?: string
}

/**
 * Converts a JSON string to CSV format.
 * Supports:
 *  - Array of objects (most common)
 *  - A single object (treated as one row)
 *  - Array of primitives
 */
export function jsonToCsv(jsonInput: string, delimiter = ','): ConversionResult {
  let parsed: unknown

  try {
    parsed = JSON.parse(jsonInput)
  } catch (e) {
    throw new Error(`Invalid JSON: ${(e as Error).message}`)
  }

  // Normalize to array
  let rows: unknown[]
  if (Array.isArray(parsed)) {
    rows = parsed
  } else if (typeof parsed === 'object' && parsed !== null) {
    rows = [parsed]
  } else {
    throw new Error('JSON root must be an object or an array of objects.')
  }

  if (rows.length === 0) {
    return { csv: '', rowCount: 0, columnCount: 0, headers: [] }
  }

  // Flatten all rows and collect all headers
  const flatRows = rows.map((row) => {
    if (typeof row === 'object' && row !== null && !Array.isArray(row)) {
      return flattenObject(row as Record<string, unknown>)
    }
    // Primitive rows
    return { value: String(row) }
  })

  // Collect union of all headers (preserving insertion order)
  const headerSet = new Set<string>()
  flatRows.forEach((row) => Object.keys(row).forEach((k) => headerSet.add(k)))
  const headers = Array.from(headerSet)

  // Build CSV lines
  const headerLine = headers.map(escapeCsvCell).join(delimiter)
  const dataLines = flatRows.map((row) =>
    headers.map((h) => escapeCsvCell(row[h] ?? '')).join(delimiter)
  )

  const csv = [headerLine, ...dataLines].join('\n')

  return {
    csv,
    rowCount: rows.length,
    columnCount: headers.length,
    headers,
  }
}
