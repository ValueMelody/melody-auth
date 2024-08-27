import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import {
  Role, Scope,
} from 'shared'
import app from 'index'
import { routeConfig } from 'configs'
import {
  migrate, mock,
} from 'tests/mock'
import {
  attachIndividualScopes,
  dbTime, getS2sToken, superAdminRole,
} from 'tests/util'
import { roleModel } from 'models'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(() => {
  db.close()
})

const BaseRoute = routeConfig.InternalRoute.ApiRoles

const createNewRole = async (token?: string) => await app.request(
  BaseRoute,
  {
    method: 'POST',
    body: JSON.stringify({
      name: 'test name',
      note: 'test note',
    }),
    headers: token === '' ? undefined : { Authorization: `Bearer ${token ?? await getS2sToken(db)}` },
  },
  mock(db),
)

const newRole = {
  id: 2,
  name: 'test name',
  note: 'test note',
  createdAt: dbTime,
  updatedAt: dbTime,
  deletedAt: null,
}

describe(
  'get all',
  () => {
    test(
      'should return all roles',
      async () => {
        await createNewRole()
        const res = await app.request(
          BaseRoute,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { roles: roleModel.Record[] }

        expect(json.roles.length).toBe(2)
        expect(json).toStrictEqual({ roles: [superAdminRole, newRole] })
        Object.values(Role).forEach((key) => {
          expect(json.roles.some((role) => role.name === key)).toBeTruthy()
        })
      },
    )

    test(
      'should return all roles with read_role scope',
      async () => {
        attachIndividualScopes(db)
        await createNewRole()
        const res = await app.request(
          BaseRoute,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadRole,
              )}`,
            },
          },
          mock(db),
        )
        const json = await res.json() as { roles: roleModel.Record[] }

        expect(json.roles.length).toBe(2)
        expect(json).toStrictEqual({ roles: [superAdminRole, newRole] })
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        const res = await app.request(
          BaseRoute,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.WriteRole,
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
      },
    )
  },
)

describe(
  'get by id',
  () => {
    test(
      'should return role by id',
      async () => {
        const res = await app.request(
          `${BaseRoute}/1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({ role: superAdminRole })
      },
    )

    test(
      'should return 404 when can not find role by id',
      async () => {
        const res = await app.request(
          `${BaseRoute}/2`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )

        expect(res.status).toBe(404)
      },
    )
  },
)

describe(
  'create',
  () => {
    test(
      'should create role',
      async () => {
        const res = await createNewRole()
        const json = await res.json()

        expect(json).toStrictEqual({ role: newRole })
      },
    )

    test(
      'should create role with write_role scope',
      async () => {
        attachIndividualScopes(db)
        const res = await createNewRole(await getS2sToken(
          db,
          Scope.WriteRole,
        ))
        const json = await res.json()

        expect(json).toStrictEqual({ role: newRole })
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        const res = await createNewRole(Scope.ReadRole)
        expect(res.status).toBe(401)

        const res1 = await createNewRole('')
        expect(res1.status).toBe(401)
      },
    )
  },
)

describe(
  'update',
  () => {
    test(
      'should update role',
      async () => {
        await createNewRole()
        const updateObj = {
          name: 'test name 1',
          note: '',
        }
        const res = await app.request(
          `${BaseRoute}/2`,
          {
            method: 'PUT',
            body: JSON.stringify(updateObj),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          role: {
            ...newRole,
            ...updateObj,
          },
        })
      },
    )
  },
)

describe(
  'delete',
  () => {
    test(
      'should delete role',
      async () => {
        await createNewRole()
        const res = await app.request(
          `${BaseRoute}/2`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(204)

        const checkRes = await app.request(
          `${BaseRoute}/2`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        expect(checkRes.status).toBe(404)
      },
    )
  },
)
