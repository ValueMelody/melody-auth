import { Database } from 'better-sqlite3'
import { genCodeChallenge } from '@melody-auth/shared'
import app from 'index'
import { mock } from 'tests/mock'
import { appModel } from 'models'
import { routeConfig } from 'configs'

export const getCodeFromParams = (params: string) => {
  const codeParam = params.substring(1).split('&')
    .find((s) => s.includes('code='))
  const code = codeParam?.split('=')[1]
  return code
}

export const insertUsers = (
  db: Database, withConsent = true,
) => {
  db.exec(`
    INSERT INTO "user"
    ("authId", locale, email, "socialAccountId", "socialAccountType", password, "firstName", "lastName")
    values ('1-1-1-1', 'en', 'test@email.com', null, null, '$2a$10$3HtEAf8YcN94V4GOR6ZBNu9tmoIflmEOqb9hUf0iqS4OjYVKe.9/C', null, null)
  `)
  if (withConsent) {
    db.exec(`
      INSERT INTO user_app_consent
      ("userId", "appId")
      values (1, 1)
    `)
  }
}

export const getApp = async (db: Database) => {
  const appRecord = await db.prepare('SELECT * FROM app where id = 1').get() as appModel.Record
  return appRecord
}

export const getAuthorizeParams = async (appRecord: appModel.Record) => {
  const codeChallenge = await genCodeChallenge('abc')
  let params = ''
  params += `?client_id=${appRecord.clientId}&redirect_uri=http://localhost:3000/en/dashboard`
  params += '&response_type=code&state=123&locale=en'
  params += '&scope=openid%20profile%20offline_access'
  params += `&code_challenge_method=S256&code_challenge=${codeChallenge}`
  return params
}

export const getSignInRequest = async (
  db: Database, url: string, appRecord: appModel.Record, additionalParams?: string,
) => {
  const params = await getAuthorizeParams(appRecord)

  const res = await app.request(
    `${url}${params}${additionalParams ?? ''}`,
    {},
    mock(db),
  )
  return res
}

export const postAuthorizeBody = async (appRecord: appModel.Record) => ({
  clientId: appRecord.clientId,
  redirectUri: 'http://localhost:3000/en/dashboard',
  responseType: 'code',
  state: '123',
  codeChallengeMethod: 'S256',
  codeChallenge: await genCodeChallenge('abc'),
  scope: 'profile openid offline_access',
  locale: 'en',
})

export const postSignInRequest = async (
  db: Database,
  appRecord: appModel.Record,
  option?: {
    email?: string;
    password?: string;
    scopes?: string;
    policy?: string;
  },
) => {
  const body = {
    ...(await postAuthorizeBody(appRecord)),
    email: option?.email ?? 'test@email.com',
    password: option?.password ?? 'Password1!',
    scope: option?.scopes ?? 'profile openid offline_access',
    policy: option?.policy,
  }

  const res = await app.request(
    routeConfig.IdentityRoute.AuthorizePassword,
    {
      method: 'POST', body: JSON.stringify(body),
    },
    mock(db),
  )
  return res
}

export const prepareFollowUpParams = async (db: Database) => {
  const appRecord = await getApp(db)
  const res = await postSignInRequest(
    db,
    appRecord,
  )
  const json = await res.json() as { code: string }
  return `?locale=en&code=${json.code}`
}

export const prepareFollowUpBody = async (db: Database) => {
  const appRecord = await getApp(db)
  const res = await postSignInRequest(
    db,
    appRecord,
  )
  const json = await res.json() as { code: string }
  return {
    code: json.code,
    locale: 'en',
  }
}
