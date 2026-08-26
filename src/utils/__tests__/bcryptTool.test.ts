import { describe, it, expect } from 'vitest'
import {
  generateBcryptHash,
  verifyBcryptHash,
  inspectBcryptHash,
} from '../bcryptTool'

describe('bcryptTool', () => {
  it('should generate a valid bcrypt hash and verify it correctly', async () => {
    const password = 'SuperSecretDevKey123!'
    const genResult = await generateBcryptHash(password, 8)

    expect(genResult.hash).toMatch(/^\$2[aby]\$\d{2}\$/)
    expect(genResult.rounds).toBe(8)
    expect(genResult.salt).toBeTruthy()

    const verifyResult = await verifyBcryptHash(password, genResult.hash)
    expect(verifyResult.isMatch).toBe(true)

    const invalidVerify = await verifyBcryptHash('wrongpassword', genResult.hash)
    expect(invalidVerify.isMatch).toBe(false)
  })

  it('should parse and inspect components of a valid bcrypt hash', () => {
    const sampleHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
    const inspected = inspectBcryptHash(sampleHash)

    expect(inspected).not.toBeNull()
    expect(inspected?.version).toBe('$2a')
    expect(inspected?.rounds).toBe(10)
    expect(inspected?.salt.length).toBe(22)
    expect(inspected?.checksum.length).toBe(31)
  })

  it('should return null when inspecting an invalid bcrypt string', () => {
    expect(inspectBcryptHash('invalid-hash')).toBeNull()
    expect(inspectBcryptHash('md5-5d41402abc4b2a76b9719d911017c592')).toBeNull()
  })
})
