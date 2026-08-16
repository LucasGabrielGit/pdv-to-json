/**
 * Safely cleans and parses JSON output returned by LLMs (Gemini / OpenAI),
 * handling markdown code fences, unescaped backslashes (\d, \w, \n), and bad control chars.
 */
export function safeParseLlmJson<T = any>(rawText: string, fallback: Partial<T> = {}): T {
  if (!rawText || typeof rawText !== 'string') return fallback as T

  let clean = rawText.trim()

  // 1. Remove markdown codeblocks ```json ... ``` or ``` ... ```
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  }

  // 2. First attempt: Standard JSON.parse
  try {
    return JSON.parse(clean) as T
  } catch {
    // Continue to repair strategies
  }

  // 3. Second attempt: Fix invalid unescaped backslashes (e.g. \d, \w, \s, \b in regex or code strings)
  try {
    const repaired = clean
      // Replace single backslashes that are not valid JSON escape sequences with double backslashes
      .replace(/\\(?!["\\/bfnrtu|u[0-9a-fA-F]{4}])/g, '\\\\')
      // Fix unescaped control characters
      .replace(/[\u0000-\u001F]+/g, (match) => {
        if (match === '\n') return '\\n'
        if (match === '\r') return '\\r'
        if (match === '\t') return '\\t'
        return ''
      })

    return JSON.parse(repaired) as T
  } catch {
    // Continue to partial extraction
  }

  // 4. Third attempt: Loose regex extraction of main JSON object
  try {
    const match = clean.match(/\{[\s\S]*\}/)
    if (match) {
      const extracted = match[0].replace(/\\(?!["\\/bfnrtu])/g, '\\\\')
      return JSON.parse(extracted) as T
    }
  } catch {
    // Fallback below
  }

  return fallback as T
}
