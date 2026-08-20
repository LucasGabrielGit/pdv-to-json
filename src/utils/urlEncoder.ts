export interface QueryParam {
  key: string
  value: string
  enabled: boolean
}

export interface ParsedUrlDetails {
  protocol: string
  host: string
  pathname: string
  hash: string
  params: QueryParam[]
  error?: string
}

/**
 * Parses full URL or query string into structured parts and parameter list
 */
export function parseUrlDetails(rawUrl: string): ParsedUrlDetails {
  const result: ParsedUrlDetails = {
    protocol: '',
    host: '',
    pathname: '',
    hash: '',
    params: [],
  }

  if (!rawUrl || !rawUrl.trim()) return result

  try {
    const isFullUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
    const urlObj = isFullUrl ? new URL(rawUrl) : new URL(`https://dummy.domain/${rawUrl.replace(/^\?/, '')}`)

    if (isFullUrl) {
      result.protocol = urlObj.protocol
      result.host = urlObj.host
      result.pathname = urlObj.pathname
      result.hash = urlObj.hash
    }

    urlObj.searchParams.forEach((value, key) => {
      result.params.push({ key, value, enabled: true })
    })

    return result
  } catch (err) {
    // If URL parsing fails, extract manual query string
    const searchPart = rawUrl.includes('?') ? rawUrl.split('?')[1] : rawUrl
    const pairs = searchPart.split('&').filter(Boolean)

    pairs.forEach((pair) => {
      const [k, v] = pair.split('=')
      if (k) {
        try {
          result.params.push({
            key: decodeURIComponent(k),
            value: v ? decodeURIComponent(v) : '',
            enabled: true,
          })
        } catch {
          result.params.push({ key: k, value: v || '', enabled: true })
        }
      }
    })

    return result
  }
}

/**
 * Reconstructs the complete URL from parts and enabled query parameters
 */
export function buildUrlFromParams(
  baseUrl: string,
  params: QueryParam[]
): string {
  if (!baseUrl) return ''

  try {
    const isFull = baseUrl.startsWith('http://') || baseUrl.startsWith('https://')
    const baseWithoutQuery = baseUrl.split('?')[0]
    
    const searchParams = new URLSearchParams()
    params.forEach((p) => {
      if (p.enabled && p.key.trim()) {
        searchParams.append(p.key.trim(), p.value)
      }
    })

    const queryString = searchParams.toString()
    return queryString ? `${baseWithoutQuery}?${queryString}` : baseWithoutQuery
  } catch {
    return baseUrl
  }
}

/**
 * Encodes text with component or full URI mode
 */
export function encodeUrlString(text: string, mode: 'component' | 'full' = 'component'): string {
  if (!text) return ''
  try {
    return mode === 'component' ? encodeURIComponent(text) : encodeURI(text)
  } catch {
    return text
  }
}

/**
 * Decodes URL encoded text
 */
export function decodeUrlString(text: string): string {
  if (!text) return ''
  try {
    return decodeURIComponent(text.replace(/\+/g, ' '))
  } catch {
    try {
      return decodeURI(text)
    } catch {
      return text
    }
  }
}
