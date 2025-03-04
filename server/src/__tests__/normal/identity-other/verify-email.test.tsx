import { Database } from 'better-sqlite3'
import {
  afterEach, beforeEach, describe, expect, Mock, test,
  vi,
} from 'vitest'
import {
  adapterConfig,
  localeConfig,
  routeConfig,
} from 'configs'
import app from 'index'
import { userModel } from 'models'
import {
  getApp,
  postAuthorizeBody,
} from 'tests/identity'
import {
  fetchMock,
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import { disableUser } from 'tests/util'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

const prepareUserAccount = async (db: Database) => {
  const appRecord = await getApp(db)
  const body = {
    ...(await postAuthorizeBody(appRecord)),
    email: 'test@email.com',
    password: 'Password1!',
  }

  const res = await app.request(
    routeConfig.IdentityRoute.AuthorizeAccount,
    {
      method: 'POST', body: JSON.stringify(body),
    },
    mock(db),
  )
  expect(res.status).toBe(200)
}

const sendCorrectVerifyEmailReq = async ({ code }: {
  code?: string;
} = {}) => {
  const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
  const correctCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailVerificationCode}-1`)
  const finalCode = code ?? correctCode

  const res = await app.request(
    routeConfig.IdentityRoute.VerifyEmail,
    {
      method: 'POST',
      body: JSON.stringify({
        id: currentUser.authId,
        code: finalCode,
      }),
    },
    mock(db),
  )

  return {
    res, correctCode: correctCode ?? '',
  }
}

describe(
  'post /authorize-account',
  () => {
    test(
      'should send verification email after sign up',
      async () => {
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await prepareUserAccount(db)
        const code = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailVerificationCode}-1`)

        expect(mockFetch).toBeCalledTimes(1)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send')
        expect(body).toContain(code)

        global.fetch = fetchMock
      },
    )
  },
)

describe(
  'get /verify-email-view',
  () => {
    test(
      'should show verify email page',
      async () => {
        await prepareUserAccount(db)
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        expect(currentUser.emailVerified).toBe(0)
        expect((await mockedKV.get(`${adapterConfig.BaseKVKey.EmailVerificationCode}-1`) ?? '').length).toBe(6)

        const res = await app.request(
          `${routeConfig.IdentityRoute.VerifyEmailView}?id=${currentUser.authId}&locale=en`,
          {},
          mock(db),
        )

        const html = await res.text()

        expect(html).toContain(`locales: "${(process.env.SUPPORTED_LOCALES as unknown as string[]).join(',')}"`)
        expect(html).toContain(`logoUrl: "${process.env.COMPANY_LOGO_URL}"`)
        expect(html).toContain(`enableLocaleSelector: ${process.env.ENABLE_LOCALE_SELECTOR}`)
        expect(html).toContain(`<link rel="icon" type="image/x-icon" href="${process.env.COMPANY_LOGO_URL}"/>`)
        expect(html).toContain(`<link href="${process.env.FONT_URL?.replace(
          '&',
          '&amp;',
        )}" rel="stylesheet"/>`)
        expect(html).toContain(`--layout-color:${process.env.LAYOUT_COLOR}`)
        expect(html).toContain(`--label-color:${process.env.LABEL_COLOR}`)
        expect(html).toContain(`--font-default:${process.env.FONT_FAMILY}`)
        expect(html).toContain(`--primary-button-color:${process.env.PRIMARY_BUTTON_COLOR}`)
        expect(html).toContain(`--primary-button-label-color:${process.env.PRIMARY_BUTTON_LABEL_COLOR}`)
        expect(html).toContain(`--primary-button-border-color:${process.env.PRIMARY_BUTTON_BORDER_COLOR}`)
        expect(html).toContain(`--secondary-button-color:${process.env.SECONDARY_BUTTON_COLOR}`)
        expect(html).toContain(`--secondary-button-label-color:${process.env.SECONDARY_BUTTON_LABEL_COLOR}`)
        expect(html).toContain(`--secondary-button-border-color:${process.env.SECONDARY_BUTTON_BORDER_COLOR}`)
        expect(html).toContain(`--critical-indicator-color:${process.env.CRITICAL_INDICATOR_COLOR}`)
      },
    )

    test(
      'should be blocked if not enable in config',
      async () => {
        global.process.env.ENABLE_EMAIL_VERIFICATION = false as unknown as string
        await prepareUserAccount(db)

        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        expect(currentUser.emailVerified).toBe(0)
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.EmailVerificationCode}-1`)).toBeFalsy()

        const res = await app.request(
          `${routeConfig.IdentityRoute.VerifyEmailView}?id=${currentUser.authId}&locale=en`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        global.process.env.ENABLE_EMAIL_VERIFICATION = true as unknown as string
      },
    )

    test(
      'should fail when no enough params provided',
      async () => {
        await prepareUserAccount(db)

        const res = await app.request(
          routeConfig.IdentityRoute.VerifyEmailView,
          {},
          mock(db),
        )

        expect(res.status).toBe(400)
      },
    )
  },
)

describe(
  'post /verify-email',
  () => {
    test(
      'should verify email',
      async () => {
        await prepareUserAccount(db)
        const { res } = await sendCorrectVerifyEmailReq()
        expect(await res.json()).toStrictEqual({ success: true })

        const updatedUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        expect(updatedUser.emailVerified).toBe(1)
      },
    )

    test(
      'should be blocked if feature not enabled',
      async () => {
        global.process.env.ENABLE_EMAIL_VERIFICATION = false as unknown as string
        await prepareUserAccount(db)

        const { res } = await sendCorrectVerifyEmailReq()
        expect(res.status).toBe(400)
        global.process.env.ENABLE_EMAIL_VERIFICATION = true as unknown as string
      },
    )

    test(
      'should not verify if wrong code provided',
      async () => {
        await prepareUserAccount(db)

        const { res } = await sendCorrectVerifyEmailReq({ code: 'abcdef' })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.WrongCode)
      },
    )

    test(
      'should not verify if user already verified',
      async () => {
        await prepareUserAccount(db)

        const {
          res, correctCode,
        } = await sendCorrectVerifyEmailReq()
        expect(res.status).toBe(200)
        const { res: res1 } = await sendCorrectVerifyEmailReq({ code: correctCode })
        expect(res1.status).toBe(400)
        expect(await res1.text()).toBe(localeConfig.Error.WrongCode)
      },
    )

    test(
      'should not verify if user is disabled',
      async () => {
        await prepareUserAccount(db)

        await disableUser(db)

        const { res } = await sendCorrectVerifyEmailReq()
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.UserDisabled)
      },
    )
  },
)
