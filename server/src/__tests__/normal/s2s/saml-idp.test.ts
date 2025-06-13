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
import {
  attachIndividualScopes,
  dbTime, getS2sToken,
} from 'tests/util'
import { samlIdpModel } from 'models'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
})

const BaseRoute = routeConfig.InternalRoute.ApiSamlIdps

const createNewIdp = async (
  token?: string, values?: {
    name?: string;
    userIdAttribute?: string;
    emailAttribute?: string;
    firstNameAttribute?: string;
    lastNameAttribute?: string;
    metadata?: string;
  },
) => await app.request(
  BaseRoute,
  {
    method: 'POST',
    body: JSON.stringify({
      name: values?.name ?? 'test name',
      userIdAttribute: values?.userIdAttribute ?? 'test userIdAttribute',
      emailAttribute: values?.emailAttribute ?? 'test emailAttribute',
      firstNameAttribute: values?.firstNameAttribute ?? 'test firstNameAttribute',
      lastNameAttribute: values?.lastNameAttribute ?? 'test lastNameAttribute',
      metadata: values?.metadata ?? 'test metadata',
    }),
    headers: token === '' ? undefined : { Authorization: `Bearer ${token ?? await getS2sToken(db)}` },
  },
  mock(db),
)

const newIdp = {
  id: 1,
  isActive: true,
  name: 'test name',
  userIdAttribute: 'test userIdAttribute',
  emailAttribute: 'test emailAttribute',
  firstNameAttribute: 'test firstNameAttribute',
  lastNameAttribute: 'test lastNameAttribute',
  metadata: 'test metadata',
  createdAt: dbTime,
  updatedAt: dbTime,
  deletedAt: null,
}

describe(
  'get all',
  () => {
    test(
      'should return all idps',
      async () => {
        global.process.env.ENABLE_SAML_SSO_AS_SP = true as unknown as string

        await createNewIdp()
        const res = await app.request(
          BaseRoute,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { idps: samlIdpModel.Record[] }

        expect(json.idps.length).toBe(1)
        expect(json).toStrictEqual({ idps: [newIdp] })

        global.process.env.ENABLE_SAML_SSO_AS_SP = false as unknown as string
      },
    )

    test(
      'should return 400 if saml not enabled in config',
      async () => {
        const res = await app.request(
          BaseRoute,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        global.process.env.ENABLE_SAML_SSO_AS_SP = true as unknown as string

        await attachIndividualScopes(db)
        const res = await app.request(
          BaseRoute,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadUser,
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

        global.process.env.ENABLE_SAML_SSO_AS_SP = false as unknown as string
      },
    )
  },
)

describe(
  'get by id',
  () => {
    test(
      'should return idp by id',
      async () => {
        global.process.env.ENABLE_SAML_SSO_AS_SP = true as unknown as string

        await createNewIdp()
        const res = await app.request(
          `${BaseRoute}/1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({ idp: newIdp })

        global.process.env.ENABLE_SAML_SSO_AS_SP = false as unknown as string
      },
    )

    test(
      'should return 404 when can not find idp by id',
      async () => {
        global.process.env.ENABLE_SAML_SSO_AS_SP = true as unknown as string

        await createNewIdp()
        const res = await app.request(
          `${BaseRoute}/2`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )

        expect(res.status).toBe(404)

        global.process.env.ENABLE_SAML_SSO_AS_SP = false as unknown as string
      },
    )
  },
)

describe(
  'create',
  () => {
    test(
      'should create idp',
      async () => {
        global.process.env.ENABLE_SAML_SSO_AS_SP = true as unknown as string

        const res = await createNewIdp()
        const json = await res.json()

        expect(json).toStrictEqual({ idp: newIdp })

        global.process.env.ENABLE_SAML_SSO_AS_SP = false as unknown as string
      },
    )

    test(
      'should create idp with nullable values',
      async () => {
        global.process.env.ENABLE_SAML_SSO_AS_SP = true as unknown as string

        const res = await app.request(
          BaseRoute,
          {
            method: 'POST',
            body: JSON.stringify({
              name: 'test name',
              userIdAttribute: 'test userIdAttribute',
              emailAttribute: null,
              firstNameAttribute: null,
              lastNameAttribute: null,
              metadata: 'test metadata',
            }),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          idp: {
            ...newIdp,
            emailAttribute: null,
            firstNameAttribute: null,
            lastNameAttribute: null,
          },
        })

        global.process.env.ENABLE_SAML_SSO_AS_SP = false as unknown as string
      },
    )

    test(
      'should trigger unique constraint on name',
      async () => {
        global.process.env.ENABLE_SAML_SSO_AS_SP = true as unknown as string

        await createNewIdp()
        const res1 = await createNewIdp(
          undefined,
          { name: 'test name' },
        )
        expect(res1.status).toBe(500)

        global.process.env.ENABLE_SAML_SSO_AS_SP = false as unknown as string
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        global.process.env.ENABLE_SAML_SSO_AS_SP = true as unknown as string

        await attachIndividualScopes(db)
        const res = await createNewIdp(await getS2sToken(
          db,
          Scope.ReadUser,
        ))
        expect(res.status).toBe(401)

        const res1 = await createNewIdp('')
        expect(res1.status).toBe(401)

        global.process.env.ENABLE_SAML_SSO_AS_SP = false as unknown as string
      },
    )
  },
)

describe(
  'update',
  () => {
    test(
      'should update idp',
      async () => {
        global.process.env.ENABLE_SAML_SSO_AS_SP = true as unknown as string

        await createNewIdp()

        const updateObj = {
          userIdAttribute: 'test userIdAttribute 1',
          emailAttribute: 'test emailAttribute 1',
          firstNameAttribute: 'test firstNameAttribute 1',
          lastNameAttribute: 'test lastNameAttribute 1',
          metadata: 'test metadata 1',
          isActive: false,
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
          idp: {
            ...newIdp,
            ...updateObj,
          },
        })

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'could update idp with nullable values',
      async () => {
        global.process.env.ENABLE_SAML_SSO_AS_SP = true as unknown as string

        await createNewIdp()

        const res = await app.request(
          `${BaseRoute}/1`,
          {
            method: 'PUT',
            body: JSON.stringify({
              isActive: true,
              emailAttribute: null,
              firstNameAttribute: null,
              lastNameAttribute: null,
            }),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )

        const json = await res.json()

        expect(json).toStrictEqual({
          idp: {
            ...newIdp,
            isActive: true,
            emailAttribute: null,
            firstNameAttribute: null,
            lastNameAttribute: null,
          },
        })

        const res1 = await app.request(
          `${BaseRoute}/1`,
          {
            method: 'PUT',
            body: JSON.stringify({
              emailAttribute: 'test emailAttribute 1',
              firstNameAttribute: 'test firstNameAttribute 1',
              lastNameAttribute: 'test lastNameAttribute 1',
            }),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json1 = await res1.json()

        expect(json1).toStrictEqual({
          idp: {
            ...newIdp,
            emailAttribute: 'test emailAttribute 1',
            firstNameAttribute: 'test firstNameAttribute 1',
            lastNameAttribute: 'test lastNameAttribute 1',
          },
        })

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        global.process.env.ENABLE_SAML_SSO_AS_SP = true as unknown as string

        await createNewIdp()
        const res = await app.request(
          `${BaseRoute}/1`,
          {
            method: 'PUT',
            body: JSON.stringify({
              userIdAttribute: 'test userIdAttribute 1',
              emailAttribute: 'test emailAttribute 1',
              firstNameAttribute: 'test firstNameAttribute 1',
              lastNameAttribute: 'test lastNameAttribute 1',
              metadata: 'test metadata 1',
            }),
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadUser,
              )}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(401)

        global.process.env.ENABLE_SAML_SSO_AS_SP = false as unknown as string
      },
    )

    test(
      'should throw error if idp not found',
      async () => {
        global.process.env.ENABLE_SAML_SSO_AS_SP = true as unknown as string

        await createNewIdp()

        const res = await app.request(
          `${BaseRoute}/2`,
          {
            method: 'PUT',
            body: JSON.stringify({
              userIdAttribute: 'test userIdAttribute 1',
              emailAttribute: 'test emailAttribute 1',
              firstNameAttribute: 'test firstNameAttribute 1',
              lastNameAttribute: 'test lastNameAttribute 1',
              metadata: 'test metadata 1',
            }),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )

        expect(res.status).toBe(404)
        expect(await res.text()).toStrictEqual(messageConfig.RequestError.NoSamlIdp)

        global.process.env.ENABLE_SAML_SSO_AS_SP = false as unknown as string
      },
    )
  },
)

describe(
  'delete',
  () => {
    test(
      'should delete idp',
      async () => {
        global.process.env.ENABLE_SAML_SSO_AS_SP = true as unknown as string

        await createNewIdp()
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

        global.process.env.ENABLE_SAML_SSO_AS_SP = false as unknown as string
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        global.process.env.ENABLE_SAML_SSO_AS_SP = true as unknown as string

        await createNewIdp()
        await attachIndividualScopes(db)

        const res = await app.request(
          `${BaseRoute}/1`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadUser,
              )}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(401)

        global.process.env.ENABLE_SAML_SSO_AS_SP = false as unknown as string
      },
    )

    test(
      'should throw error if idp not found',
      async () => {
        global.process.env.ENABLE_SAML_SSO_AS_SP = true as unknown as string

        await createNewIdp()

        const res = await app.request(
          `${BaseRoute}/2`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toStrictEqual(messageConfig.RequestError.NoSamlIdp)

        global.process.env.ENABLE_SAML_SSO_AS_SP = false as unknown as string
      },
    )
  },
)
