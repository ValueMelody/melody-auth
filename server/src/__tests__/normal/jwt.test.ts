import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { Scope } from '@melody-auth/shared'
import app from 'index'
import {
  messageConfig, routeConfig,
} from 'configs'
import {
  migrate, mock,
} from 'tests/mock'
import { getS2sToken } from 'tests/util'
import { jwtService } from 'services'
import { timeUtil } from 'utils'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
})

// AUTH_SERVER_URL the server signs/verifies tokens with in the test env (see tests/setup.ts).
const validIssuer = 'http://localhost:8787'

// Signs a payload with the active JWT key so the produced token has a valid
// signature and kid. The claims themselves are arbitrary, which lets each test
// craft tokens that differ from a real access token only in the dimension under test.
const signToken = async (payload: object) => jwtService.signWithKid(
  { env: mock(db) } as never,
  payload,
)

const validAccessTokenPayload = (overrides: Record<string, unknown> = {}) => {
  const currentTimestamp = timeUtil.getCurrentTimestamp()
  return {
    sub: '1-1-1-1',
    azp: 'test-client-id',
    iss: validIssuer,
    scope: `${Scope.Profile} ${Scope.OpenId} ${Scope.OfflineAccess}`,
    iat: currentTimestamp,
    exp: currentTimestamp + 1800,
    roles: [],
    ...overrides,
  }
}

const insertTestUser = async () => {
  await db.exec(`
    INSERT INTO "user"
    ("authId", locale, email, "socialAccountId", "socialAccountType", password, "firstName", "lastName")
    values ('1-1-1-1', 'en', 'test@email.com', null, null, '$2a$10$3HtEAf8YcN94V4GOR6ZBNu9tmoIflmEOqb9hUf0iqS4OjYVKe.9/C', null, null)
  `)
}

const impersonationRoute = `${routeConfig.InternalRoute.ApiUsers}/1-1-1-2/impersonation/1`

const requestImpersonation = async (impersonatorToken: string) => app.request(
  impersonationRoute,
  {
    method: 'POST',
    headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
    body: JSON.stringify({ impersonatorToken }),
  },
  mock(db),
)

describe(
  'getAccessTokenBody issuer validation',
  () => {
    test(
      'should accept a well-formed access token issued by this server',
      async () => {
        await insertTestUser()

        const accessToken = await signToken(validAccessTokenPayload())

        const res = await app.request(
          routeConfig.OauthRoute.Userinfo,
          { headers: { Authorization: `Bearer ${accessToken}` } },
          mock(db),
        )

        expect(res.status).toBe(200)
        const json = await res.json() as { authId: string }
        expect(json.authId).toBe('1-1-1-1')
      },
    )

    test(
      'should reject an access token whose issuer does not match the server',
      async () => {
        await insertTestUser()

        const accessToken = await signToken(validAccessTokenPayload({ iss: 'http://attacker.example.com' }))

        const res = await app.request(
          routeConfig.OauthRoute.Userinfo,
          { headers: { Authorization: `Bearer ${accessToken}` } },
          mock(db),
        )

        expect(res.status).toBe(401)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAccessToken)
      },
    )
  },
)

describe(
  'getAccessTokenBody token type validation',
  () => {
    // The impersonation endpoint validates impersonatorToken purely through
    // getAccessTokenBody, so it exercises the check without the scope gate that
    // the SPA guards add on top.
    test(
      'should reject an id token presented as the impersonator token',
      async () => {
        await insertTestUser()
        // Make the impersonated subject a super_admin, so the only thing that
        // can reject this request is the token-type check (an id token would
        // otherwise satisfy the legacy "any RS256 token of a super_admin" path).
        db.exec('delete from "user_role"')
        db.exec('insert into "user_role" ("userId", "roleId") values (1, 1)')

        const currentTimestamp = timeUtil.getCurrentTimestamp()
        // An id token carries an `aud` claim and has no `scope` claim.
        const idToken = await signToken({
          sub: '1-1-1-1',
          azp: 'test-client-id',
          aud: 'test-client-id',
          iss: validIssuer,
          iat: currentTimestamp,
          exp: currentTimestamp + 1800,
          email: 'test@email.com',
          roles: ['super_admin'],
        })

        const res = await requestImpersonation(idToken)

        expect(res.status).toBe(401)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAccessToken)
      },
    )

    test(
      'should reject an impersonator token without a scope claim',
      async () => {
        const currentTimestamp = timeUtil.getCurrentTimestamp()
        const tokenWithoutScope = await signToken({
          sub: '1-1-1-1',
          azp: 'test-client-id',
          iss: validIssuer,
          iat: currentTimestamp,
          exp: currentTimestamp + 1800,
          roles: ['super_admin'],
        })

        const res = await requestImpersonation(tokenWithoutScope)

        expect(res.status).toBe(401)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAccessToken)
      },
    )

    test(
      'should reject an impersonator token whose issuer does not match the server',
      async () => {
        const wrongIssuerToken = await signToken(validAccessTokenPayload({
          iss: 'http://attacker.example.com',
          roles: ['super_admin'],
        }))

        const res = await requestImpersonation(wrongIssuerToken)

        expect(res.status).toBe(401)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAccessToken)
      },
    )
  },
)
