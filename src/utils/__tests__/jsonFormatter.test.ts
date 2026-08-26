import { describe, it, expect } from 'vitest'
import { formatJson, repairJsonSyntax, formatBytes } from '../jsonFormatter'

describe('jsonFormatter', () => {
  it('should format valid json with 2 spaces indent', () => {
    const input = '{"name":"devkit","version":1}'
    const result = formatJson(input, { indent: 2 })

    expect(result.isValid).toBe(true)
    expect(result.output).toBe(`{\n  "name": "devkit",\n  "version": 1\n}`)
    expect(result.keyCount).toBe(2)
    expect(result.maxDepth).toBe(1)
  })

  it('should minify valid json', () => {
    const input = `{\n  "name": "devkit",\n  "version": 1\n}`
    const result = formatJson(input, { minify: true })

    expect(result.isValid).toBe(true)
    expect(result.output).toBe('{"name":"devkit","version":1}')
  })

  it('should detect syntax errors in invalid json', () => {
    const input = '{"name": "devkit", invalid}'
    const result = formatJson(input)

    expect(result.isValid).toBe(false)
    expect(result.error).toBeDefined()
    expect(result.error?.message).toBeTruthy()
  })

  it('should repair trailing commas and single quotes with repairJsonSyntax', () => {
    const input = "{'name': 'devkit', 'items': [1, 2, 3,],}"
    const repaired = repairJsonSyntax(input)
    const result = formatJson(repaired)

    expect(result.isValid).toBe(true)
    expect(result.output).toContain('"name": "devkit"')
  })

  it('should format byte sizes accurately', () => {
    expect(formatBytes(0)).toBe('0 Bytes')
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1048576)).toBe('1 MB')
  })
})
