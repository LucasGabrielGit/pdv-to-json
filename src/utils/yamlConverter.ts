import { dump, load } from 'js-yaml'

export interface YamlConversionOptions {
  indent?: number
  sortKeys?: boolean
  skipInvalid?: boolean
}

export interface YamlConversionResult {
  output: string
  lineCount: number
  charCount: number
}

/**
 * Converts JSON string to YAML string
 */
export function jsonToYaml(
  jsonText: string,
  options: YamlConversionOptions = {}
): YamlConversionResult {
  const { indent = 2, sortKeys = false, skipInvalid = false } = options

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch (err) {
    throw new Error(`Invalid JSON: ${(err as Error).message}`)
  }

  const yamlOutput = dump(parsed, {
    indent,
    sortKeys,
    skipInvalid,
    noRefs: true,
    lineWidth: -1, // Don't wrap long lines automatically
  })

  return {
    output: yamlOutput,
    lineCount: yamlOutput.trim().split('\n').length,
    charCount: yamlOutput.length,
  }
}

/**
 * Converts YAML string to formatted JSON string
 */
export function yamlToJson(
  yamlText: string,
  options: { indent?: number } = {}
): YamlConversionResult {
  const { indent = 2 } = options

  let parsed: unknown
  try {
    parsed = load(yamlText)
  } catch (err) {
    throw new Error(`Invalid YAML: ${(err as Error).message}`)
  }

  if (parsed === undefined) {
    throw new Error('YAML input is empty or contains no valid documents.')
  }

  const jsonOutput = JSON.stringify(parsed, null, indent)

  return {
    output: jsonOutput,
    lineCount: jsonOutput.trim().split('\n').length,
    charCount: jsonOutput.length,
  }
}
