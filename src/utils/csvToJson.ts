/**
 * Parses a single CSV line respecting double-quoted fields that may contain
 * commas, newlines, or escaped quotes ("").
 */
function parseCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = []
  let current = ''
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const ch = line[i]

    if (inQuotes) {
      if (ch === '"') {
        // Peek ahead — double-quote means escaped quote inside field
        if (line[i + 1] === '"') {
          current += '"'
          i += 2
          continue
        }
        inQuotes = false
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (line.startsWith(delimiter, i)) {
        cells.push(current)
        current = ''
        i += delimiter.length
        continue
      } else {
        current += ch
      }
    }
    i++
  }

  cells.push(current)
  return cells
}

/**
 * Splits raw CSV text into logical rows, correctly handling multi-line quoted fields.
 */
function splitCsvRows(text: string): string[] {
  const rows: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]

    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '""'
        i++
      } else {
        inQuotes = !inQuotes
        current += ch
      }
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      // Handle \r\n
      if (ch === '\r' && text[i + 1] === '\n') i++
      if (current.trim() !== '') rows.push(current)
      current = ''
    } else {
      current += ch
    }
  }

  if (current.trim() !== '') rows.push(current)
  return rows
}

/**
 * Attempts to cast a string cell to a native JS type.
 * Numbers and booleans are coerced; everything else stays a string.
 */
function castValue(value: string): unknown {
  if (value === '') return null
  if (value === 'true') return true
  if (value === 'false') return false
  const num = Number(value)
  if (!isNaN(num) && value.trim() !== '') return num
  return value
}

/**
 * Sets a deeply nested key (dot-notation) on an object.
 * e.g. setNested(obj, "address.city", "SP") => obj.address.city = "SP"
 */
function setNested(obj: Record<string, unknown>, key: string, value: unknown): void {
  const parts = key.split('.')
  let current = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (current[parts[i]] === undefined || typeof current[parts[i]] !== 'object') {
      current[parts[i]] = {}
    }
    current = current[parts[i]] as Record<string, unknown>
  }
  current[parts[parts.length - 1]] = value
}

export interface CsvToJsonOptions {
  delimiter?: string
  /** If true, dot-notation headers are expanded into nested objects */
  expandNested?: boolean
  /** If true, cell values are cast to native types (number, boolean, null) */
  castTypes?: boolean
  /** Output format: 'array' (default) or 'object' keyed by first column */
  outputFormat?: 'array' | 'object'
}

export interface CsvConversionResult {
  json: string
  rowCount: number
  columnCount: number
  headers: string[]
}

/**
 * Converts a CSV string to a JSON string.
 */
export function csvToJson(csvInput: string, options: CsvToJsonOptions = {}): CsvConversionResult {
  const {
    delimiter = ',',
    expandNested = true,
    castTypes = true,
    outputFormat = 'array',
  } = options

  const rawRows = splitCsvRows(csvInput.trim())
  if (rawRows.length === 0) throw new Error('The CSV appears to be empty.')
  if (rawRows.length === 1) throw new Error('The CSV has a header row but no data rows.')

  const headers = parseCsvLine(rawRows[0], delimiter)

  const dataRows = rawRows.slice(1).map((row) => {
    const cells = parseCsvLine(row, delimiter)
    const obj: Record<string, unknown> = {}

    headers.forEach((header, idx) => {
      const rawValue = cells[idx] ?? ''
      const value = castTypes ? castValue(rawValue) : rawValue

      if (expandNested && header.includes('.')) {
        setNested(obj, header, value)
      } else {
        obj[header] = value
      }
    })

    return obj
  })

  let output: unknown
  if (outputFormat === 'object' && headers.length > 0) {
    const keyCol = headers[0]
    output = Object.fromEntries(
      dataRows.map((row) => [String(row[keyCol] ?? ''), row])
    )
  } else {
    output = dataRows
  }

  return {
    json: JSON.stringify(output, null, 2),
    rowCount: dataRows.length,
    columnCount: headers.length,
    headers,
  }
}
