import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { authenticator } from 'otplib'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  adapterConfig, messageConfig, routeConfig,
} from 'configs'
import { userModel } from 'models'
import {
  prepareFollowUpBody, insertUsers,
} from 'tests/identity'
import { enrollOtpMfa } from 'tests/util'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

const sendCorrectGetOtpMfaSetupReq = async ({ code }: { code?: string } = {}) => {
  const body = await prepareFollowUpBody(db)
  const res = await app.request(
    `${routeConfig.IdentityRoute.OtpMfaSetup}?code=${code ?? body.code}`,
    { method: 'GET' },
    mock(db),
  )

  return { res }
}

const sendCorrectGetProcessOtpMfaReq = async ({ code }: { code?: string } = {}) => {
  const body = await prepareFollowUpBody(db)
  const res = await app.request(
    `${routeConfig.IdentityRoute.ProcessOtpMfa}?code=${code ?? body.code}`,
    { method: 'GET' },
    mock(db),
  )
  return { res }
}

describe(
  'get /otp-mfa-setup',
  () => {
    test(
      'should return otp mfa setup',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        const { res } = await sendCorrectGetOtpMfaSetupReq()

        expect(res.status).toBe(200)
        const user = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        expect(await res.json()).toStrictEqual({
          otpSecret: user.otpSecret,
          otpUri: `otpauth://totp/Admin Panel (SPA):test@email.com?secret=${user.otpSecret}&issuer=melody-auth&algorithm=SHA1&digits=6&period=30`,
        })
      },
    )

    test(
      'should throw error if otp already verified',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        await db.prepare('update "user" set "otpVerified" = 1 where id = 1').run()

        const { res } = await sendCorrectGetOtpMfaSetupReq()
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.OtpAlreadySet)
      },
    )

    test(
      'should throw error if wrong auth code used',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        await prepareFollowUpBody(db)
        const { res } = await sendCorrectGetOtpMfaSetupReq({ code: 'abc' })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAuthCode)
      },
    )
  },
)

describe(
  'get /process-otp-mfa',
  () => {
    test(
      'should return not allow fallback to email mfa',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const { res } = await sendCorrectGetProcessOtpMfaReq()
        expect(res.status).toBe(200)
        expect(await res.json()).toStrictEqual({ allowFallbackToEmailMfa: false })
      },
    )

    test(
      'should return allow fallback to email mfa',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        const { res } = await sendCorrectGetProcessOtpMfaReq()
        expect(res.status).toBe(200)
        expect(await res.json()).toStrictEqual({ allowFallbackToEmailMfa: true })
      },
    )

    test(
      'should throw error if wrong auth code used',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await prepareFollowUpBody(db)
        const { res } = await sendCorrectGetProcessOtpMfaReq({ code: 'abc' })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAuthCode)
      },
    )
  },
)

describe(
  'post /process-otp-mfa',
  () => {
    test(
      'should pass otp mfa',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        await sendCorrectGetOtpMfaSetupReq()
        const body = await prepareFollowUpBody(db)
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        const token = authenticator.generate(currentUser.otpSecret)

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessOtpMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              mfaCode: token,
            }),
          },
          mock(db),
        )
        const json = await res.json() as { code: string }
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${json.code}`)).toBe('1')
      },
    )

    test(
      'should pass mfa if requied by config',
      async () => {
        process.env.OTP_MFA_IS_REQUIRED = true as unknown as string
        await insertUsers(
          db,
          false,
        )

        const body = await prepareFollowUpBody(db)
        await sendCorrectGetOtpMfaSetupReq({ code: body.code })
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        const token = authenticator.generate(currentUser.otpSecret)

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessOtpMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              mfaCode: token,
            }),
          },
          mock(db),
        )
        const json = await res.json() as { code: string }
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${json.code}`)).toBe('1')

        process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
      },
    )

    test(
      'should throw error if auth code is wrong',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        await prepareFollowUpBody(db)
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        const token = authenticator.generate(currentUser.otpSecret)

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessOtpMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              locale: 'en',
              code: 'abc',
              mfaCode: token,
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAuthCode)
      },
    )

    test(
      'should throw error if otp secret not exists',
      async () => {
        await mockedKV.put(
          `${adapterConfig.BaseKVKey.AuthCode}-abc`,
          JSON.stringify({ user: { otpSecret: null } }),
        )
        const res = await app.request(
          routeConfig.IdentityRoute.ProcessOtpMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: 'abc',
              locale: 'en',
              mfaCode: '123456',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )

    test(
      'should be blocked after 5 attempts',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        const body = await prepareFollowUpBody(db)

        await sendCorrectGetOtpMfaSetupReq({ code: body.code })

        const sendRequest = async () => {
          return app.request(
            routeConfig.IdentityRoute.ProcessOtpMfa,
            {
              method: 'POST',
              body: JSON.stringify({
                ...body,
                mfaCode: 'abcdefgh',
              }),
            },
            mock(db),
          )
        }
        const res = await sendRequest()
        expect(res.status).toBe(401)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongMfaCode)

        const res1 = await sendRequest()
        expect(res1.status).toBe(401)
        expect(await res1.text()).toBe(messageConfig.RequestError.WrongMfaCode)

        const res2 = await sendRequest()
        expect(res2.status).toBe(401)
        expect(await res2.text()).toBe(messageConfig.RequestError.WrongMfaCode)

        const res3 = await sendRequest()
        expect(res3.status).toBe(401)
        expect(await res3.text()).toBe(messageConfig.RequestError.WrongMfaCode)

        const res4 = await sendRequest()
        expect(res4.status).toBe(401)
        expect(await res4.text()).toBe(messageConfig.RequestError.WrongMfaCode)

        const res5 = await sendRequest()
        expect(res5.status).toBe(400)
        expect(await res5.text()).toBe(messageConfig.RequestError.OtpMfaLocked)
      },
    )

    test(
      'could fallback to email mfa',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)

        const body = await prepareFollowUpBody(db)
        await app.request(
          routeConfig.IdentityRoute.SendEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({ ...body }),
          },
          mock(db),
        )

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: body.code,
              locale: body.locale,
              mfaCode: await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${body.code}`),
            }),
          },
          mock(db),
        )

        const json = await res.json() as { code: string }
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${json.code}`)).toBe('1')
      },
    )

    test(
      'should set remember device cookie when rememberDevice is true',
      async () => {
        process.env.ENABLE_MFA_REMEMBER_DEVICE = true as unknown as string

        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        await sendCorrectGetOtpMfaSetupReq()
        const body = await prepareFollowUpBody(db)
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        const token = authenticator.generate(currentUser.otpSecret)

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessOtpMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              mfaCode: token,
              rememberDevice: true,
            }),
          },
          mock(db),
        )

        expect(res.status).toBe(200)
        const json = await res.json() as { code: string }
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })

        const setCookieHeader = res.headers.get('Set-Cookie')
        expect(setCookieHeader).toContain('OMRD-1=')
        expect(setCookieHeader).toContain('HttpOnly')
        expect(setCookieHeader).toContain('Secure')
        expect(setCookieHeader).toContain('SameSite=Strict')

        const cookieMatch = setCookieHeader?.match(/OMRD-1=([^;]+)/)
        const cookieValue = cookieMatch?.[1]
        expect(cookieValue).toBeDefined()
        expect(cookieValue?.split('-')).toHaveLength(2)
        expect(cookieValue?.split('-')[0]).toHaveLength(24)
        expect(cookieValue?.split('-')[1]).toHaveLength(128)

        const [deviceId, storedCookieValue] = cookieValue!.split('-')
        const kvKey = `${adapterConfig.BaseKVKey.OtpMfaRememberDevice}-1-${deviceId}`
        const storedValue = await mockedKV.get(kvKey)
        expect(storedValue).toBe(storedCookieValue)

        process.env.ENABLE_MFA_REMEMBER_DEVICE = false as unknown as string
      },
    )

    test(
      'should not set remember device cookie when rememberDevice is false',
      async () => {
        process.env.ENABLE_MFA_REMEMBER_DEVICE = true as unknown as string

        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        await sendCorrectGetOtpMfaSetupReq()
        const body = await prepareFollowUpBody(db)
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        const token = authenticator.generate(currentUser.otpSecret)

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessOtpMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              mfaCode: token,
              rememberDevice: false,
            }),
          },
          mock(db),
        )

        expect(res.status).toBe(200)
        const json = await res.json() as { code: string }
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })

        const setCookieHeader = res.headers.get('Set-Cookie')
        expect(setCookieHeader).toBeNull()

        process.env.ENABLE_MFA_REMEMBER_DEVICE = false as unknown as string
      },
    )

    test(
      'should not set remember device cookie when ENABLE_MFA_REMEMBER_DEVICE is false',
      async () => {
        process.env.ENABLE_MFA_REMEMBER_DEVICE = false as unknown as string

        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        await sendCorrectGetOtpMfaSetupReq()
        const body = await prepareFollowUpBody(db)
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        const token = authenticator.generate(currentUser.otpSecret)

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessOtpMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              mfaCode: token,
              rememberDevice: true,
            }),
          },
          mock(db),
        )

        expect(res.status).toBe(200)
        const json = await res.json() as { code: string }
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })

        const setCookieHeader = res.headers.get('Set-Cookie')
        expect(setCookieHeader).toBeNull()
      },
    )

    test(
      'should bypass otp mfa on subsequent login when device is remembered',
      async () => {
        process.env.ENABLE_MFA_REMEMBER_DEVICE = true as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)

        await sendCorrectGetOtpMfaSetupReq()
        const body = await prepareFollowUpBody(db)
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        const token = authenticator.generate(currentUser.otpSecret)

        const mfaRes = await app.request(
          routeConfig.IdentityRoute.ProcessOtpMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              mfaCode: token,
              rememberDevice: true,
            }),
          },
          mock(db),
        )

        expect(mfaRes.status).toBe(200)
        const mfaJson = await mfaRes.json() as { code: string }

        const setCookieHeader = mfaRes.headers.get('Set-Cookie')
        expect(setCookieHeader).toContain('OMRD-1=')
        
        const cookieMatch = setCookieHeader?.match(/OMRD-1=([^;]+)/)
        const cookieValue = cookieMatch?.[1]
        expect(cookieValue).toBeDefined()

        // Complete first login with token exchange
        const tokenRes = await app.request(
          routeConfig.OauthRoute.Token,
          {
            method: 'POST',
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code: mfaJson.code,
              code_verifier: 'abc',
            }).toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
          mock(db),
        )
        expect(tokenRes.status).toBe(200)

        const appRecord = db.prepare('SELECT * FROM app WHERE id = 1').get() as any
        
        const secondLoginRes = await app.request(
          routeConfig.IdentityRoute.AuthorizePassword,
          {
            method: 'POST',
            body: JSON.stringify({
              clientId: appRecord.clientId,
              redirectUri: 'http://localhost:3000/en/dashboard',
              responseType: 'code',
              state: '123',
              codeChallenge: 'ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0',
              codeChallengeMethod: 's256',
              scope: 'profile openid offline_access',
              locale: 'en',
              email: 'test@email.com',
              password: 'Password1!',
            }),
            headers: {
              'Cookie': `OMRD-1=${cookieValue}`,
            },
          },
          mock(db),
        )

        expect(secondLoginRes.status).toBe(200)
        const secondLoginJson = await secondLoginRes.json() as { code: string }
        expect(secondLoginJson).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })

        const secondTokenRes = await app.request(
          routeConfig.OauthRoute.Token,
          {
            method: 'POST',
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code: secondLoginJson.code,
              code_verifier: 'abc',
            }).toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
          mock(db),
        )
        
        expect(secondTokenRes.status).toBe(200)
        const secondTokenJson = await secondTokenRes.json()
        expect(secondTokenJson).toStrictEqual({
          access_token: expect.any(String),
          expires_in: 1800,
          expires_on: expect.any(Number),
          not_before: expect.any(Number),
          token_type: 'Bearer',
          scope: 'profile openid offline_access',
          refresh_token: expect.any(String),
          refresh_token_expires_in: 604800,
          refresh_token_expires_on: expect.any(Number),
          id_token: expect.any(String),
        })

        process.env.ENABLE_MFA_REMEMBER_DEVICE = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )
  },
)
