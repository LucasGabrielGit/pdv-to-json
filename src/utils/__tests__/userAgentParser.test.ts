import { describe, it, expect } from 'vitest'
import { parseUserAgent } from '../userAgentParser'

describe('userAgentParser', () => {
  it('should parse modern Chrome on Windows 11', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    const parsed = parseUserAgent(ua)

    expect(parsed.browser.name).toBe('Google Chrome')
    expect(parsed.browser.major).toBe('125')
    expect(parsed.os.name).toBe('Windows')
    expect(parsed.device.type).toBe('Desktop')
    expect(parsed.isBot).toBe(false)
  })

  it('should parse Mobile Safari on iPhone', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
    const parsed = parseUserAgent(ua)

    expect(parsed.browser.name).toBe('Apple Safari')
    expect(parsed.os.name).toBe('iOS')
    expect(parsed.device.type).toBe('Mobile')
    expect(parsed.device.vendor).toBe('Apple')
    expect(parsed.device.model).toBe('iPhone')
  })

  it('should detect Googlebot crawler accurately', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.154 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    const parsed = parseUserAgent(ua)

    expect(parsed.isBot).toBe(true)
    expect(parsed.botName).toContain('Googlebot')
  })
})
