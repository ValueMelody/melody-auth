import {
  describe, it, expect,
} from 'vitest'
import {
  genRandomString, base64UrlEncode, genCodeChallenge,
} from './helper'

describe(
  'genRandomString',
  () => {
    it(
      'generates string of specified length',
      () => {
        const length = 10
        const result = genRandomString(length)
        expect(result.length).toBe(length)
      },
    )

    it(
      'generates different strings on multiple calls',
      () => {
        const str1 = genRandomString(10)
        const str2 = genRandomString(10)
        expect(str1).not.toBe(str2)
      },
    )

    it(
      'only contains valid characters',
      () => {
        const result = genRandomString(20)
        expect(result).toMatch(/^[A-Za-z0-9]+$/)
      },
    )
  },
)

describe(
  'base64UrlEncode',
  () => {
    it(
      'encodes ArrayBuffer to base64url string',
      () => {
        const input = new TextEncoder().encode('Hello, World!')
        const result = base64UrlEncode(input)

        // Should be URL-safe
        expect(result).not.toContain('+')
        expect(result).not.toContain('/')
        expect(result).not.toMatch(/=+$/)

        // Known value test
        expect(result).toBe('SGVsbG8sIFdvcmxkIQ')
      },
    )
  },
)

describe(
  'genCodeChallenge',
  () => {
    it(
      'generates correct code challenge from verifier',
      async () => {
        const verifier = 'test123'
        const challenge = await genCodeChallenge(verifier)

        const expectedChallenge = '7NcYcNGWMxapfjrDQIyYNa2M8PPBvHA1J8MCZVNPda4'
        expect(challenge).toBe(expectedChallenge)
      },
    )

    it(
      'generates different challenges for different verifiers',
      async () => {
        const challenge1 = await genCodeChallenge('test123')
        const challenge2 = await genCodeChallenge('test456')
        expect(challenge1).not.toBe(challenge2)
      },
    )
  },
)
