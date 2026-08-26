/**
 * jsonToTypes.ts
 * Generates TypeScript Interfaces, Zod Validation Schemas, Python Pydantic Models,
 * and Go Structs from arbitrary JSON objects.
 */

export type TargetTypeLanguage = 'typescript' | 'zod' | 'pydantic' | 'go'

export interface TypeGeneratorOptions {
  rootName?: string
  readOnly?: boolean
  optionalNullable?: boolean
  exportTypes?: boolean
}

export interface TypeConversionResult {
  code: string
  language: string
  typeCount: number
  error?: string
}

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('') || 'Type'
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase()
    .replace(/_+/g, '_')
}

// ── TypeScript Interface Generator ──
export function generateTypeScript(obj: unknown, rootName = 'RootObject', readOnly = false): string {
  const interfaces: Record<string, string> = {}

  function parseObject(val: unknown, name: string): string {
    if (val === null) return 'null | undefined'
    if (typeof val === 'string') return 'string'
    if (typeof val === 'number') return Number.isInteger(val) ? 'number' : 'number'
    if (typeof val === 'boolean') return 'boolean'

    if (Array.isArray(val)) {
      if (val.length === 0) return 'unknown[]'
      const itemTypes = Array.from(new Set(val.map((item) => parseObject(item, `${name}Item`))))
      return itemTypes.length === 1 ? `${itemTypes[0]}[]` : `(${itemTypes.join(' | ')})[]`
    }


    if (typeof val === 'object') {
      const typeName = toPascalCase(name)
      const props = Object.entries(val as Record<string, unknown>)
        .map(([k, v]) => {
          const isOptional = v === null || v === undefined
          const propType = parseObject(v, `${typeName}_${k}`)
          const optMark = isOptional ? '?' : ''
          const roMark = readOnly ? 'readonly ' : ''
          const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k)
          return `  ${roMark}${safeKey}${optMark}: ${propType};`
        })
        .join('\n')

      interfaces[typeName] = `export interface ${typeName} {\n${props}\n}`
      return typeName
    }

    return 'unknown'
  }

  parseObject(obj, rootName)

  return Object.values(interfaces).join('\n\n')
}

// ── Zod Schema Generator ──
export function generateZodSchema(obj: unknown, rootName = 'RootSchema'): string {
  const schemas: Record<string, string> = {}

  function parseObject(val: unknown, name: string): string {
    if (val === null) return 'z.any().nullable()'
    if (typeof val === 'string') return 'z.string()'
    if (typeof val === 'number') return 'z.number()'
    if (typeof val === 'boolean') return 'z.boolean()'

    if (Array.isArray(val)) {
      if (val.length === 0) return 'z.array(z.unknown())'
      const itemSchema = parseObject(val[0], `${name}Item`)
      return `z.array(${itemSchema})`
    }

    if (typeof val === 'object') {
      const schemaName = toPascalCase(name) + 'Schema'
      const typeName = toPascalCase(name)
      const props = Object.entries(val as Record<string, unknown>)
        .map(([k, v]) => {
          const isOptional = v === null || v === undefined
          const fieldSchema = parseObject(v, `${name}_${k}`)
          const opt = isOptional ? '.optional().nullable()' : ''
          const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k)
          return `  ${safeKey}: ${fieldSchema}${opt},`
        })
        .join('\n')

      schemas[schemaName] = `export const ${schemaName} = z.object({\n${props}\n});\n\n export type ${typeName} = z.infer<typeof ${schemaName}>;`
      return schemaName
    }

    return 'z.unknown()'
  }

  parseObject(obj, rootName)

  const header = `import { z } from "zod";\n\n`
  return header + Object.values(schemas).join('\n\n')
}

// ── Python Pydantic Models Generator ──
export function generatePydantic(obj: unknown, rootName = 'RootModel'): string {
  const models: Record<string, string> = {}

  function parseObject(val: unknown, name: string): string {
    if (val === null) return 'Optional[Any]'
    if (typeof val === 'string') return 'str'
    if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'float'
    if (typeof val === 'boolean') return 'bool'

    if (Array.isArray(val)) {
      if (val.length === 0) return 'List[Any]'
      const itemType = parseObject(val[0], `${name}Item`)
      return `List[${itemType}]`
    }

    if (typeof val === 'object') {
      const modelName = toPascalCase(name)
      const props = Object.entries(val as Record<string, unknown>)
        .map(([k, v]) => {
          const isOptional = v === null || v === undefined
          const fieldType = parseObject(v, `${modelName}_${k}`)
          const safeField = toSnakeCase(k)
          const typeStr = isOptional ? `Optional[${fieldType}] = None` : fieldType
          return `    ${safeField}: ${typeStr}`
        })
        .join('\n')

      models[modelName] = `class ${modelName}(BaseModel):\n${props || '    pass'}`
      return modelName
    }

    return 'Any'
  }

  parseObject(obj, rootName)

  const header = `from typing import List, Optional, Any, Dict\nfrom pydantic import BaseModel\n\n`
  return header + Object.values(models).join('\n\n')
}

// ── Go Structs Generator ──
export function generateGoStructs(obj: unknown, rootName = 'Root'): string {
  const structs: Record<string, string> = {}

  function parseObject(val: unknown, name: string): string {
    if (val === null) return '*string'
    if (typeof val === 'string') return 'string'
    if (typeof val === 'number') return Number.isInteger(val) ? 'int64' : 'float64'
    if (typeof val === 'boolean') return 'bool'

    if (Array.isArray(val)) {
      if (val.length === 0) return '[]any'
      const itemType = parseObject(val[0], `${name}Item`)
      return `[]${itemType}`
    }

    if (typeof val === 'object') {
      const structName = toPascalCase(name)
      const props = Object.entries(val as Record<string, unknown>)
        .map(([k, v]) => {
          const fieldType = parseObject(v, `${structName}_${k}`)
          const goFieldName = toPascalCase(k)
          return `\t${goFieldName} ${fieldType} \`json:"${k}"\``
        })
        .join('\n')

      structs[structName] = `type ${structName} struct {\n${props}\n}`
      return structName
    }

    return 'any'
  }

  parseObject(obj, rootName)

  return Object.values(structs).join('\n\n')
}

// ── Universal Unified Conversion Runner ──
export function convertJsonToTypes(
  jsonText: string,
  targetLang: TargetTypeLanguage = 'typescript',
  options: TypeGeneratorOptions = {}
): TypeConversionResult {
  if (!jsonText.trim()) {
    return { code: '', language: targetLang, typeCount: 0 }
  }

  try {
    const parsed = JSON.parse(jsonText)
    const rootName = options.rootName?.trim() || 'ResponseData'

    let code = ''
    if (targetLang === 'typescript') {
      code = generateTypeScript(parsed, rootName, options.readOnly)
    } else if (targetLang === 'zod') {
      code = generateZodSchema(parsed, rootName)
    } else if (targetLang === 'pydantic') {
      code = generatePydantic(parsed, rootName)
    } else if (targetLang === 'go') {
      code = generateGoStructs(parsed, rootName)
    }

    const typeCount = (code.match(/interface |class |type |const .* = z\.object/g) || []).length

    return {
      code,
      language: targetLang === 'pydantic' ? 'python' : targetLang === 'go' ? 'go' : 'typescript',
      typeCount: Math.max(1, typeCount),
    }
  } catch (err) {
    return {
      code: '',
      language: targetLang,
      typeCount: 0,
      error: `Invalid JSON Syntax: ${(err as Error).message}`,
    }
  }
}
