import { Database } from 'better-sqlite3'
import { expect } from 'vitest'
import { mock } from 'tests/mock'
import { routeConfig } from 'configs'
import { oauthDto } from 'dtos'
import app from 'index'
import {
  appModel, scopeModel,
} from 'models'

export const dbTime = expect.stringMatching(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)

export const superAdminRole = {
  id: 1,
  name: 'super_admin',
  note: 'Grants a user full access to the admin panel',
  createdAt: dbTime,
  updatedAt: dbTime,
  deletedAt: null,
}

export const adminSpaApp = {
  id: 1,
  clientId: expect.any(String),
  secret: expect.any(String),
  type: 'spa',
  isActive: true,
  name: 'Admin Panel (SPA)',
  redirectUris: [
    'http://localhost:3000/en/dashboard',
    'http://localhost:3000/fr/dashboard',
  ],
  createdAt: dbTime,
  updatedAt: dbTime,
  deletedAt: null,
}

export const adminS2sApp = {
  id: 2,
  clientId: expect.any(String),
  secret: expect.any(String),
  type: 's2s',
  isActive: true,
  name: 'Admin Panel (S2S)',
  redirectUris: [],
  createdAt: dbTime,
  updatedAt: dbTime,
  deletedAt: null,
}

export const attachIndividualScopes = async (db: Database) => {
  const scopes = await db.prepare('select * from scope where type = ? AND name != ?').all(
    's2s',
    'root',
  ) as scopeModel.Record[]
  for (const scope of scopes) {
    await db.prepare('insert into app_scope ("appId", "scopeId") values (2, ?)').run(scope.id)
  }
}

export const enrollOtpMfa = async (db: Database) => {
  await db.prepare('update "user" set "mfaTypes" = ? where id = 1').run('otp')
}

export const enrollEmailMfa = async (db: Database) => {
  await db.prepare('update "user" set "mfaTypes" = ? where id = 1').run('email')
}

export const disableUser = async (db: Database) => {
  await db.prepare('update "user" set "isActive" = 0').run()
}

export const getS2sToken = async (
  db: Database, scope: string = 'root',
) => {
  const appRecord = await db.prepare('SELECT * FROM app where id = 2').get() as appModel.Record
  const basicAuth = btoa(`${appRecord.clientId}:${appRecord.secret}`)
  const res = await app.request(
    routeConfig.OauthRoute.Token,
    {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: oauthDto.TokenGrantType.ClientCredentials,
        scope,
      }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
    },
    mock(db),
  )
  const json = await res.json() as { access_token: string }
  return json.access_token
}
