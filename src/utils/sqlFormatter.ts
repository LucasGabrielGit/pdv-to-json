/**
 * SQL Formatter options
 */
export interface SqlFormatterOptions {
  dialect?: 'postgresql' | 'mysql' | 'sqlite' | 'tsql' | 'bigquery'
  uppercaseKeywords?: boolean
  indentSpaces?: number
}

const SQL_KEYWORDS = [
  'SELECT', 'DISTINCT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'EXISTS',
  'BETWEEN', 'LIKE', 'ILIKE', 'IS NULL', 'IS NOT NULL', 'AS', 'ON',
  'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN',
  'GROUP BY', 'HAVING', 'ORDER BY', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
  'UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT',
  'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'TRUNCATE TABLE',
  'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'CREATE INDEX', 'DROP INDEX',
  'WITH', 'RECURSIVE', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
  'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES', 'CHECK', 'DEFAULT', 'UNIQUE', 'NOT NULL',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'NOW', 'INTERVAL'
]

const MAJOR_BREAK_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN', 'CROSS JOIN', 'JOIN',
  'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'UNION ALL', 'UNION',
  'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'WITH'
]

/**
 * Formats a raw SQL query with indentation and keyword styling
 */
export function formatSql(sql: string, options: SqlFormatterOptions = {}): string {
  if (!sql || !sql.trim()) return ''

  const { uppercaseKeywords = true, indentSpaces = 2 } = options
  const indent = ' '.repeat(indentSpaces)

  let formatted = sql.trim()

  // 1. Normalize line endings and multiple spaces
  formatted = formatted.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ')

  // 2. Format Keywords casing
  SQL_KEYWORDS.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
    formatted = formatted.replace(regex, uppercaseKeywords ? keyword.toUpperCase() : keyword.toLowerCase())
  })

  // 3. Break lines before major keywords
  MAJOR_BREAK_KEYWORDS.forEach((keyword) => {
    const regex = new RegExp(`\\s+(${keyword})\\b`, 'gi')
    formatted = formatted.replace(regex, `\n$1`)
  })

  // 4. Split and indent lines
  const lines = formatted.split('\n')
  const resultLines: string[] = []

  let currentIndent = 0

  lines.forEach((rawLine) => {
    const line = rawLine.trim()
    if (!line) return

    // Subquery parenthesis handling
    if (line.startsWith(')')) {
      currentIndent = Math.max(0, currentIndent - 1)
    }

    const pad = indent.repeat(currentIndent)
    resultLines.push(pad + line)

    if (line.endsWith('(')) {
      currentIndent += 1
    }
  })

  return resultLines.join('\n')
}

/**
 * Minifies SQL query into a single compact line
 */
export function minifySql(sql: string): string {
  if (!sql) return ''
  return sql
    .replace(/--.*$/gm, '') // Remove single line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim()
}
