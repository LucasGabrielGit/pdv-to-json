export interface CronPreset {
  name: string
  expression: string
  description: string
}

export interface CronFieldDetail {
  name: string
  value: string
  description: string
}

export interface CronParseResult {
  isValid: boolean
  expression: string
  humanDescription: string
  fields: CronFieldDetail[]
  nextExecutions: Date[]
  error?: string
}

export const CRON_PRESETS: CronPreset[] = [
  {
    name: 'Every Minute',
    expression: '* * * * *',
    description: 'Runs every single minute (* * * * *)',
  },
  {
    name: 'Every 5 Minutes',
    expression: '*/5 * * * *',
    description: 'Runs at every 5th minute (0, 5, 10, 15...)',
  },
  {
    name: 'Every Hour',
    expression: '0 * * * *',
    description: 'Runs at minute 0 of every hour',
  },
  {
    name: 'Every Day at Midnight',
    expression: '0 0 * * *',
    description: 'Runs at 00:00 (12:00 AM) every day',
  },
  {
    name: 'Every Day at 8:00 AM',
    expression: '0 8 * * *',
    description: 'Runs at 08:00 AM every day',
  },
  {
    name: 'Every Monday at 9:00 AM',
    expression: '0 9 * * 1',
    description: 'Runs at 09:00 AM every Monday',
  },
  {
    name: 'Weekdays at 12:00 PM',
    expression: '0 12 * * 1-5',
    description: 'Runs at 12:00 PM, Monday through Friday',
  },
  {
    name: 'First Day of Every Month',
    expression: '0 0 1 * *',
    description: 'Runs at 00:00 on the 1st of every month',
  },
]

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

/**
 * Generates human readable description for 5-part cron expression
 */
export function explainCronExpression(cron: string): string {
  const parts = cron.trim().split(/\s+/)
  if (parts.length !== 5) {
    return 'Invalid cron expression. Exactly 5 fields are required (minute hour day month weekday).'
  }

  const [min, hr, day, month, wday] = parts

  let desc = 'Runs '

  // Minute explanation
  if (min === '*') {
    desc += 'every minute'
  } else if (min.startsWith('*/')) {
    const step = min.replace('*/', '')
    desc += `every ${step} minutes`
  } else {
    desc += `at minute ${min}`
  }

  // Hour explanation
  if (hr === '*') {
    desc += ' of every hour'
  } else if (hr.startsWith('*/')) {
    const step = hr.replace('*/', '')
    desc += ` every ${step} hours`
  } else {
    const hrNum = parseInt(hr, 10)
    if (!isNaN(hrNum)) {
      const ampm = hrNum >= 12 ? 'PM' : 'AM'
      const displayHr = hrNum % 12 === 0 ? 12 : hrNum % 12
      desc += ` past ${displayHr}:00 ${ampm}`
    } else {
      desc += ` past hour ${hr}`
    }
  }

  // Day of Month
  if (day !== '*') {
    desc += `, on day ${day} of the month`
  }

  // Month
  if (month !== '*') {
    const mNum = parseInt(month, 10)
    if (!isNaN(mNum) && mNum >= 1 && mNum <= 12) {
      desc += ` in ${MONTH_NAMES[mNum - 1]}`
    } else {
      desc += ` in month ${month}`
    }
  }

  // Day of Week
  if (wday !== '*') {
    if (wday === '1-5') {
      desc += ', Monday through Friday'
    } else if (wday === '0,6' || wday === '6,0') {
      desc += ', on weekends'
    } else {
      const wNum = parseInt(wday, 10)
      if (!isNaN(wNum) && wNum >= 0 && wNum <= 6) {
        desc += `, on ${DAY_NAMES[wNum]}`
      } else {
        desc += `, on day-of-week ${wday}`
      }
    }
  }

  return desc
}

/**
 * Calculates next 5 approximate execution dates for standard cron patterns
 */
export function getNextExecutions(cron: string, count = 5): Date[] {
  const parts = cron.trim().split(/\s+/)
  if (parts.length !== 5) return []

  const [min, hr] = parts
  const dates: Date[] = []

  let current = new Date()
  current.setSeconds(0, 0)

  let stepMinutes = 1
  if (min.startsWith('*/')) {
    stepMinutes = parseInt(min.replace('*/', ''), 10) || 1
  } else if (min === '*') {
    stepMinutes = 1
  } else if (!isNaN(parseInt(min, 10)) && hr === '*') {
    stepMinutes = 60
  } else if (!isNaN(parseInt(min, 10)) && !isNaN(parseInt(hr, 10))) {
    stepMinutes = 1440 // 24 hours
  }

  for (let i = 0; i < count; i++) {
    current = new Date(current.getTime() + stepMinutes * 60 * 1000)
    dates.push(new Date(current))
  }

  return dates
}

/**
 * Parses and validates a 5-part cron expression
 */
export function parseCronExpression(cron: string): CronParseResult {
  const trimmed = cron.trim()
  const parts = trimmed.split(/\s+/)

  if (parts.length !== 5) {
    return {
      isValid: false,
      expression: trimmed,
      humanDescription: '',
      fields: [],
      nextExecutions: [],
      error: 'Cron expression must contain exactly 5 fields separated by spaces: (minute hour day month weekday)',
    }
  }

  const [min, hr, day, month, wday] = parts

  const fields: CronFieldDetail[] = [
    { name: 'Minute', value: min, description: 'Values: 0-59, *, */N, 1-5' },
    { name: 'Hour', value: hr, description: 'Values: 0-23, *, */N, 8-18' },
    { name: 'Day of Month', value: day, description: 'Values: 1-31, *, 1,15' },
    { name: 'Month', value: month, description: 'Values: 1-12, *, JAN-DEC' },
    { name: 'Day of Week', value: wday, description: 'Values: 0-6 (Sun-Sat), *, 1-5' },
  ]

  const humanDescription = explainCronExpression(trimmed)
  const nextExecutions = getNextExecutions(trimmed)

  return {
    isValid: true,
    expression: trimmed,
    humanDescription,
    fields,
    nextExecutions,
  }
}
