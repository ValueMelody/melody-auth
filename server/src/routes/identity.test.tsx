import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { JSDOM } from 'jsdom'
import { genCodeChallenge } from 'shared'
import app from 'index'
import {
  kv,
  migrate, mock,
} from 'tests/mock'
import { routeConfig } from 'configs'
import { appModel } from 'models'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(() => {
  db.close()
})

const BaseRoute = routeConfig.InternalRoute.Identity

const insertUsers = (db: Database) => {
  db.exec(`
    INSERT INTO user
    (authId, locale, email, googleId, password, firstName, lastName)
    values ('1-1-1-1', 'en', 'test@email.com', null, '$2a$10$3HtEAf8YcN94V4GOR6ZBNu9tmoIflmEOqb9hUf0iqS4OjYVKe.9/C', null, null)
  `)
  db.exec(`
    INSERT INTO user_app_consent
    (userId, appId)
    values (1, 1)
  `)
}

export const getApp = (db: Database) => {
  const appRecord = db.prepare('SELECT * FROM app where id = 1').get() as appModel.Record
  return appRecord
}

export const getSignInParams = (appRecord: appModel.Record) => {
  let params = ''
  params += `?client_id=${appRecord.clientId}&redirect_uri=http://localhost:3000/en/dashboard`
  params += '&response_type=code&state=123&locale=en'
  params += '&scope=openid%20profile%20offline_access'
  params += '&code_challenge_method=S256&code_challenge=abc'
  return params
}

export const getSignInRequest = async (
  db: Database, url: string, appRecord: appModel.Record,
) => {
  const params = getSignInParams(appRecord)

  const res = await app.request(
    `${url}${params}`,
    {},
    mock(db),
  )
  return res
}

export const postSignInRequest = async (
  db: Database, appRecord: appModel.Record,
) => {
  insertUsers(db)

  const url = `${BaseRoute}/authorize-password`
  const body = {
    clientId: appRecord.clientId,
    redirectUri: 'http://localhost:3000/en/dashboard',
    responseType: 'code',
    state: '123',
    codeChallengeMethod: 'S256',
    codeChallenge: await genCodeChallenge('abc'),
    scope: 'profile openid offline_access',
    locale: 'en',
    email: 'test@email.com',
    password: 'Password1!',
  }

  const res = await app.request(
    `${url}`,
    {
      method: 'POST', body: JSON.stringify(body),
    },
    mock(db),
  )
  return res
}

describe(
  'get /authorize-password',
  () => {
    test(
      'should show sign in page',
      async () => {
        const appRecord = getApp(db)
        const res = await getSignInRequest(
          db,
          `${BaseRoute}/authorize-password`,
          appRecord,
        )
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByName('email').length).toBe(1)
        expect(document.getElementsByName('password').length).toBe(1)
        expect(document.getElementsByTagName('form').length).toBe(1)
      },
    )
  },
)

describe(
  'post /authorize-password',
  () => {
    test(
      'should get auth code after sign in',
      async () => {
        const appRecord = getApp(db)
        const res = await postSignInRequest(
          db,
          appRecord,
        )
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          requireConsent: false,
          requireMfaEnroll: true,
          requireEmailMfa: false,
          requireOtpSetup: false,
          requireOtpMfa: false,
        })
        const { code } = json as { code: string }
        const codeStore = JSON.parse(kv[`AC-${code}`])
        expect(codeStore.appId).toBe(1)
        expect(codeStore.user.authId).toBe('1-1-1-1')
        expect(codeStore.appName).toBe(appRecord.name)
        expect(codeStore.request.clientId).toBe(appRecord.clientId)
      },
    )
  },
)
