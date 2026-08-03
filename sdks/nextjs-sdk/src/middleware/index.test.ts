import {
  afterEach, beforeAll, beforeEach, describe, expect, it, vi,
} from 'vitest'
import {
  exportSPKI, generateKeyPair, JWTPayload, KeyLike, SignJWT,
} from 'jose'
import { NextRequest } from 'next/server'
import { StorageKey } from '@melody-auth/shared'
import { createMelodyAuthMiddleware } from './index'

const ISSUER = 'https://auth.example.com'
const CLIENT_ID = 'client-a'

let privateKey: KeyLike
let otherPrivateKey: KeyLike
let publicKey: string

const signAccessToken = (
  payload: Partial<JWTPayload> = {}, key = privateKey,
) => new SignJWT({
  sub: 'user-1',
  iss: ISSUER,
  azp: CLIENT_ID,
  scope: 'openid profile',
  exp: Math.floor(Date.now() / 1000) + 60,
  ...payload,
})
  .setProtectedHeader({
    alg: 'RS256', kid: 'test-key',
  })
  .sign(key)

const createRequest = (
  accessToken: string, expiresOn: number,
) => {
  const storedToken = encodeURIComponent(JSON.stringify({
    accessToken,
    expiresIn: 3600,
    expiresOn,
  }))
  return new NextRequest(
    'https://app.example.com/protected',
    { headers: { cookie: `${StorageKey.AccessToken}=${storedToken}` } },
  )
}

beforeAll(async () => {
  const signingKeys = await generateKeyPair('RS256')
  const otherSigningKeys = await generateKeyPair('RS256')
  privateKey = signingKeys.privateKey
  otherPrivateKey = otherSigningKeys.privateKey
  publicKey = await exportSPKI(signingKeys.publicKey)
})

beforeEach(() => {
  vi.spyOn(
    console,
    'error',
  ).mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe(
  'createMelodyAuthMiddleware',
  () => {
    it(
      'authenticates from a verified access token without requiring an ID-token cookie',
      async () => {
        const accessToken = await signAccessToken()
        const middleware = createMelodyAuthMiddleware({
          serverUrl: ISSUER,
          clientId: CLIENT_ID,
          publicKey,
        })

        const response = await middleware(createRequest(
          accessToken,
          0,
        ))

        expect(response.status).toBe(200)
        expect(response.headers.get('x-auth-user-id')).toBe('user-1')
        expect(response.headers.get('x-auth-access-token')).toBe(accessToken)
        expect(response.headers.has('x-auth-account')).toBe(false)
      },
    )

    it(
      'rejects a forged token even when its cookie expiry metadata is valid',
      async () => {
        const accessToken = await signAccessToken(
          {},
          otherPrivateKey,
        )
        const middleware = createMelodyAuthMiddleware({
          serverUrl: ISSUER,
          clientId: CLIENT_ID,
          publicKey,
        })

        const response = await middleware(createRequest(
          accessToken,
          Date.now() + 60_000,
        ))

        expect(response.status).toBe(307)
        const location = response.headers.get('location')
        expect(location).toBe('https://app.example.com/login?returnUrl=%2Fprotected')
      },
    )

    it(
      'rejects an ID-token-shaped JWT in the access-token cookie',
      async () => {
        const idToken = await new SignJWT({
          sub: 'user-1',
          iss: ISSUER,
          azp: CLIENT_ID,
          aud: CLIENT_ID,
          exp: Math.floor(Date.now() / 1000) + 60,
        })
          .setProtectedHeader({
            alg: 'RS256', kid: 'test-key',
          })
          .sign(privateKey)
        const middleware = createMelodyAuthMiddleware({
          serverUrl: ISSUER,
          clientId: CLIENT_ID,
          publicKey,
        })

        const response = await middleware(createRequest(
          idToken,
          Date.now() + 60_000,
        ))

        expect(response.status).toBe(307)
      },
    )
  },
)
