import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { Scope } from 'shared'
import app from 'index'
import { routeConfig } from 'configs'
import {
  migrate, mock,
} from 'tests/mock'
import {
  attachIndividualScopes,
  dbTime, getS2sToken,
} from 'tests/util'
import { orgModel } from 'models'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
})

const BaseRoute = routeConfig.InternalRoute.ApiOrgs

const createNewOrg = async (
  token?: string, values?: { name?: string; slug?: string },
) => await app.request(
  BaseRoute,
  {
    method: 'POST',
    body: JSON.stringify({
      name: values?.name ?? 'test name', slug: values?.slug ?? 'test slug',
    }),
    headers: token === '' ? undefined : { Authorization: `Bearer ${token ?? await getS2sToken(db)}` },
  },
  mock(db),
)

const newOrg = {
  id: 1,
  name: 'test name',
  slug: 'test slug',
  companyLogoUrl: '',
  fontFamily: '',
  fontUrl: '',
  layoutColor: '',
  labelColor: '',
  primaryButtonColor: '',
  primaryButtonLabelColor: '',
  primaryButtonBorderColor: '',
  secondaryButtonColor: '',
  secondaryButtonLabelColor: '',
  secondaryButtonBorderColor: '',
  criticalIndicatorColor: '',
  emailSenderName: '',
  termsLink: '',
  privacyPolicyLink: '',
  createdAt: dbTime,
  updatedAt: dbTime,
  deletedAt: null,
}

describe(
  'get all',
  () => {
    test(
      'should return all orgs',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await createNewOrg()
        const res = await app.request(
          BaseRoute,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { orgs: orgModel.Record[] }

        expect(json.orgs.length).toBe(1)
        expect(json).toStrictEqual({ orgs: [newOrg] })

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should return all org with read_org scope',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await attachIndividualScopes(db)
        await createNewOrg()
        const res = await app.request(
          BaseRoute,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadOrg,
              )}`,
            },
          },
          mock(db),
        )
        const json = await res.json() as { orgs: orgModel.Record[] }

        expect(json.orgs.length).toBe(1)
        expect(json).toStrictEqual({ orgs: [newOrg] })

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should return 401 if org not enabled in config',
      async () => {
        await attachIndividualScopes(db)
        const res = await app.request(
          BaseRoute,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadOrg,
              )}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await attachIndividualScopes(db)
        const res = await app.request(
          BaseRoute,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.WriteOrg,
              )}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(401)

        const res1 = await app.request(
          BaseRoute,
          {},
          mock(db),
        )
        expect(res1.status).toBe(401)

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )
  },
)

describe(
  'get by id',
  () => {
    test(
      'should return org by id',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await createNewOrg()
        const res = await app.request(
          `${BaseRoute}/1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({ org: newOrg })

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should return 404 when can not find org by id',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await createNewOrg()
        const res = await app.request(
          `${BaseRoute}/2`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )

        expect(res.status).toBe(404)

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )
  },
)

describe(
  'create',
  () => {
    test(
      'should create org',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        const res = await createNewOrg()
        const json = await res.json()

        expect(json).toStrictEqual({ org: newOrg })

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should trigger unique constraint on name',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await createNewOrg()
        const res1 = await createNewOrg(
          undefined,
          { slug: 'another slug' },
        )
        expect(res1.status).toBe(500)

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should trigger unique constraint on slug',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await createNewOrg()
        const res1 = await createNewOrg(
          undefined,
          { name: 'another name' },
        )
        expect(res1.status).toBe(500)

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should create org with write_org scope',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await attachIndividualScopes(db)
        const res = await createNewOrg(await getS2sToken(
          db,
          Scope.WriteOrg,
        ))
        const json = await res.json()

        expect(json).toStrictEqual({ org: newOrg })

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        const res = await createNewOrg(await getS2sToken(
          db,
          Scope.ReadOrg,
        ))
        expect(res.status).toBe(401)

        const res1 = await createNewOrg('')
        expect(res1.status).toBe(401)

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )
  },
)

describe(
  'update',
  () => {
    test(
      'should update org',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await createNewOrg()
        const updateObj = {
          name: 'test name 1', slug: 'test slug 1',
        }
        const res = await app.request(
          `${BaseRoute}/1`,
          {
            method: 'PUT',
            body: JSON.stringify(updateObj),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          org: {
            ...newOrg,
            ...updateObj,
          },
        })

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )
  },
)

describe(
  'delete',
  () => {
    test(
      'should delete org',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await createNewOrg()
        const res = await app.request(
          `${BaseRoute}/1`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(204)

        const checkRes = await app.request(
          `${BaseRoute}/1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        expect(checkRes.status).toBe(404)

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )
  },
)
