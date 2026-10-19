import { createServer } from 'node:http'
import { AddressInfo } from 'node:net'
import {
  afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi,
} from 'vitest'
import {
  exportJWK, exportSPKI, generateKeyPair, JWTPayload, SignJWT,
} from 'jose'
import {
  NextRequest, NextResponse,
} from 'next/server'
import {
  getCookie, setCookie,
} from 'cookies-next'
import { StorageKey } from '@melody-auth/shared'
import { exchangeTokenByRefreshToken } from '@melody-auth/web'
import {
  getServerSession, requireAuth,
} from './serverAuth'
import {
  createMelodyAuthMiddleware, MelodyAuthMiddlewareConfig, AuthenticatedRequest, withAuth,
} from './index'

vi.mock(
  'cookies-next',
  () => ({
    getCookie: vi.fn(), setCookie: vi.fn(), deleteCookie: vi.fn(),
  }),
)
vi.mock(
  '@melody-auth/web',
  () => ({ exchangeTokenByRefreshToken: vi.fn() }),
)

const issuer = 'https://auth.example.com'
const clientId = 'test-client'
const cookies = new Map<string, string>()
let keys: Awaited<ReturnType<typeof generateKeyPair>>
let otherKeys: Awaited<ReturnType<typeof generateKeyPair>>
let publicKey: string
let otherPublicKey: string
let accessToken: string
let idToken: string
let now: number

async function sign (
  kind: 'access' | 'id',
  claims: JWTPayload = {},
  key?: typeof keys.privateKey,
  algorithm = 'RS256',
) {
  return new SignJWT({
    sub: 'real-user',
    iss: issuer,
    azp: clientId,
    exp: now + 3600,
    ...(kind === 'access'
      ? { scope: 'openid profile' }
      : {
        aud: clientId, email: 'real@example.com',
      }),
    ...claims,
  }).setProtectedHeader({
    alg: algorithm, kid: key ? 'other' : 'current',
  })
    .sign(key ?? keys.privateKey)
}

function storeAccess (token: string) {
  cookies.set(
    StorageKey.AccessToken,
    JSON.stringify({
      accessToken: token, expiresOn: now + 7200,
    }),
  )
}

function storeId (token: string) {
  cookies.set(
    StorageKey.IdToken,
    JSON.stringify({
      idToken: token,
      account: {
        sub: 'forged-admin', email: 'forged@example.com', roles: ['admin'], exp: now + 7200,
      },
    }),
  )
}

function serverOptions () {
  return {
    publicKey, clientId, serverUrl: issuer, redirectUri: 'https://app.example.com/callback',
  }
}

function middlewareOptions (): MelodyAuthMiddlewareConfig {
  return {
    publicKey, issuer, clientId,
  }
}

function request (path = '/private') {
  return new NextRequest(`https://app.example.com${path}`)
}

beforeAll(async () => {
  keys = await generateKeyPair('RS256')
  otherKeys = await generateKeyPair('RS256')
  publicKey = await exportSPKI(keys.publicKey)
  otherPublicKey = await exportSPKI(otherKeys.publicKey)
})

beforeEach(async () => {
  vi.clearAllMocks()
  vi.mocked(exchangeTokenByRefreshToken).mockReset()
  vi.spyOn(
    console,
    'error',
  ).mockImplementation(() => {})
  cookies.clear()
  vi.mocked(getCookie).mockImplementation((name) => cookies.get(name))
  now = Math.floor(Date.now() / 1000)
  accessToken = await sign('access')
  idToken = await sign('id')
  storeAccess(accessToken)
  storeId(idToken)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe.each(['middleware', 'server'] as const)(
  '%s cookie authentication',
  (target) => {
    async function authenticate () {
      if (target === 'server') return getServerSession(serverOptions())
      const response = await createMelodyAuthMiddleware(middlewareOptions())(request())
      if (response.status === 307) return null
      const account = response.headers.get('x-auth-account')
      return {
        userId: response.headers.get('x-auth-user-id') ?? undefined,
        account: account ? JSON.parse(account) : undefined,
        accessToken: response.headers.get('x-auth-access-token'),
      }
    }

    it(
      'uses signed identity instead of the forged account cookie',
      async () => {
        const session = await authenticate()
        expect(session?.userId).toBe('real-user')
        expect(session?.account?.email).toBe('real@example.com')
        expect(session?.account?.roles).toBeUndefined()
      },
    )

    it(
      'accepts verified access tokens without an ID token',
      async () => {
        cookies.delete(StorageKey.IdToken)
        const session = await authenticate()
        expect(session?.accessToken).toBe(accessToken)
        expect(session?.account).toBeUndefined()
      },
    )

    it(
      'does not require an untrusted account or expiresOn field',
      async () => {
        cookies.set(
          StorageKey.AccessToken,
          JSON.stringify({ accessToken }),
        )
        cookies.set(
          StorageKey.IdToken,
          JSON.stringify({ idToken }),
        )
        expect(await authenticate()).not.toBeNull()
      },
    )

    it(
      'rejects a forged access-token-only cookie',
      async () => {
        cookies.delete(StorageKey.IdToken)
        storeAccess('forged-access-token')
        expect(await authenticate()).toBeNull()
      },
    )

    it(
      'rejects a forged access token even with a valid ID token',
      async () => {
        storeAccess(await sign(
          'access',
          {},
          otherKeys.privateKey,
        ))
        expect(await authenticate()).toBeNull()
      },
    )

    it(
      'rejects a forged ID token despite future account expiry',
      async () => {
        storeId(await sign(
          'id',
          {},
          otherKeys.privateKey,
        ))
        expect(await authenticate()).toBeNull()
      },
    )

    it(
      'rejects an expired signed access token despite future cookie expiry',
      async () => {
        storeAccess(await sign(
          'access',
          { exp: now - 60 },
        ))
        expect(await authenticate()).toBeNull()
      },
    )

    it(
      'keeps signed identity from an expired ID token bound to a valid access token',
      async () => {
        storeId(await sign(
          'id',
          { exp: now - 60 },
        ))
        const session = await authenticate()
        expect(session?.userId).toBe('real-user')
        expect(session?.account?.email).toBe('real@example.com')
        expect(session?.account?.roles).toBeUndefined()
      },
    )

    it(
      'rejects an expired ID token signed by another key',
      async () => {
        storeId(await sign(
          'id',
          { exp: now - 60 },
          otherKeys.privateKey,
        ))
        expect(await authenticate()).toBeNull()
      },
    )

    it.each([
      { sub: 'another-user' },
      { iss: 'https://other.example.com' },
      { aud: 'other-client' },
      { azp: 'other-client' },
    ])(
      'rejects an expired ID token with mismatched claims %o',
      async (claims) => {
        storeId(await sign(
          'id',
          {
            ...claims, exp: now - 60,
          },
        ))
        expect(await authenticate()).toBeNull()
      },
    )

    it.each(['access', 'id'] as const)(
      'requires a signed expiration on the %s token',
      async (kind) => {
        const token = await sign(
          kind,
          { exp: undefined },
        )
        if (kind === 'access') storeAccess(token)
        else storeId(token)
        expect(await authenticate()).toBeNull()
      },
    )

    it.each(['access', 'id'] as const)(
      'rejects a %s token before its nbf',
      async (kind) => {
        const token = await sign(
          kind,
          { nbf: now + 60 },
        )
        if (kind === 'access') storeAccess(token)
        else storeId(token)
        expect(await authenticate()).toBeNull()
      },
    )

    it(
      'rejects an ID token used as an access token',
      async () => {
        storeAccess(idToken)
        expect(await authenticate()).toBeNull()
      },
    )

    it(
      'rejects a different signing algorithm',
      async () => {
        storeAccess(await sign(
          'access',
          {},
          undefined,
          'RS512',
        ))
        expect(await authenticate()).toBeNull()
      },
    )

    it(
      'rejects mixed user identities',
      async () => {
        storeId(await sign(
          'id',
          { sub: 'another-user' },
        ))
        expect(await authenticate()).toBeNull()
      },
    )

    it.each(['access', 'id'] as const)(
      'rejects the wrong issuer for %s tokens',
      async (kind) => {
        const token = await sign(
          kind,
          { iss: 'https://other.example.com' },
        )
        if (kind === 'access') storeAccess(token)
        else storeId(token)
        expect(await authenticate()).toBeNull()
      },
    )

    it(
      'rejects access tokens for another client',
      async () => {
        storeAccess(await sign(
          'access',
          { azp: 'other-client' },
        ))
        expect(await authenticate()).toBeNull()
      },
    )

    it(
      'rejects ID tokens for another audience',
      async () => {
        storeId(await sign(
          'id',
          { aud: 'other-client' },
        ))
        expect(await authenticate()).toBeNull()
      },
    )

    it.each(['null', '{}', 'not-json'])(
      'rejects malformed ID cookie %s',
      async (value) => {
        cookies.set(
          StorageKey.IdToken,
          value,
        )
        expect(await authenticate()).toBeNull()
      },
    )

    it(
      'requires an access token',
      async () => {
        cookies.delete(StorageKey.AccessToken)
        expect(await authenticate()).toBeNull()
      },
    )
  },
)

it(
  'fails closed without middleware verification configuration, with or without an ID token',
  async () => {
    const middleware = createMelodyAuthMiddleware({ clientId })
    expect((await middleware(request())).status).toBe(307)
    cookies.delete(StorageKey.IdToken)
    expect((await middleware(request())).status).toBe(307)
  },
)

it(
  'fails closed without a middleware clientId, with or without an ID token',
  async () => {
    const middleware = createMelodyAuthMiddleware({
      publicKey, issuer,
    } as MelodyAuthMiddlewareConfig)
    expect((await middleware(request())).status).toBe(307)
    cookies.delete(StorageKey.IdToken)
    expect((await middleware(request())).status).toBe(307)
  },
)

it(
  'keeps public paths accessible without verification configuration',
  async () => {
    const middleware = createMelodyAuthMiddleware({
      clientId, publicPaths: ['/login'],
    })
    expect((await middleware(request('/login'))).status).toBe(200)
  },
)

it(
  'does not reuse cached keys from a different configuration',
  async () => {
    expect(await getServerSession(serverOptions())).not.toBeNull()
    expect(await getServerSession({
      ...serverOptions(), publicKey: otherPublicKey,
    })).toBeNull()
    storeAccess(await sign(
      'access',
      {},
      otherKeys.privateKey,
    ))
    storeId(await sign(
      'id',
      {},
      otherKeys.privateKey,
    ))
    expect(await getServerSession({
      ...serverOptions(), publicKey: otherPublicKey,
    })).not.toBeNull()
    expect(await getServerSession(serverOptions())).toBeNull()
  },
)

it(
  'withAuth only invokes the handler for verified sessions',
  async () => {
    const handler = vi.fn((request: AuthenticatedRequest) => {
      expect(request.auth?.userId).toBe('real-user')
      return NextResponse.next()
    })
    const middleware = withAuth(
      handler,
      middlewareOptions(),
    )
    await middleware(request())
    expect(handler).toHaveBeenCalledOnce()
    handler.mockClear()
    storeAccess('forged')
    expect((await middleware(request())).status).toBe(307)
    expect(handler).not.toHaveBeenCalled()
  },
)

it(
  'requireAuth rejects forged sessions',
  async () => {
    storeAccess('forged')
    await expect(requireAuth(serverOptions())).rejects.toThrow('Unauthorized')
  },
)

describe(
  'server token refresh',
  () => {
    beforeEach(async () => {
      storeAccess(await sign(
        'access',
        { exp: now - 60 },
      ))
      cookies.set(
        StorageKey.RefreshToken,
        JSON.stringify({
          refreshToken: 'refresh-token', expiresOn: now + 7200,
        }),
      )
      vi.mocked(exchangeTokenByRefreshToken).mockResolvedValue({
        accessToken, expiresOn: now + 3600, expiresIn: 3600,
      })
    })

    it(
      'refreshes based on signed expiry and returns only verified identity',
      async () => {
        const session = await getServerSession(serverOptions())
        expect(session?.userId).toBe('real-user')
        expect(session?.email).toBe('real@example.com')
        expect(session?.accessToken).toBe(accessToken)
        expect(exchangeTokenByRefreshToken).toHaveBeenCalledOnce()
        expect(setCookie).toHaveBeenCalledOnce()
      },
    )

    it(
      'supports refresh without an ID token',
      async () => {
        cookies.delete(StorageKey.IdToken)
        expect((await getServerSession(serverOptions()))?.accessToken).toBe(accessToken)
      },
    )

    it(
      'refreshes with signed identity from an expired ID token',
      async () => {
        storeId(await sign(
          'id',
          { exp: now - 60 },
        ))
        const session = await getServerSession(serverOptions())
        expect(session?.userId).toBe('real-user')
        expect(session?.email).toBe('real@example.com')
        expect(session?.accessToken).toBe(accessToken)
        expect(setCookie).toHaveBeenCalledOnce()
      },
    )

    it.each(['forged', 'expired-forged'])(
      'rejects a %s ID token before refreshing',
      async (kind) => {
        storeId(kind === 'forged'
          ? 'forged'
          : await sign(
            'id',
            { exp: now - 60 },
            otherKeys.privateKey,
          ))
        expect(await getServerSession(serverOptions())).toBeNull()
        expect(exchangeTokenByRefreshToken).not.toHaveBeenCalled()
        expect(setCookie).not.toHaveBeenCalled()
      },
    )

    it(
      'does not refresh a forged access token',
      async () => {
        storeAccess(await sign(
          'access',
          { exp: now - 60 },
          otherKeys.privateKey,
        ))
        expect(await getServerSession(serverOptions())).toBeNull()
        expect(exchangeTokenByRefreshToken).not.toHaveBeenCalled()
      },
    )

    it.each(['forged', 'expired', 'other-user'])(
      'rejects a %s refresh result before writing cookies',
      async (kind) => {
        const token = kind === 'forged'
          ? 'forged'
          : await sign(
            'access',
            kind === 'expired'
              ? { exp: now - 60 }
              : { sub: 'other-user' },
          )
        vi.mocked(exchangeTokenByRefreshToken).mockResolvedValue({
          accessToken: token, expiresOn: now + 3600, expiresIn: 3600,
        })
        expect(await getServerSession(serverOptions())).toBeNull()
        expect(setCookie).not.toHaveBeenCalled()
      },
    )

    it(
      'fails closed when refresh fails',
      async () => {
        vi.mocked(exchangeTokenByRefreshToken).mockRejectedValue(new Error('Refresh rejected'))
        expect(await getServerSession(serverOptions())).toBeNull()
        expect(setCookie).not.toHaveBeenCalled()
      },
    )
  },
)

describe(
  'JWKS verification',
  () => {
    let baseUrl: string
    let jwks: object
    const server = createServer((
      req, res,
    ) => {
      if (req.url?.startsWith('/failed')) {
        res.writeHead(503).end()
        return
      }
      res.setHeader(
        'Content-Type',
        'application/json',
      )
      res.end(JSON.stringify(jwks))
    })

    beforeAll(async () => {
      const current = {
        ...await exportJWK(keys.publicKey), kid: 'current', use: 'sig',
      }
      const other = {
        ...await exportJWK(otherKeys.publicKey), kid: 'other', use: 'sig',
      }
      // Current key deliberately second: selection must follow kid, not array order.
      jwks = { keys: [other, current] }
      await new Promise<void>((resolve) => server.listen(
        0,
        '127.0.0.1',
        resolve,
      ))
      baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
    })

    afterAll(async () => {
      await new Promise<void>((
        resolve, reject,
      ) => server.close((error) => error ? reject(error) : resolve()))
    })

    it(
      'selects the signing key by kid for middleware and server sessions',
      async () => {
        const config = {
          issuer, clientId, jwksUri: `${baseUrl}/keys`,
        }
        expect((await createMelodyAuthMiddleware(config)(request())).status).toBe(200)
        expect(await getServerSession({
          ...serverOptions(), publicKey: undefined, jwksUri: config.jwksUri,
        })).not.toBeNull()
      },
    )

    it(
      'derives server JWKS from the trusted server URL',
      async () => {
        storeAccess(await sign(
          'access',
          { iss: baseUrl },
        ))
        storeId(await sign(
          'id',
          { iss: baseUrl },
        ))
        expect(await getServerSession({
          ...serverOptions(), publicKey: undefined, serverUrl: baseUrl,
        })).not.toBeNull()
      },
    )

    it(
      'fails closed on JWKS failure even after a different endpoint succeeded',
      async () => {
        const good = {
          issuer, clientId, jwksUri: `${baseUrl}/keys`,
        }
        expect((await createMelodyAuthMiddleware(good)(request())).status).toBe(200)
        const failed = {
          ...good, jwksUri: `${baseUrl}/failed`,
        }
        expect((await createMelodyAuthMiddleware(failed)(request())).status).toBe(307)
        expect(await getServerSession({
          ...serverOptions(), publicKey: undefined, jwksUri: failed.jwksUri,
        })).toBeNull()
      },
    )
  },
)
