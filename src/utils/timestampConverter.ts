export interface TimestampConversionResult {
  isValid: boolean
  timestampSeconds: number
  timestampMs: number
  isoUtc: string
  localDateTime: string
  utcString: string
  relativeTime: string
  timezoneName: string
  timezoneOffset: string
  error?: string
}

/**
 * Calculates human readable relative time (e.g. "in 3 hours", "2 days ago")
 */
function getRelativeTime(targetDate: Date): string {
  const now = Date.now()
  const target = targetDate.getTime()
  const diffMs = Math.abs(target - now)
  const isPast = now > target

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  let text = ''
  if (years > 0) {
    text = `${years} ${years === 1 ? 'year' : 'years'}`
  } else if (months > 0) {
    text = `${months} ${months === 1 ? 'month' : 'months'}`
  } else if (days > 0) {
    text = `${days} ${days === 1 ? 'day' : 'days'}`
  } else if (hours > 0) {
    text = `${hours} ${hours === 1 ? 'hour' : 'hours'}`
  } else if (minutes > 0) {
    text = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
  } else {
    text = `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`
  }

  return isPast ? `${text} ago` : `in ${text}`
}

/**
 * Gets user's local timezone name and offset (e.g. "America/Sao_Paulo (UTC-3)")
 */
function getTimezoneInfo(): { name: string; offset: string } {
  try {
    const name = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local'
    const offsetMin = new Date().getTimezoneOffset()
    const offsetHours = Math.abs(Math.floor(offsetMin / 60))
    const offsetSign = offsetMin <= 0 ? '+' : '-'
    return {
      name,
      offset: `UTC${offsetSign}${offsetHours}`,
    }
  } catch {
    return { name: 'Local Timezone', offset: 'UTC' }
  }
}

/**
 * Converts any timestamp (seconds or ms) or date string into formatted date representations
 */
export function convertTimestamp(input: string | number): TimestampConversionResult {
  const cleanStr = String(input).trim()

  if (!cleanStr) {
    const now = new Date()
    return convertDateObj(now)
  }

  let date: Date | null = null

  // Check if input is pure numbers (Unix timestamp)
  if (/^-?\d+$/.test(cleanStr)) {
    const num = parseInt(cleanStr, 10)
    // If length <= 11 digits, assume seconds; if > 11, assume milliseconds
    if (Math.abs(num) <= 99999999999) {
      date = new Date(num * 1000)
    } else {
      date = new Date(num)
    }
  } else {
    // Parse ISO or Date string
    const parsed = Date.parse(cleanStr)
    if (!isNaN(parsed)) {
      date = new Date(parsed)
    }
  }

  if (!date || isNaN(date.getTime())) {
    return {
      isValid: false,
      timestampSeconds: 0,
      timestampMs: 0,
      isoUtc: '',
      localDateTime: '',
      utcString: '',
      relativeTime: '',
      timezoneName: '',
      timezoneOffset: '',
      error: 'Invalid timestamp or date format. Enter a valid Unix timestamp (seconds/ms) or date string.',
    }
  }

  return convertDateObj(date)
}

function convertDateObj(date: Date): TimestampConversionResult {
  const tz = getTimezoneInfo()
  const ms = date.getTime()
  const sec = Math.floor(ms / 1000)

  return {
    isValid: true,
    timestampSeconds: sec,
    timestampMs: ms,
    isoUtc: date.toISOString(),
    localDateTime: date.toLocaleString(),
    utcString: date.toUTCString(),
    relativeTime: getRelativeTime(date),
    timezoneName: tz.name,
    timezoneOffset: tz.offset,
  }
}
