import {
  beforeAll, beforeEach, describe, expect, it, vi,
} from 'vitest'
import {
  exportSPKI, generateKeyPair, JWTPayload, KeyLike, SignJWT,
} from 'jose'
import { StorageKey } from '@melody-auth/shared'
import {
  getServerSession, requireAuth, ServerAuthOptions,
} from './serverAuth'

const cookieState = vi.hoisted(() => new Map<string, string>())

vi.mock(
  '../storage/cookieAdapter',
  () => ({
    CookieStorage: class {
      getItem (key: string) {
        return cookieState.get(key) ?? null
      }

      setItem (
        key: string, value: string,
      ) {
        cookieState.set(
          key,
          value,
        )
      }
    },
  }),
)

vi.mock(
  '@melody-auth/web',
  () => ({ exchangeTokenByRefreshToken: vi.fn() }),
)

const ISSUER = 'https://auth.example.com'
const CLIENT_ID = 'client-a'

let privateKey: KeyLike
let otherPrivateKey: KeyLike
let options: ServerAuthOptions

const sign = (
  payload: JWTPayload, key = privateKey,
) => new SignJWT(payload)
  .setProtectedHeader({
    alg: 'RS256', kid: 'test-key',
  })
  .sign(key)

const accessPayload = (): JWTPayload => ({
  sub: 'user-1',
  iss: ISSUER,
  azp: CLIENT_ID,
  scope: 'openid profile',
  exp: Math.floor(Date.now() / 1000) + 60,
})

const storeAccessToken = (
  accessToken: string, expiresOn: number,
) => {
  cookieState.set(
    StorageKey.AccessToken,
    JSON.stringify({
      accessToken,
      expiresIn: 3600,
      expiresOn,
    }),
  )
}

beforeAll(async () => {
  const signingKeys = await generateKeyPair('RS256')
  const otherSigningKeys = await generateKeyPair('RS256')
  privateKey = signingKeys.privateKey
  otherPrivateKey = otherSigningKeys.privateKey
  options = {
    serverUrl: ISSUER,
    clientId: CLIENT_ID,
    redirectUri: 'https://app.example.com/callback',
    publicKey: await exportSPKI(signingKeys.publicKey),
  }
})

beforeEach(() => {
  cookieState.clear()
})

describe(
  'getServerSession',
  () => {
    it(
      'establishes a session from a verified access token without an ID token',
      async () => {
        const accessToken = await sign(accessPayload())
        storeAccessToken(
          accessToken,
          0,
        )

        await expect(getServerSession(options)).resolves.toMatchObject({
          userId: 'user-1',
          accessToken,
          isAuthenticated: true,
        })
      },
    )

    it(
      'rejects a forged access token regardless of cookie expiry metadata',
      async () => {
        const consoleError = vi.spyOn(
          console,
          'error',
        ).mockImplementation(() => {})
        const accessToken = await sign(
          accessPayload(),
          otherPrivateKey,
        )
        storeAccessToken(
          accessToken,
          Date.now() + 60_000,
        )

        await expect(getServerSession(options)).resolves.toBeNull()
        consoleError.mockRestore()
      },
    )

    it(
      'uses verified ID-token claims instead of cached cookie account data',
      async () => {
        const accessToken = await sign(accessPayload())
        const idToken = await sign({
          sub: 'user-1',
          iss: ISSUER,
          azp: CLIENT_ID,
          aud: CLIENT_ID,
          email: 'verified@example.com',
          exp: Math.floor(Date.now() / 1000) + 60,
        })
        storeAccessToken(
          accessToken,
          0,
        )
        cookieState.set(
          StorageKey.IdToken,
          JSON.stringify({
            idToken,
            account: {
              sub: 'attacker', email: 'forged@example.com',
            },
          }),
        )

        await expect(getServerSession(options)).resolves.toMatchObject({
          userId: 'user-1',
          email: 'verified@example.com',
          account: {
            sub: 'user-1', email: 'verified@example.com',
          },
        })
      },
    )
  },
)

describe(
  'requireAuth',
  () => {
    it(
      'rejects when the access token cannot be verified',
      async () => {
        const consoleError = vi.spyOn(
          console,
          'error',
        ).mockImplementation(() => {})
        storeAccessToken(
          'not-a-jwt',
          Date.now() + 60_000,
        )

        await expect(requireAuth(options)).rejects.toThrow('Unauthorized')
        consoleError.mockRestore()
      },
    )
  },
)
