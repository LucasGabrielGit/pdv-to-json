import { describe, it, expect } from 'vitest'
import { calculateSubnet, ipToInt, intToIp } from '../cidrCalculator'

describe('cidrCalculator', () => {
  it('should accurately calculate /24 subnet for 192.168.1.50', () => {
    const result = calculateSubnet('192.168.1.50', 24)

    expect(result.networkAddress).toBe('192.168.1.0')
    expect(result.broadcastAddress).toBe('192.168.1.255')
    expect(result.netmask).toBe('255.255.255.0')
    expect(result.wildcard).toBe('0.0.0.255')
    expect(result.firstUsableHost).toBe('192.168.1.1')
    expect(result.lastUsableHost).toBe('192.168.1.254')
    expect(result.totalHosts).toBe(256)
    expect(result.usableHosts).toBe(254)
    expect(result.ipScope).toBe('Private (RFC 1918)')
  })

  it('should parse CIDR notation directly from IP string "10.0.0.1/8"', () => {
    const result = calculateSubnet('10.0.0.1/8', 24)

    expect(result.cidr).toBe(8)
    expect(result.networkAddress).toBe('10.0.0.0')
    expect(result.broadcastAddress).toBe('10.255.255.255')
    expect(result.netmask).toBe('255.0.0.0')
    expect(result.totalHosts).toBe(16777216)
    expect(result.usableHosts).toBe(16777214)
    expect(result.ipClass).toBe('A')
  })

  it('should correctly convert between IP string and integer', () => {
    const ip = '192.168.1.1'
    const int = ipToInt(ip)
    expect(intToIp(int)).toBe(ip)
  })

  it('should throw error for invalid IPv4 formats', () => {
    expect(() => ipToInt('999.999.999.999')).toThrow()
    expect(() => ipToInt('invalid.ip')).toThrow()
  })
})
