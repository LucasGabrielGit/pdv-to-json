/**
 * .env Formatter, Linter & .env.example Generator
 * 100% Client-side utility for parsing, formatting, linting, and sanitizing environment variable files.
 */

export interface EnvIssue {
  line: number
  type: 'error' | 'warning' | 'info'
  message: string
  key?: string
}

export interface EnvEntry {
  raw: string
  lineNumber: number
  type: 'comment' | 'empty' | 'variable'
  key?: string
  value?: string
  quote?: '"' | "'" | null
  comment?: string
}

export interface EnvParseResult {
  entries: EnvEntry[]
  variables: Record<string, string>
  issues: EnvIssue[]
  duplicateKeys: string[]
  totalVariables: number
  secretsDetected: { key: string; type: string }[]
}

export interface EnvFormatOptions {
  sortKeys?: boolean
  alignEquals?: boolean
  trimValues?: boolean
  removeEmptyLines?: boolean
}

export interface EnvExampleOptions {
  placeholderStyle?: 'empty' | 'placeholder' | 'prefix'
  keepComments?: boolean
}

const COMMON_SECRET_PATTERNS = [
  { name: 'Stripe Secret Key', regex: /sk_live_[0-9a-zA-Z]{24,}/ },
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'GitHub Personal Token', regex: /gh[pousr]_[0-9a-zA-Z]{36}/ },
  { name: 'OpenAI Secret Key', regex: /sk-[a-zA-Z0-9]{32,}/ },
  { name: 'JWT Token', regex: /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/ },
  { name: 'Private Key Block', regex: /-----BEGIN (RSA|EC|DSA|OPENSSH|PRIVATE) KEY-----/ },
]

/**
 * Parses a raw .env string into structured entries, linting for syntax issues and duplicates.
 */
export function parseEnv(content: string): EnvParseResult {
  const lines = content.split(/\r?\n/)
  const entries: EnvEntry[] = []
  const variables: Record<string, string> = {}
  const issues: EnvIssue[] = []
  const keyCount: Record<string, number> = {}
  const secretsDetected: { key: string; type: string }[] = []

  lines.forEach((line, index) => {
    const lineNumber = index + 1
    const trimmed = line.trim()

    // 1. Empty lines
    if (!trimmed) {
      entries.push({ raw: line, lineNumber, type: 'empty' })
      return
    }

    // 2. Full line comments
    if (trimmed.startsWith('#')) {
      entries.push({ raw: line, lineNumber, type: 'comment', comment: trimmed })
      return
    }

    // 3. Variable detection
    const equalIndex = line.indexOf('=')
    if (equalIndex === -1) {
      issues.push({
        line: lineNumber,
        type: 'error',
        message: 'Missing "=" assignment operator.',
      })
      entries.push({ raw: line, lineNumber, type: 'variable' })
      return
    }

    let rawKey = line.slice(0, equalIndex).trim()
    let rawValue = line.slice(equalIndex + 1)

    // Check if key is preceded by export
    if (rawKey.startsWith('export ')) {
      rawKey = rawKey.replace(/^export\s+/, '').trim()
    }

    // Validate key naming
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(rawKey)) {
      issues.push({
        line: lineNumber,
        type: 'warning',
        message: `Key "${rawKey}" contains non-standard characters. Recommended: UPPERCASE_WITH_UNDERSCORES.`,
        key: rawKey,
      })
    }

    // Duplicate key check
    keyCount[rawKey] = (keyCount[rawKey] || 0) + 1
    if (keyCount[rawKey] === 2) {
      issues.push({
        line: lineNumber,
        type: 'warning',
        message: `Duplicate key "${rawKey}" detected. Later values overwrite earlier ones.`,
        key: rawKey,
      })
    }

    // Inline comments handling
    let inlineComment = ''
    let cleanedValue = rawValue.trim()
    let quoteChar: '"' | "'" | null = null

    // Check quotes
    if (
      (cleanedValue.startsWith('"') && cleanedValue.endsWith('"') && cleanedValue.length >= 2) ||
      (cleanedValue.startsWith("'") && cleanedValue.endsWith("'") && cleanedValue.length >= 2)
    ) {
      quoteChar = cleanedValue[0] as '"' | "'"
      cleanedValue = cleanedValue.slice(1, -1)
    } else if (cleanedValue.startsWith('"') || cleanedValue.startsWith("'")) {
      // Unclosed quote check
      const firstChar = cleanedValue[0]
      if (!cleanedValue.endsWith(firstChar) || cleanedValue.length === 1) {
        issues.push({
          line: lineNumber,
          type: 'error',
          message: `Unclosed quote (${firstChar}) in value for "${rawKey}".`,
          key: rawKey,
        })
      }
    } else {
      // Check for unquoted inline comment e.g. FOO=bar # comment
      const commentIndex = cleanedValue.indexOf(' #')
      if (commentIndex !== -1) {
        inlineComment = cleanedValue.slice(commentIndex + 1).trim()
        cleanedValue = cleanedValue.slice(0, commentIndex).trim()
      }
    }

    // Check for exposed live secrets
    COMMON_SECRET_PATTERNS.forEach((secret) => {
      if (secret.regex.test(rawValue)) {
        secretsDetected.push({ key: rawKey, type: secret.name })
        issues.push({
          line: lineNumber,
          type: 'warning',
          message: `Potential live ${secret.name} detected in "${rawKey}". Never commit real secrets to Git!`,
          key: rawKey,
        })
      }
    })

    variables[rawKey] = cleanedValue

    entries.push({
      raw: line,
      lineNumber,
      type: 'variable',
      key: rawKey,
      value: cleanedValue,
      quote: quoteChar,
      comment: inlineComment,
    })
  })

  const duplicateKeys = Object.keys(keyCount).filter((k) => keyCount[k] > 1)

  return {
    entries,
    variables,
    issues,
    duplicateKeys,
    totalVariables: Object.keys(variables).length,
    secretsDetected,
  }
}

/**
 * Formats .env content with options for alphabetical sorting, `=` alignment, and whitespace normalization.
 */
export function formatEnv(content: string, options: EnvFormatOptions = {}): string {
  const { sortKeys = false, alignEquals = false, removeEmptyLines = false } = options
  const parsed = parseEnv(content)

  let variableEntries = parsed.entries.filter((e) => e.type === 'variable' && e.key)

  if (sortKeys) {
    // Sort variables alphabetically by key name A-Z
    variableEntries = [...variableEntries].sort((a, b) => (a.key || '').localeCompare(b.key || ''))

    // When sorted, calculate max key length for alignment
    const maxKeyLength = alignEquals
      ? Math.max(...variableEntries.map((e) => (e.key || '').length), 0)
      : 0

    const formattedLines: string[] = []
    variableEntries.forEach((entry) => {
      if (!entry.key) return
      const padKey = alignEquals ? entry.key.padEnd(maxKeyLength, ' ') : entry.key
      let val = entry.value || ''
      if (val.includes(' ') || val.includes('#') || val.includes('\n') || entry.quote) {
        val = `"${val}"`
      }
      const commentPart = entry.comment ? ` ${entry.comment}` : ''
      formattedLines.push(`${padKey}=${val}${commentPart}`)
    })

    return formattedLines.join('\n')
  }

  // Preserve original ordering and structure (including comments and spacing)
  let maxKeyLength = 0
  if (alignEquals) {
    maxKeyLength = Math.max(...variableEntries.map((e) => (e.key || '').length), 0)
  }

  const resultLines: string[] = []

  parsed.entries.forEach((entry) => {
    if (entry.type === 'empty') {
      if (!removeEmptyLines) {
        resultLines.push('')
      }
      return
    }

    if (entry.type === 'comment') {
      resultLines.push(entry.raw)
      return
    }

    if (entry.type === 'variable' && entry.key) {
      const padKey = alignEquals ? entry.key.padEnd(maxKeyLength, ' ') : entry.key
      let val = entry.value || ''
      if (val.includes(' ') || val.includes('#') || val.includes('\n') || entry.quote) {
        val = `"${val}"`
      }
      const commentPart = entry.comment ? ` ${entry.comment}` : ''
      resultLines.push(`${padKey}=${val}${commentPart}`)
    }
  })

  return resultLines.join('\n')
}

/**
 * Generates a clean, safe .env.example file by stripping all sensitive values.
 */
export function generateEnvExample(content: string, options: EnvExampleOptions = {}): string {
  const { placeholderStyle = 'empty', keepComments = true } = options
  const parsed = parseEnv(content)

  const resultLines: string[] = []

  parsed.entries.forEach((entry) => {
    if (entry.type === 'empty') {
      resultLines.push('')
      return
    }

    if (entry.type === 'comment') {
      if (keepComments) {
        resultLines.push(entry.raw)
      }
      return
    }

    if (entry.type === 'variable' && entry.key) {
      let placeholder = ''
      if (placeholderStyle === 'placeholder') {
        placeholder = `<your_${entry.key.toLowerCase()}>`
      } else if (placeholderStyle === 'prefix') {
        placeholder = `your_${entry.key.toLowerCase()}`
      }

      const commentPart = keepComments && entry.comment ? ` ${entry.comment}` : ''
      resultLines.push(`${entry.key}=${placeholder}${commentPart}`)
    }
  })

  return resultLines.join('\n')
}
