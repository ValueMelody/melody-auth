import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { Role } from 'shared'
import app from 'index'
import {
  adapterConfig, routeConfig,
} from 'configs'
import {
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  dbTime, getS2sToken, superAdminRole,
} from 'tests/util'
import {
  appModel, roleModel,
} from 'models'
import {
  cryptoUtil, timeUtil,
} from 'utils'
import { jwtService } from 'services'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
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
      'should use deprecated key',
      async () => {
        await createNewRole()
        const appRecord = await db.prepare('SELECT * FROM app where id = 2').get() as appModel.Record
        const payload = {
          sub: appRecord.clientId,
          azp: appRecord.clientId,
          scope: 'root',
          iat: timeUtil.getCurrentTimestamp(),
          exp: timeUtil.getCurrentTimestamp() + 100,
        }

        const privateKey = await mockedKV.get(adapterConfig.BaseKVKey.DeprecatedJwtPrivateSecret)
        const publicKey = await mockedKV.get(adapterConfig.BaseKVKey.DeprecatedJwtPublicSecret)
        const jwk = await cryptoUtil.secretToJwk(publicKey ?? '')

        const key = await crypto.subtle.importKey(
          'pkcs8',
          jwtService.pemToBinary(privateKey ?? ''),
          {
            name: 'RSASSA-PKCS1-v1_5',
            hash: { name: 'SHA-256' },
          },
          false,
          ['sign'],
        )

        const header = {
          alg: 'RS256',
          typ: 'JWT',
          kid: jwk.kid,
        }

        const encodedHeader = jwtService.base64UrlEncode(JSON.stringify(header))
        const encodedPayload = jwtService.base64UrlEncode(JSON.stringify(payload))
        const signingInput = `${encodedHeader}.${encodedPayload}`

        const encoder = new TextEncoder()
        const signingInputBytes = encoder.encode(signingInput)

        const signature = await crypto.subtle.sign(
          {
            name: 'RSASSA-PKCS1-v1_5',
            hash: 'SHA-256',
          },
          key,
          signingInputBytes,
        )

        const signatureArray = new Uint8Array(signature)
        const signatureBase64Url = jwtService.base64UrlEncode(String.fromCharCode(...signatureArray))

        const accessToken = `${signingInput}.${signatureBase64Url}`

        const res = await app.request(
          BaseRoute,
          { headers: { Authorization: `Bearer ${accessToken}` } },
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
