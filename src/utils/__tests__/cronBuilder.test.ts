import { describe, it, expect } from 'vitest'
import { explainCronExpression, CRON_PRESETS } from '../cronBuilder'

describe('cronBuilder', () => {
  it('should generate human readable description for every 5 minutes', () => {
    const desc = explainCronExpression('*/5 * * * *')
    expect(desc).toContain('every 5 minutes')
  })

  it('should generate human readable description for daily at 8:00 AM', () => {
    const desc = explainCronExpression('0 8 * * *')
    expect(desc).toContain('8:00 AM')
  })

  it('should generate human readable description for weekdays', () => {
    const desc = explainCronExpression('0 12 * * 1-5')
    expect(desc).toContain('Monday through Friday')
  })

  it('should return error description for invalid field counts', () => {
    expect(explainCronExpression('* * *')).toContain('Invalid')
    expect(explainCronExpression('')).toContain('Invalid')
  })

  it('should have standard presets available', () => {
    expect(CRON_PRESETS.length).toBeGreaterThanOrEqual(5)
    expect(CRON_PRESETS[0].expression).toBe('* * * * *')
  })
})
