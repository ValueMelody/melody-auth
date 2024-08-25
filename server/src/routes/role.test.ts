import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import app from 'index'
import { routeConfig } from 'configs'
import {
  migrate, mock,
} from 'tests/mock'
import {
  dbTime, superAdminRole,
} from 'tests/seed'
import { Role } from 'shared'
import { roleModel } from 'models'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(() => {
  db.close()
})

const BaseRoute = routeConfig.InternalRoute.ApiRoles

const createNewRole = async () => await app.request(
  BaseRoute,
  {
    method: 'POST',
    body: JSON.stringify({
      name: 'test name',
      note: 'test note',
    }),
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
          {},
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
          {},
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
          {},
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
            method: 'PUT', body: JSON.stringify(updateObj),
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
          { method: 'DELETE' },
          mock(db),
        )
        expect(res.status).toBe(204)
      },
    )
  },
)
