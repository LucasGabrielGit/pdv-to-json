export interface RegexMatchGroup {
  name: string | number
  value: string
  start: number
  end: number
}

export interface RegexMatchResult {
  index: number
  match: string
  start: number
  end: number
  groups: RegexMatchGroup[]
}

export interface RegexTestResult {
  isValid: boolean
  pattern: string
  flags: string
  matches: RegexMatchResult[]
  totalMatches: number
  executionTimeMs: number
  replacedOutput?: string
  error?: string
}

export interface RegexPreset {
  name: string
  pattern: string
  flags: string
  description: string
  sampleText: string
}

export const REGEX_PRESETS: RegexPreset[] = [
  {
    name: 'Email Address',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: 'g',
    description: 'Matches standard email addresses',
    sampleText: 'Contact us at support@dev-kit.tech or sales@example.com for help.',
  },
  {
    name: 'URL / Link',
    pattern: 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)',
    flags: 'gi',
    description: 'Matches HTTP and HTTPS website URLs',
    sampleText: 'Visit https://dev-kit.tech or http://google.com for more info.',
  },
  {
    name: 'IPv4 Address',
    pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: 'g',
    description: 'Matches IPv4 addresses',
    sampleText: 'Server IP is 192.168.1.1 and gateway is 10.0.0.254.',
  },
  {
    name: 'Hex Color Code',
    pattern: '#(?:[a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\b',
    flags: 'gi',
    description: 'Matches #FFF or #7C3AED hex color codes',
    sampleText: 'Colors used: #7c3aed, #06b6d4, and #fff.',
  },
  {
    name: 'UUID v4',
    pattern: '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}',
    flags: 'gi',
    description: 'Matches UUID version 4 strings',
    sampleText: 'ID: 5eee8963-e3a7-4895-ab30-c91031c2ea83 generated.',
  },
  {
    name: 'Phone Number (BR)',
    pattern: '(?:\\+?55\\s?)?(?:\\(?\\d{2}\\)?\\s?)?\\d{4,5}[-\\s]?\\d{4}',
    flags: 'g',
    description: 'Matches Brazilian phone numbers',
    sampleText: 'Ligue para (11) 99999-8888 ou 11 98888-7777.',
  },
]

/**
 * Executes a Regex pattern test on input string with timing & group extraction
 */
export function testRegex(
  patternText: string,
  flagsText: string,
  testText: string,
  replacementText?: string
): RegexTestResult {
  if (!patternText) {
    return {
      isValid: true,
      pattern: '',
      flags: flagsText,
      matches: [],
      totalMatches: 0,
      executionTimeMs: 0,
    }
  }

  const startTime = performance.now()

  let regex: RegExp
  try {
    regex = new RegExp(patternText, flagsText)
  } catch (err) {
    return {
      isValid: false,
      pattern: patternText,
      flags: flagsText,
      matches: [],
      totalMatches: 0,
      executionTimeMs: 0,
      error: (err as Error).message,
    }
  }

  const matches: RegexMatchResult[] = []
  const isGlobal = flagsText.includes('g')

  if (testText) {
    if (isGlobal) {
      let match: RegExpExecArray | null
      let matchIndex = 0
      const maxMatches = 1000 // Prevent browser freezing on catastrophic backtracking

      while ((match = regex.exec(testText)) !== null) {
        if (matchIndex >= maxMatches) break

        const groups: RegexMatchGroup[] = []
        
        // Numbered groups
        for (let i = 1; i < match.length; i++) {
          if (match[i] !== undefined) {
            groups.push({
              name: i,
              value: match[i],
              start: match.index, // Approximate
              end: match.index + match[i].length,
            })
          }
        }

        // Named groups
        if (match.groups) {
          for (const [key, val] of Object.entries(match.groups)) {
            if (val !== undefined) {
              groups.push({
                name: key,
                value: val,
                start: match.index,
                end: match.index + val.length,
              })
            }
          }
        }

        matches.push({
          index: matchIndex++,
          match: match[0],
          start: match.index,
          end: match.index + match[0].length,
          groups,
        })

        // Avoid infinite loop on zero-length matches (e.g. /^/)
        if (match[0].length === 0) {
          regex.lastIndex++
        }
      }
    } else {
      const match = regex.exec(testText)
      if (match) {
        const groups: RegexMatchGroup[] = []
        for (let i = 1; i < match.length; i++) {
          if (match[i] !== undefined) {
            groups.push({
              name: i,
              value: match[i],
              start: match.index,
              end: match.index + match[i].length,
            })
          }
        }

        matches.push({
          index: 0,
          match: match[0],
          start: match.index,
          end: match.index + match[0].length,
          groups,
        })
      }
    }
  }

  const endTime = performance.now()
  const executionTimeMs = parseFloat((endTime - startTime).toFixed(3))

  let replacedOutput: string | undefined
  if (replacementText !== undefined && testText) {
    try {
      replacedOutput = testText.replace(regex, replacementText)
    } catch {
      replacedOutput = undefined
    }
  }

  return {
    isValid: true,
    pattern: patternText,
    flags: flagsText,
    matches,
    totalMatches: matches.length,
    executionTimeMs,
    replacedOutput,
  }
}
