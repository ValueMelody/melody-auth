import {
  afterEach, beforeEach, describe, expect, Mock, test,
  vi,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { Context } from 'hono'
import app from 'index'
import {
  fetchMock,
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  adapterConfig, localeConfig, routeConfig,
  typeConfig,
} from 'configs'
import {
  prepareFollowUpBody, postAuthorizeBody,
  insertUsers, postSignInRequest, getApp,
} from 'tests/identity'
import { jwtService } from 'services'
import { cryptoUtil } from 'utils'
import { Policy } from 'dtos/oauth'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

const sendCorrectChangeEmailCodeReq = async ({ code }: { code?: string } = {}) => {
  await insertUsers(
    db,
    false,
  )
  const body = await prepareFollowUpBody(db)
  const correctBody = {
    ...body,
    email: 'test_new@email.com',
    code: code ?? body.code,
  }

  const res = await app.request(
    routeConfig.IdentityRoute.ChangeEmailCode,
    {
      method: 'POST',
      body: JSON.stringify({
        ...body,
        email: 'test_new@email.com',
        code: code ?? body.code,
      }),
    },
    mock(db),
  )

  return {
    res, correctBody,
  }
}

const sendCorrectChangeEmailReq = async ({
  code, verificationCode,
}: { code: string; verificationCode?: string }) => {
  const correctVerificationCode = await mockedKV.get(`${adapterConfig.BaseKVKey.ChangeEmailCode}-1-test_new@email.com`)

  const res = await app.request(
    routeConfig.IdentityRoute.ChangeEmail,
    {
      method: 'POST',
      body: JSON.stringify({
        code,
        email: 'test_new@email.com',
        locale: 'en',
        verificationCode: verificationCode ?? correctVerificationCode,
      }),
    },
    mock(db),
  )

  return { res }
}

describe(
  'post /change-email-code',
  () => {
    test(
      'could send code',
      async () => {
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        const { res } = await sendCorrectChangeEmailCodeReq()
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const code = await mockedKV.get(`${adapterConfig.BaseKVKey.ChangeEmailCode}-1-test_new@email.com`)
        expect(code?.length).toBe(6)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send')
        expect(body).toContain(code)

        global.fetch = fetchMock
      },
    )

    test(
      'should stop after reach threshold',
      async () => {
        global.process.env.CHANGE_EMAIL_EMAIL_THRESHOLD = 2 as unknown as string

        const {
          res, correctBody,
        } = await sendCorrectChangeEmailCodeReq()
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.ChangeEmailAttempts}-test@email.com`)).toBe('1')

        const res1 = await app.request(
          routeConfig.IdentityRoute.ChangeEmailCode,
          {
            method: 'POST',
            body: JSON.stringify({ ...correctBody }),
          },
          mock(db),
        )
        const json1 = await res1.json()
        expect(json1).toStrictEqual({ success: true })
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.ChangeEmailAttempts}-test@email.com`)).toBe('2')

        const res2 = await app.request(
          routeConfig.IdentityRoute.ChangeEmailCode,
          {
            method: 'POST',
            body: JSON.stringify({ ...correctBody }),
          },
          mock(db),
        )
        expect(res2.status).toBe(400)

        global.process.env.CHANGE_EMAIL_EMAIL_THRESHOLD = 0 as unknown as string
        const res3 = await app.request(
          routeConfig.IdentityRoute.ChangeEmailCode,
          {
            method: 'POST',
            body: JSON.stringify({ ...correctBody }),
          },
          mock(db),
        )
        expect(res3.status).toBe(200)
        const json3 = await res3.json()
        expect(json3).toStrictEqual({ success: true })

        global.process.env.CHANGE_EMAIL_EMAIL_THRESHOLD = 5 as unknown as string
      },
    )

    test(
      'should throw error if feature not enabled',
      async () => {
        global.process.env.ENABLE_EMAIL_VERIFICATION = false as unknown as string
        const { res } = await sendCorrectChangeEmailCodeReq()
        expect(res.status).toBe(400)

        global.process.env.ENABLE_EMAIL_VERIFICATION = true as unknown as string
      },
    )

    test(
      'should throw error if policy is blocked',
      async () => {
        global.process.env.BLOCKED_POLICIES = [Policy.ChangeEmail] as unknown as string
        const { res } = await sendCorrectChangeEmailCodeReq()
        expect(res.status).toBe(400)

        global.process.env.BLOCKED_POLICIES = [] as unknown as string
      },
    )

    test(
      'should throw error for social account',
      async () => {
        global.process.env.GOOGLE_AUTH_CLIENT_ID = '123'
        const publicKey = await mockedKV.get(adapterConfig.BaseKVKey.JwtPublicSecret)
        const jwk = await cryptoUtil.secretToJwk(publicKey ?? '')
        const c = { env: { KV: mockedKV } } as unknown as Context<typeConfig.Context>
        const credential = await jwtService.signWithKid(
          c,
          {
            iss: 'https://accounts.google.com',
            email: 'test@gmail.com',
            sub: 'gid123',
            email_verified: true,
            given_name: 'first',
            family_name: 'last',
            kid: jwk.kid,
          },
        )

        const appRecord = await getApp(db)
        const tokenRes = await app.request(
          routeConfig.IdentityRoute.AuthorizeGoogle,
          {
            method: 'POST',
            body: JSON.stringify({
              ...(await postAuthorizeBody(appRecord)),
              credential,
            }),
          },
          mock(db),
        )
        const tokenJson = await tokenRes.json() as { code: string }

        const res = await app.request(
          routeConfig.IdentityRoute.ChangeEmailCode,
          {
            method: 'POST',
            body: JSON.stringify({
              email: 'test_new@email.com',
              locale: 'en',
              code: tokenJson.code,
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.SocialAccountNotSupported)
        global.process.env.GOOGLE_AUTH_CLIENT_ID = ''
      },
    )
  },
)

describe(
  'post /change-email',
  () => {
    test(
      'could change email',
      async () => {
        const { correctBody } = await sendCorrectChangeEmailCodeReq()
        const { res } = await sendCorrectChangeEmailReq({ code: correctBody.code })
        const resJson = await res.json()
        expect(resJson).toStrictEqual({ success: true })

        const appRecord = await getApp(db)
        const reLoginRes = await postSignInRequest(
          db,
          appRecord,
          { email: 'test_new@email.com' },
        )
        const loginResJson = await reLoginRes.json() as { code: string }
        expect(loginResJson).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.IdentityRoute.AuthorizeConsent,
        })
      },
    )

    test(
      'should throw 400 if use wrong auth code',
      async () => {
        await sendCorrectChangeEmailCodeReq()
        const { res } = await sendCorrectChangeEmailReq({ code: 'abc' })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.WrongAuthCode)
      },
    )

    test(
      'should throw 400 if use wrong verification code',
      async () => {
        const { correctBody } = await sendCorrectChangeEmailCodeReq()
        const { res } = await sendCorrectChangeEmailReq({
          code: correctBody.code, verificationCode: '123456',
        })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.WrongCode)
      },
    )

    test(
      'should throw error if feature not enabled',
      async () => {
        global.process.env.ENABLE_EMAIL_VERIFICATION = false as unknown as string
        const { correctBody } = await sendCorrectChangeEmailCodeReq()
        const { res } = await sendCorrectChangeEmailReq({ code: correctBody.code })
        expect(res.status).toBe(400)

        global.process.env.ENABLE_EMAIL_VERIFICATION = true as unknown as string
      },
    )

    test(
      'should throw error if policy is blocked',
      async () => {
        global.process.env.BLOCKED_POLICIES = [Policy.ChangeEmail] as unknown as string
        const { correctBody } = await sendCorrectChangeEmailCodeReq()
        const { res } = await sendCorrectChangeEmailReq({ code: correctBody.code })
        expect(res.status).toBe(400)

        global.process.env.BLOCKED_POLICIES = [] as unknown as string
      },
    )
  },
)
