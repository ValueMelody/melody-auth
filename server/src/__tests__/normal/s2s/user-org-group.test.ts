import { Database } from 'better-sqlite3'
import { Scope } from '@melody-auth/shared'
import {
  afterEach, beforeEach, describe, expect, Mock, test,
  vi,
} from 'vitest'
import { decode } from 'hono/jwt'
import { exchangeWithAuthToken } from '../oauth.test'
import {
  adapterConfig, localeConfig, messageConfig, routeConfig,
} from 'configs'
import app from 'index'
import {
  emailLogRecord,
  emailResponseMock,
  fetchMock,
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  attachIndividualScopes,
  dbTime, disableUser, enrollEmailMfa, enrollOtpMfa,
  enrollSmsMfa,
  getS2sToken,
} from 'tests/util'
import { oauthDto } from 'dtos'
import { insertUsers } from './user.test'
import { userOrgGroupModel } from 'models'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await mockedKV.empty()
  await db.close()
})

const BaseRoute = routeConfig.InternalRoute.ApiUsers

const insertOrgGroups = async (db: Database) => {
  await db.exec(`
    INSERT INTO org (name)
    values ('org 1')
  `)
  await db.exec(`
    INSERT INTO org_group (name, orgId)
    values ('org group 1', 1)
  `)
  await db.exec(`
    INSERT INTO org_group (name, orgId)
    values ('org group 2', 1)
  `)
}

describe(
  'get user app consents',
  () => {
    test(
      'should return user app consents',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        await insertUsers(db)
        await insertOrgGroups(db)

        await db.exec(`
          INSERT INTO user_org_group (userId, orgGroupId)
          values (1, 1)
        `)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/org-groups`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { orgGroups: userOrgGroupModel.UserOrgGroup[] }
        expect(json.orgGroups).toStrictEqual([{
          orgGroupId: 1,
          orgGroupName: 'org group 1',
        }])

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should return empty array if user has no org groups',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        await insertUsers(db)
        await insertOrgGroups(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/org-groups`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { orgGroups: userOrgGroupModel.UserOrgGroup[] }
        expect(json.orgGroups).toStrictEqual([])

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'could read with read user and read org scope',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        await insertUsers(db)
        await insertOrgGroups(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/org-groups`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db, 'read_user read_org')}` } },
          mock(db),
        )
        const json = await res.json() as { orgGroups: userOrgGroupModel.UserOrgGroup[] }
        expect(json.orgGroups).toStrictEqual([])

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should throw error if user not found',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        await insertUsers(db)
        await insertOrgGroups(db)

        const res = await app.request(
          `${BaseRoute}/1-1-2-1/org-groups`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.NoUser)

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should throw error if feature flag is disabled',
      async () => {
        await insertUsers(db)
        await insertOrgGroups(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-2/org-groups`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.OrgGroupNotEnabled)
      },
    )
  },
)
