import {
  afterEach, beforeEach, describe, expect, Mock, test,
  vi,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { JSDOM } from 'jsdom'
import { authenticator } from 'otplib'
import app from 'index'
import {
  fetchMock,
  getSmsResponseMock,
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  adapterConfig, localeConfig, routeConfig,
} from 'configs'
import { userModel } from 'models'
import {
  prepareFollowUpBody, prepareFollowUpParams, insertUsers,
  getCodeFromParams,
} from 'tests/identity'
import {
  enrollEmailMfa, enrollOtpMfa,
  enrollSmsMfa,
} from 'tests/util'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

describe(
  'get /authorize-mfa-enroll',
  () => {
    test(
      'should show mfa enroll page',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeMfaEnroll}${params}`,
          {},
          mock(db),
        )

        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(1)
        expect(document.getElementsByTagName('button').length).toBe(2)
        expect(document.getElementsByTagName('button')[0].innerHTML).toBe(localeConfig.authorizeMfaEnroll.otp.en)
        expect(document.getElementsByTagName('button')[1].innerHTML).toBe(localeConfig.authorizeMfaEnroll.email.en)
      },
    )

    test(
      'could render different otp types',
      async () => {
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['sms', 'otp', 'email'] as unknown as string

        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeMfaEnroll}${params}`,
          {},
          mock(db),
        )

        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(1)
        expect(document.getElementsByTagName('button').length).toBe(3)
        expect(document.getElementsByTagName('button')[0].innerHTML).toBe(localeConfig.authorizeMfaEnroll.sms.en)
        expect(document.getElementsByTagName('button')[1].innerHTML).toBe(localeConfig.authorizeMfaEnroll.otp.en)
        expect(document.getElementsByTagName('button')[2].innerHTML).toBe(localeConfig.authorizeMfaEnroll.email.en)

        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['otp', 'email'] as unknown as string
      },
    )

    test(
      'should redirect if auth code is wrong',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeMfaEnroll}?locale=en&code=abc`,
          {},
          mock(db),
        )
        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=en`)
      },
    )

    test(
      'could disable locale selector',
      async () => {
        global.process.env.ENABLE_LOCALE_SELECTOR = false as unknown as string
        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeMfaEnroll}${params}`,
          {},
          mock(db),
        )

        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(0)
        global.process.env.ENABLE_LOCALE_SELECTOR = true as unknown as string
      },
    )

    test(
      'throw error if user already enrolled',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await db.prepare('update "user" set "mfaTypes" = ?').run('email')
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeMfaEnroll}${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.MfaEnrolled)
      },
    )

    test(
      'should be blocked if not enabled in config',
      async () => {
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeMfaEnroll}${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
      },
    )

    test(
      'could throw error if no enough params',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await prepareFollowUpParams(db)

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeMfaEnroll,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )
  },
)

describe(
  'post /authorize-mfa-enroll',
  () => {
    test(
      'should enroll email mfa',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeMfaEnroll,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              type: userModel.MfaType.Email,
            }),
          },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.IdentityRoute.AuthorizeEmailMfa,
        })

        const user = await db.prepare('SELECT * from "user" WHERE id = 1').get() as userModel.Raw
        expect(user.mfaTypes).toBe(userModel.MfaType.Email)
      },
    )

    test(
      'should throw error if auth code is wrong',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeMfaEnroll,
          {
            method: 'POST',
            body: JSON.stringify({
              locale: 'en',
              code: 'abc',
              type: userModel.MfaType.Email,
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.WrongAuthCode)
      },
    )

    test(
      'should throw error if user already enrolled',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await db.prepare('update "user" set "mfaTypes" = ?').run('email')
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeMfaEnroll,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              type: userModel.MfaType.Email,
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.MfaEnrolled)
      },
    )

    test(
      'should enroll otp mfa',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeMfaEnroll,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              type: userModel.MfaType.Otp,
            }),
          },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.IdentityRoute.AuthorizeOtpSetup,
        })

        const user = await db.prepare('SELECT * from "user" WHERE id = 1').get() as userModel.Raw
        expect(user.mfaTypes).toBe(userModel.MfaType.Otp)
      },
    )
  },
)

const testGetOtpMfa = async (route: string) => {
  const params = await prepareFollowUpParams(db)

  const res = await app.request(
    `${route}${params}`,
    {},
    mock(db),
  )
  return res
}

describe(
  'get /authorize-otp-setup',
  () => {
    test(
      'should show otp mfa setup page',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const res = await testGetOtpMfa(routeConfig.IdentityRoute.AuthorizeOtpSetup)
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByName('otp').length).toBe(1)
        expect(document.getElementsByTagName('form').length).toBe(1)
        expect(document.getElementsByTagName('select').length).toBe(1)
      },
    )

    test(
      'should redirect if auth code is wrong',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeOtpSetup}?locale=en&code=abc`,
          {},
          mock(db),
        )
        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=en`)
      },
    )

    test(
      'should throw error if user already set otp',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await db.prepare('update "user" set "otpVerified" = ?').run(1)
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeOtpSetup}${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.OtpAlreadySet)
      },
    )

    test(
      'could disable locale selector',
      async () => {
        global.process.env.ENABLE_LOCALE_SELECTOR = false as unknown as string
        await insertUsers(
          db,
          false,
        )
        const res = await testGetOtpMfa(routeConfig.IdentityRoute.AuthorizeOtpSetup)
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(0)
        global.process.env.ENABLE_LOCALE_SELECTOR = true as unknown as string
      },
    )
  },
)

describe(
  'get /authorize-otp-mfa',
  () => {
    test(
      'should show otp mfa page',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        const res = await testGetOtpMfa(routeConfig.IdentityRoute.AuthorizeOtpMfa)
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByName('otp').length).toBe(1)
        expect(document.getElementsByTagName('select').length).toBe(1)
        expect(document.getElementsByTagName('form').length).toBe(1)
        const buttons = document.getElementsByTagName('button')
        expect(buttons.length).toBe(2)
        expect(buttons[0].innerHTML).toBe(localeConfig.authorizeOtpMfa.switchToEmail.en)
        expect(buttons[1].innerHTML).toBe(localeConfig.authorizeOtpMfa.verify.en)
      },
    )

    test(
      'should redirect if auth code is wrong',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeOtpMfa}?locale=en&code=abc`,
          {},
          mock(db),
        )
        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=en`)
      },
    )

    test(
      'could disable locale selector',
      async () => {
        global.process.env.ENABLE_LOCALE_SELECTOR = false as unknown as string

        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        const res = await testGetOtpMfa(routeConfig.IdentityRoute.AuthorizeOtpMfa)
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(0)
        global.process.env.ENABLE_LOCALE_SELECTOR = true as unknown as string
      },
    )

    test(
      'could disable fallback to email mfa',
      async () => {
        global.process.env.ALLOW_EMAIL_MFA_AS_BACKUP = false as unknown as string
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        const res = await testGetOtpMfa(routeConfig.IdentityRoute.AuthorizeOtpMfa)
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        const buttons = document.getElementsByTagName('button')
        expect(buttons.length).toBe(1)
        expect(buttons[0].innerHTML).toBe(localeConfig.authorizeOtpMfa.verify.en)
        global.process.env.ALLOW_EMAIL_MFA_AS_BACKUP = true as unknown as string
      },
    )
  },
)

describe(
  'post /authorize-otp-mfa',
  () => {
    test(
      'should pass otp mfa',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        const body = await prepareFollowUpBody(db)
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        const token = authenticator.generate(currentUser.otpSecret)

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeOtpMfa,
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
          routeConfig.IdentityRoute.AuthorizeOtpMfa,
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
        expect(await res.text()).toBe(localeConfig.Error.WrongAuthCode)
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
          routeConfig.IdentityRoute.AuthorizeOtpMfa,
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

        const sendRequest = async () => {
          return app.request(
            routeConfig.IdentityRoute.AuthorizeOtpMfa,
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
        expect(await res.text()).toBe(localeConfig.Error.WrongMfaCode)

        const res1 = await sendRequest()
        expect(res1.status).toBe(401)
        expect(await res1.text()).toBe(localeConfig.Error.WrongMfaCode)

        const res2 = await sendRequest()
        expect(res2.status).toBe(401)
        expect(await res2.text()).toBe(localeConfig.Error.WrongMfaCode)

        const res3 = await sendRequest()
        expect(res3.status).toBe(401)
        expect(await res3.text()).toBe(localeConfig.Error.WrongMfaCode)

        const res4 = await sendRequest()
        expect(res4.status).toBe(401)
        expect(await res4.text()).toBe(localeConfig.Error.WrongMfaCode)

        const res5 = await sendRequest()
        expect(res5.status).toBe(400)
        expect(await res5.text()).toBe(localeConfig.Error.OtpMfaLocked)
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

        const params = await prepareFollowUpParams(db)
        await app.request(
          `${routeConfig.IdentityRoute.AuthorizeEmailMfa}${params}`,
          {},
          mock(db),
        )
        const code = getCodeFromParams(params)

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code,
              locale: 'en',
              mfaCode: await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${code}`),
            }),
          },
          mock(db),
        )

        const json = await res.json() as { code: string }
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${json.code}`)).toBe('1')
      },
    )
  },
)

describe(
  'get /authorize-sms-mfa',
  () => {
    test(
      'should show sms mfa page',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollSmsMfa(db)
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeSmsMfa}${params}`,
          {},
          mock(db),
        )
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(1)
        expect(document.getElementsByName('phoneNumber').length).toBe(1)
        expect(document.getElementsByTagName('form').length).toBe(1)
        expect(document.getElementById('resend-btn')?.classList).toContain('hidden')
        expect(document.getElementById('switch-to-email')).toBeFalsy()

        const code = getCodeFromParams(params)
        expect((await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${code}`) ?? '').length).toBeFalsy()
      },
    )

    test(
      'should show sms mfa page if required',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        await insertUsers(
          db,
          false,
        )

        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeSmsMfa}${params}`,
          {},
          mock(db),
        )
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(1)
        const phoneNumberEl = document.getElementById('form-phoneNumber') as HTMLInputElement
        expect(phoneNumberEl.value).toBe('')
        const phoneNumberRow = document.getElementById('phoneNumber-row') as HTMLDivElement
        expect(phoneNumberRow.innerHTML).toContain('+1')
        expect(phoneNumberEl.disabled).toBeFalsy()
        expect(document.getElementsByName('code').length).toBe(1)
        expect(document.getElementsByTagName('form').length).toBe(1)
        expect(mockFetch).toBeCalledTimes(0)

        const code = getCodeFromParams(params)
        expect((await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${code}`) ?? '').length).toBeFalsy()

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        global.fetch = fetchMock
      },
    )

    test(
      'should show phone number if sms phone number verified',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        await insertUsers(
          db,
          false,
        )

        await db.prepare('update "user" set "smsPhoneNumber" = ?, "smsPhoneNumberVerified" = ?').run(
          '+16471231234',
          1,
        )

        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeSmsMfa}${params}`,
          {},
          mock(db),
        )
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(1)
        const phoneNumberEl = document.getElementById('form-phoneNumber') as HTMLInputElement
        expect(phoneNumberEl.value).toBe('********1234')
        expect(phoneNumberEl.disabled).toBeTruthy()
        expect(document.getElementsByName('code').length).toBe(1)
        expect(document.getElementsByTagName('form').length).toBe(1)
        expect(document.getElementById('resend-btn')?.classList).not.toContain('hidden')
        expect(document.getElementById('switch-to-email')).toBeTruthy()

        const code = getCodeFromParams(params)
        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${code}`) ?? ''
        expect(mfaCode.length).toBe(6)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: any }).body
        expect(callArgs[0]).toBe('https://api.twilio.com/2010-04-01/Accounts/123/Messages.json')
        expect(body.get('To')).toBe('+16471231234')
        expect(body.get('From')).toBe('+1231231234')
        expect(body.get('Body')).toBe(`${localeConfig.smsMfaMsg.body.en}: ${mfaCode}`)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'could disable fall back to email mfa',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'
        process.env.ALLOW_EMAIL_MFA_AS_BACKUP = false as unknown as string

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        await insertUsers(
          db,
          false,
        )

        await db.prepare('update "user" set "smsPhoneNumber" = ?, "smsPhoneNumberVerified" = ?').run(
          '+16471231234',
          1,
        )

        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeSmsMfa}${params}`,
          {},
          mock(db),
        )
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(1)
        const phoneNumberEl = document.getElementById('form-phoneNumber') as HTMLInputElement
        expect(phoneNumberEl.value).toBe('********1234')
        expect(phoneNumberEl.disabled).toBeTruthy()
        expect(document.getElementsByName('code').length).toBe(1)
        expect(document.getElementsByTagName('form').length).toBe(1)
        expect(document.getElementById('resend-btn')?.classList).not.toContain('hidden')
        expect(document.getElementById('switch-to-email')).toBeFalsy()

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
        process.env.ALLOW_EMAIL_MFA_AS_BACKUP = true as unknown as string
      },
    )

    test(
      'should pass through if request failed',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        const mockFetch = vi.fn(async () => {
          return Promise.resolve({
            ok: false, text: () => {},
          })
        }) as Mock
        global.fetch = mockFetch

        await insertUsers(
          db,
          false,
        )

        await db.prepare('update "user" set "smsPhoneNumber" = ?, "smsPhoneNumberVerified" = ?').run(
          '+16471231234',
          1,
        )

        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeSmsMfa}${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(200)
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(1)
        const phoneNumberEl = document.getElementById('form-phoneNumber') as HTMLInputElement
        expect(phoneNumberEl.value).toBe('********1234')
        expect(phoneNumberEl.disabled).toBeTruthy()
        expect(document.getElementsByName('code').length).toBe(1)
        expect(document.getElementsByTagName('form').length).toBe(1)

        const code = getCodeFromParams(params)
        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${code}`) ?? ''
        expect(mfaCode.length).toBe(0)
        expect(mockFetch).toBeCalledTimes(1)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'throw error if sms config not set',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string

        await insertUsers(
          db,
          false,
        )

        await db.prepare('update "user" set "smsPhoneNumber" = ?, "smsPhoneNumberVerified" = ?').run(
          '+16471231234',
          1,
        )

        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeSmsMfa}${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.NoSmsSender)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
      },
    )

    test(
      'should redirect if auth code is invalid',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollSmsMfa(db)
        await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeSmsMfa}?locale=en&code=abc`,
          {},
          mock(db),
        )
        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=en`)
      },
    )

    test(
      'should throw error if sms mfa is not required',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeSmsMfa}${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )

    test(
      'could disable locale selector',
      async () => {
        global.process.env.ENABLE_LOCALE_SELECTOR = false as unknown as string
        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeSmsMfa}${params}`,
          {},
          mock(db),
        )
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(0)
        global.process.env.ENABLE_LOCALE_SELECTOR = true as unknown as string
      },
    )
  },
)

describe(
  'post /setup-sms-mfa',
  () => {
    test(
      'should throw error if user already setup sms',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollSmsMfa(db)
        await db.prepare('update "user" set "smsPhoneNumber" = ?, "smsPhoneNumberVerified" = ?').run(
          '+16471231234',
          1,
        )

        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeEmailMfa}`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              phoneNumber: '+6471111111',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )

    test(
      'could setup sms',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        await insertUsers(
          db,
          false,
        )
        await enrollSmsMfa(db)

        const reqBody = await prepareFollowUpBody(db)
        const res = await app.request(
          `${routeConfig.IdentityRoute.SetupSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...reqBody,
              phoneNumber: '+6471111111',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(200)
        const user = await db.prepare('select * from "user" where id = 1').get() as userModel.Record
        expect(user.smsPhoneNumber).toBe('+6471111111')
        expect(user.smsPhoneNumberVerified).toBe(0)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${reqBody.code}`) ?? ''
        expect(mfaCode.length).toBe(6)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: any }).body
        expect(callArgs[0]).toBe('https://api.twilio.com/2010-04-01/Accounts/123/Messages.json')
        expect(body.get('To')).toBe('+6471111111')
        expect(body.get('From')).toBe('+1231231234')
        expect(body.get('Body')).toBe(`${localeConfig.smsMfaMsg.body.en}: ${mfaCode}`)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'could send sms to dev number',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'
        process.env.ENVIRONMENT = 'dev'

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        await insertUsers(
          db,
          false,
        )
        await enrollSmsMfa(db)

        const reqBody = await prepareFollowUpBody(db)
        const res = await app.request(
          `${routeConfig.IdentityRoute.SetupSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...reqBody,
              phoneNumber: '+6471111111',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(200)
        const user = await db.prepare('select * from "user" where id = 1').get() as userModel.Record
        expect(user.smsPhoneNumber).toBe('+6471111111')
        expect(user.smsPhoneNumberVerified).toBe(0)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${reqBody.code}`) ?? ''
        expect(mfaCode.length).toBe(6)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: any }).body
        expect(callArgs[0]).toBe('https://api.twilio.com/2010-04-01/Accounts/123/Messages.json')
        expect(body.get('To')).toBe('+14161231234')
        expect(body.get('From')).toBe('+1231231234')
        expect(body.get('Body')).toBe(`${localeConfig.smsMfaMsg.body.en}: ${mfaCode}`)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        process.env.ENVIRONMENT = 'prod'
        global.fetch = fetchMock
      },
    )

    test(
      'should throw error if code is wrong',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        await insertUsers(
          db,
          false,
        )
        await enrollSmsMfa(db)

        const reqBody = await prepareFollowUpBody(db)
        const res = await app.request(
          `${routeConfig.IdentityRoute.SetupSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...reqBody,
              code: 'abc',
              phoneNumber: '+6471111111',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.WrongAuthCode)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
      },
    )
  },
)

describe(
  'post /resend-sms-mfa',
  () => {
    test(
      'could resend mfa',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        await insertUsers(
          db,
          false,
        )

        await db.prepare('update "user" set "smsPhoneNumber" = ?, "smsPhoneNumberVerified" = ?').run(
          '+16471231234',
          1,
        )

        const reqBody = await prepareFollowUpBody(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ResendSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify(reqBody),
          },
          mock(db),
        )
        expect(res.status).toBe(200)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${reqBody.code}`) ?? ''
        expect(mfaCode.length).toBe(6)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: any }).body
        expect(callArgs[0]).toBe('https://api.twilio.com/2010-04-01/Accounts/123/Messages.json')
        expect(body.get('To')).toBe('+16471231234')
        expect(body.get('From')).toBe('+1231231234')
        expect(body.get('Body')).toBe(`${localeConfig.smsMfaMsg.body.en}: ${mfaCode}`)

        const logs = await db.prepare('select * from sms_log').all()
        expect(logs.length).toBe(0)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'could log sms',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'
        process.env.ENABLE_SMS_LOG = true as unknown as string

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        await insertUsers(
          db,
          false,
        )

        await db.prepare('update "user" set "smsPhoneNumber" = ?, "smsPhoneNumberVerified" = ?').run(
          '+16471231234',
          1,
        )

        const reqBody = await prepareFollowUpBody(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ResendSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify(reqBody),
          },
          mock(db),
        )
        expect(res.status).toBe(200)
        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: any }).body

        const logs = await db.prepare('select * from sms_log').all()
        expect(logs.length).toBe(1)
        expect(logs[0]).toStrictEqual({
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          deletedAt: null,
          receiver: '+16471231234',
          response: 'test response',
          success: 1,
          id: 1,
          content: body.get('Body'),
        })

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        process.env.ENABLE_SMS_LOG = false as unknown as string
        global.fetch = fetchMock
      },
    )

    test(
      'could trigger threshold protection',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'
        process.env.SMS_MFA_MESSAGE_THRESHOLD = 2 as unknown as string

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        await insertUsers(
          db,
          false,
        )

        await db.prepare('update "user" set "smsPhoneNumber" = ?, "smsPhoneNumberVerified" = ?').run(
          '+16471231234',
          1,
        )

        const reqBody = await prepareFollowUpBody(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ResendSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify(reqBody),
          },
          mock(db),
        )
        expect(res.status).toBe(200)

        const res2 = await app.request(
          `${routeConfig.IdentityRoute.ResendSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify(reqBody),
          },
          mock(db),
        )
        expect(res2.status).toBe(200)

        const res3 = await app.request(
          `${routeConfig.IdentityRoute.ResendSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify(reqBody),
          },
          mock(db),
        )
        expect(res3.status).toBe(400)
        expect(await res3.text()).toBe(localeConfig.Error.SmsMfaLocked)

        process.env.SMS_MFA_MESSAGE_THRESHOLD = 0 as unknown as string

        const res4 = await app.request(
          `${routeConfig.IdentityRoute.ResendSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify(reqBody),
          },
          mock(db),
        )
        expect(res4.status).toBe(200)

        process.env.SMS_MFA_MESSAGE_THRESHOLD = 5 as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'should throw error if user has not setup sms',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollSmsMfa(db)
        await db.prepare('update "user" set "smsPhoneNumber" = ?').run('+16471231234')

        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ResendSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify(body),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )

    test(
      'should throw error if code is wrong',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        await insertUsers(
          db,
          false,
        )
        await enrollSmsMfa(db)

        const reqBody = await prepareFollowUpBody(db)
        const res = await app.request(
          `${routeConfig.IdentityRoute.ResendSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...reqBody,
              code: 'abc',
              phoneNumber: '+6471111111',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.WrongAuthCode)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
      },
    )
  },
)

describe(
  'post /authorize-sms-mfa',
  () => {
    test(
      'could pass sms mfa',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )
        await enrollSmsMfa(db)
        const reqBody = await prepareFollowUpBody(db)

        await app.request(
          `${routeConfig.IdentityRoute.SetupSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...reqBody,
              phoneNumber: '+6471112222',
            }),
          },
          mock(db),
        )

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${reqBody.code}`)
        expect(mfaCode?.length).toBe(6)
        expect(mockFetch).toBeCalledTimes(1)

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeSmsMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: reqBody.code,
              locale: 'en',
              mfaCode,
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
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${json.code}`)).toBe('1')

        const user = await db.prepare('select * from "user" where id = 1').get() as userModel.Record
        expect(user.smsPhoneNumber).toBe('+6471112222')
        expect(user.smsPhoneNumberVerified).toBe(1)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'should throw error if auth code is wrong',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )
        await enrollSmsMfa(db)
        const reqBody = await prepareFollowUpBody(db)

        await app.request(
          `${routeConfig.IdentityRoute.SetupSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...reqBody,
              phoneNumber: '+6471112222',
            }),
          },
          mock(db),
        )

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${reqBody.code}`)
        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeSmsMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: 'abc',
              locale: 'en',
              mfaCode,
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.WrongAuthCode)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'should throw error for wrong code',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )
        await enrollSmsMfa(db)
        const reqBody = await prepareFollowUpBody(db)

        await app.request(
          `${routeConfig.IdentityRoute.SetupSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...reqBody,
              phoneNumber: '+6471112222',
            }),
          },
          mock(db),
        )

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeSmsMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: reqBody.code,
              locale: 'en',
              mfaCode: 'abc',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(401)
        expect(await res.text()).toBe(localeConfig.Error.WrongMfaCode)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )
  },
)

describe(
  'get /authorize-email-mfa',
  () => {
    test(
      'should show email mfa page',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeEmailMfa}${params}`,
          {},
          mock(db),
        )
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(1)
        expect(document.getElementsByName('code').length).toBe(1)
        expect(document.getElementsByTagName('form').length).toBe(1)

        const code = getCodeFromParams(params)
        expect((await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${code}`) ?? '').length).toBe(6)
      },
    )

    test(
      'should redirect if auth code is invalid',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)
        await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeEmailMfa}?locale=en&code=abc`,
          {},
          mock(db),
        )
        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=en`)
      },
    )

    test(
      'should throw error if email mfa is not required',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeEmailMfa}${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )

    test(
      'could protect against threshold',
      async () => {
        process.env.EMAIL_MFA_EMAIL_THRESHOLD = 1 as unknown as string

        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeEmailMfa}${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(200)
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(1)
        expect(document.getElementsByName('code').length).toBe(1)
        expect(document.getElementsByTagName('form').length).toBe(1)

        const res1 = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeEmailMfa}${params}`,
          {},
          mock(db),
        )
        expect(res1.status).toBe(200)
        const html1 = await res1.text()
        const dom1 = new JSDOM(html1)
        const document1 = dom1.window.document
        expect(document1.getElementsByTagName('select').length).toBe(1)
        expect(document1.getElementsByName('code').length).toBe(0)
        expect(document1.getElementsByTagName('form').length).toBe(0)

        process.env.EMAIL_MFA_EMAIL_THRESHOLD = 10 as unknown as string
      },
    )

    test(
      'could disable locale selector',
      async () => {
        global.process.env.ENABLE_LOCALE_SELECTOR = false as unknown as string
        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeEmailMfa}${params}`,
          {},
          mock(db),
        )
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(0)
        global.process.env.ENABLE_LOCALE_SELECTOR = true as unknown as string
      },
    )
  },
)

describe(
  'post /resend-email-mfa',
  () => {
    test(
      'should resent email mfa code',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.ResendEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: body.code,
              locale: 'en',
            }),
          },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        expect((await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${body.code}`) ?? '').length).toBe(6)
      },
    )

    test(
      'could protect against threshold',
      async () => {
        process.env.EMAIL_MFA_EMAIL_THRESHOLD = 2 as unknown as string

        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)
        const body = await prepareFollowUpBody(db)

        const sendRequest = async () => await app.request(
          routeConfig.IdentityRoute.ResendEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: body.code,
              locale: 'en',
            }),
          },
          mock(db),
        )

        const res = await sendRequest()
        expect(res.status).toBe(200)

        const res1 = await sendRequest()
        expect(res1.status).toBe(200)

        const res2 = await sendRequest()
        expect(res2.status).toBe(400)
        expect(await res2.text()).toBe(localeConfig.Error.EmailMfaLocked)

        process.env.EMAIL_MFA_EMAIL_THRESHOLD = 0 as unknown as string

        const res3 = await sendRequest()
        expect(res3.status).toBe(200)

        process.env.EMAIL_MFA_EMAIL_THRESHOLD = 10 as unknown as string
      },
    )

    test(
      'should throw error if auth code is wrong',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)
        await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.ResendEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: 'abc',
              locale: 'en',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.WrongAuthCode)
      },
    )
  },
)

describe(
  'post /authorize-email-mfa',
  () => {
    test(
      'could use original code',
      async () => {
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)
        const params = await prepareFollowUpParams(db)

        await app.request(
          `${routeConfig.IdentityRoute.AuthorizeEmailMfa}${params}`,
          {},
          mock(db),
        )
        const code = getCodeFromParams(params)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${code}`)
        expect(mfaCode?.length).toBe(6)
        expect(mockFetch).toBeCalledTimes(1)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send')
        expect(body).toContain(mfaCode)

        global.fetch = fetchMock

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code,
              locale: 'en',
              mfaCode: await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${code}`),
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
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${json.code}`)).toBe('1')
      },
    )

    test(
      'should throw error if not enrolled with email mfa and fallback is not allowed',
      async () => {
        process.env.ALLOW_EMAIL_MFA_AS_BACKUP = false as unknown as string

        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeEmailMfa}${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)

        const code = getCodeFromParams(params)
        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${code}`)
        expect(mfaCode).toBeFalsy()

        const postRes = await app.request(
          routeConfig.IdentityRoute.AuthorizeEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code,
              locale: 'en',
              mfaCode: 'abc',
            }),
          },
          mock(db),
        )
        expect(postRes.status).toBe(401)

        process.env.ALLOW_EMAIL_MFA_AS_BACKUP = true as unknown as string
      },
    )

    test(
      'could use as otp mfa fallback',
      async () => {
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        const params = await prepareFollowUpParams(db)

        await app.request(
          `${routeConfig.IdentityRoute.AuthorizeEmailMfa}${params}`,
          {},
          mock(db),
        )
        const code = getCodeFromParams(params)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${code}`)
        expect(mfaCode?.length).toBe(6)
        expect(mockFetch).toBeCalledTimes(1)

        global.fetch = fetchMock

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code,
              locale: 'en',
              mfaCode: await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${code}`),
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
      'could use as sms mfa fallback',
      async () => {
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )
        await db.prepare('update "user" set "smsPhoneNumber" = ?, "smsPhoneNumberVerified" = ?').run(
          '+16471231234',
          1,
        )
        await enrollSmsMfa(db)
        const params = await prepareFollowUpParams(db)

        await app.request(
          `${routeConfig.IdentityRoute.AuthorizeEmailMfa}${params}`,
          {},
          mock(db),
        )
        const code = getCodeFromParams(params)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${code}`)
        expect(mfaCode?.length).toBe(6)
        expect(mockFetch).toBeCalledTimes(1)

        global.fetch = fetchMock

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code,
              locale: 'en',
              mfaCode: await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${code}`),
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
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${json.code}`)).toBe('1')
      },
    )

    test(
      'should throw error if auth code is wrong',
      async () => {
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)
        const params = await prepareFollowUpParams(db)

        await app.request(
          `${routeConfig.IdentityRoute.AuthorizeEmailMfa}${params}`,
          {},
          mock(db),
        )
        const code = getCodeFromParams(params)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${code}`)
        expect(mfaCode?.length).toBe(6)
        expect(mockFetch).toBeCalledTimes(1)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send')
        expect(body).toContain(mfaCode)

        global.fetch = fetchMock

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: 'abc',
              locale: 'en',
              mfaCode: await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${code}`),
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.WrongAuthCode)
      },
    )

    test(
      'pass through if failed send email',
      async () => {
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: false })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)
        const params = await prepareFollowUpParams(db)

        await app.request(
          `${routeConfig.IdentityRoute.AuthorizeEmailMfa}${params}`,
          {},
          mock(db),
        )
        const code = getCodeFromParams(params)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${code}`)
        expect(mfaCode?.length).toBeFalsy()
        global.fetch = fetchMock
      },
    )

    test(
      'should throw error for wrong code',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)
        const params = await prepareFollowUpParams(db)

        await app.request(
          `${routeConfig.IdentityRoute.AuthorizeEmailMfa}${params}`,
          {},
          mock(db),
        )
        const code = getCodeFromParams(params)

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code,
              locale: 'en',
              mfaCode: 'abcdefgh',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(401)
        expect(await res.text()).toBe(localeConfig.Error.WrongMfaCode)
      },
    )

    test(
      'should could use resend code',
      async () => {
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)
        const body = await prepareFollowUpBody(db)

        await app.request(
          routeConfig.IdentityRoute.ResendEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: body.code,
              locale: 'en',
            }),
          },
          mock(db),
        )

        const code = body.code
        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${body.code}`)
        expect(mfaCode?.length).toBe(6)

        expect(mockFetch).toBeCalledTimes(1)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const emailBody = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send')
        expect(emailBody).toContain(mfaCode)
        global.fetch = fetchMock

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code,
              locale: 'en',
              mfaCode: await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${code}`),
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
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${json.code}`)).toBe('1')
      },
    )
  },
)
