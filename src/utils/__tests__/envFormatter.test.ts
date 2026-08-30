import { describe, it, expect } from 'vitest'
import { parseEnv, formatEnv, generateEnvExample } from '../envFormatter'

describe('envFormatter', () => {
  const sampleEnv = `# Server Configuration
PORT=3000
HOST="localhost"

# Database Connection
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
DATABASE_POOL_SIZE=10

# Auth
JWT_SECRET=super_secret_jwt_key
PORT=8080 # duplicate key
`

  it('should parse variables, detect comments and duplicates', () => {
    const result = parseEnv(sampleEnv)
    expect(result.totalVariables).toBe(5)
    expect(result.variables.PORT).toBe('8080')
    expect(result.variables.HOST).toBe('localhost')
    expect(result.duplicateKeys).toContain('PORT')
    expect(result.issues.some((i) => i.message.includes('Duplicate key'))).toBe(true)
  })

  it('should detect unclosed quotes and missing equals operator', () => {
    const invalidEnv = `INVALID_LINE_WITHOUT_EQUALS\nUNCLOSED_KEY="unclosed_val`
    const result = parseEnv(invalidEnv)
    expect(result.issues.some((i) => i.message.includes('Missing "="'))).toBe(true)
    expect(result.issues.some((i) => i.message.includes('Unclosed quote'))).toBe(true)
  })

  it('should format and align equals signs', () => {
    const unalignedEnv = `A=1\nVERY_LONG_NAME=2\nC=3`
    const formatted = formatEnv(unalignedEnv, { alignEquals: true })
    const lines = formatted.split('\n')
    expect(lines[0]).toBe('A             =1')
    expect(lines[1]).toBe('VERY_LONG_NAME=2')
    expect(lines[2]).toBe('C             =3')
  })

  it('should sort keys alphabetically when requested', () => {
    const unsortedEnv = `ZEBRA=1\nAPPLE=2\nBANANA=3`
    const sorted = formatEnv(unsortedEnv, { sortKeys: true })
    const lines = sorted.split('\n')
    expect(lines[0]).toBe('APPLE=2')
    expect(lines[1]).toBe('BANANA=3')
    expect(lines[2]).toBe('ZEBRA=1')
  })

  it('should generate safe .env.example preserving comments and stripping secrets', () => {
    const exampleEmpty = generateEnvExample(sampleEnv, { placeholderStyle: 'empty' })
    expect(exampleEmpty).toContain('# Server Configuration')
    expect(exampleEmpty).toContain('PORT=')
    expect(exampleEmpty).toContain('JWT_SECRET=')
    expect(exampleEmpty).not.toContain('super_secret_jwt_key')

    const examplePlaceholder = generateEnvExample(sampleEnv, { placeholderStyle: 'placeholder' })
    expect(examplePlaceholder).toContain('DATABASE_URL=<your_database_url>')
  })
})
