import fs from 'fs'
import path from 'path'
import Sqlite, { Database } from 'better-sqlite3'
import {
  Mock, vi, expect,
} from 'vitest'
import { adapterConfig } from 'configs'
import {
  pgAdapter, redisAdapter,
} from 'adapters'
import {
  userModel, appModel,
} from 'models'
import { cryptoUtil } from 'utils'

const convertQuery = (
  query: string, params: string[],
) => {
  let prepareQuery = query
  for (let i = 0; i < params.length; i++) {
    prepareQuery = prepareQuery.replace(
      `$${i + 1}`,
      '?',
    )
  }
  return prepareQuery
}

export const kv: { [key: string]: string } = {}

export const sessionStore: { [key: string]: string } = {}
export const session = {
  get: (key: string) => sessionStore[key],
  set: (
    key: string, value: string,
  ) => {
    sessionStore[key] = value
  },
}

const kvMock = {
  get: async (key: string) => {
    switch (key) {
    case adapterConfig.BaseKVKey.JwtPublicSecret:
      return fs.readFileSync(
        path.resolve(adapterConfig.FileLocation.NodePublicKey),
        'utf8',
      )
    case adapterConfig.BaseKVKey.JwtPrivateSecret:
      return fs.readFileSync(
        path.resolve(adapterConfig.FileLocation.NodePrivateKey),
        'utf8',
      )
    case adapterConfig.BaseKVKey.DeprecatedJwtPublicSecret: {
      const location = path.resolve(adapterConfig.FileLocation.NodeDeprecatedPublicKey)
      return fs.existsSync(location)
        ? fs.readFileSync(
          location,
          'utf8',
        )
        : null
    }
    case adapterConfig.BaseKVKey.DeprecatedJwtPrivateSecret: {
      const location = path.resolve(adapterConfig.FileLocation.NodeDeprecatedPrivateKey)
      return fs.existsSync(location)
        ? fs.readFileSync(
          location,
          'utf8',
        )
        : null
    }
    case adapterConfig.BaseKVKey.SessionSecret:
      return 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    default:
      return kv[key] ?? null
    }
  },
  put: (
    key: string, value: string,
  ) => {
    kv[key] = value
  },
  delete: (key: string) => {
    delete kv[key]
  },
  list: ({ prefix }: { prefix: string}) => {
    const keys = Object.keys(kv)
    return {
      keys: keys.filter((key) => key.includes(prefix))
        .map((key) => ({
          name: key, value: kv[key],
        })),
    }
  },
  empty: () => {
    Object.keys(kv).forEach((key) => delete kv[key])
  },
}

const getDbMock = (db: Database) => ({
  prepare: (query: string) => {
    return {
      bind: (...params: string[]) => ({
        all: async () => {
          const prepareQuery = convertQuery(
            query,
            params,
          )
          const stmt = db.prepare(prepareQuery)
          return { results: stmt.all(...params) }
        },
        first: async () => {
          const prepareQuery = convertQuery(
            query,
            params,
          )
          const stmt = db.prepare(prepareQuery)
          return stmt.get(...params)
        },
        run: async () => {
          const prepareQuery = convertQuery(
            query,
            params,
          )
          const stmt = db.prepare(prepareQuery)
          const result = stmt.run(...params)
          return {
            success: true,
            meta: { last_row_id: result.lastInsertRowid },
          }
        },
      }),
      all: async () => {
        const stmt = db.prepare(query)
        return { results: stmt.all() }
      },
      first: async () => {
        const stmt = db.prepare(query)
        return stmt.get()
      },
    }
  },
}) as D1Database

const isTestingNode = process.env.TEST_MODE === 'node'
export const mockedKV = isTestingNode ? redisAdapter.fit() : kvMock
export const getMockedDB = isTestingNode ? pgAdapter.fit : getDbMock

const formatUser = (raw: userModel.Raw) => ({
  ...raw,
  isActive: Number(raw.isActive),
  emailVerified: Number(raw.emailVerified),
  otpVerified: Number(raw.otpVerified),
  smsPhoneNumberVerified: Number(raw.smsPhoneNumberVerified),
  loginCount: Number(raw.loginCount),
  skipPasskeyEnroll: Number(raw.skipPasskeyEnroll),
})

const formatApp = (raw: appModel.Raw) => ({
  ...raw,
  isActive: Number(raw.isActive),
  useSystemMfaConfig: Number(raw.useSystemMfaConfig),
  requireEmailMfa: Number(raw.requireEmailMfa),
  requireOtpMfa: Number(raw.requireOtpMfa),
  requireSmsMfa: Number(raw.requireSmsMfa),
  allowEmailMfaAsBackup: Number(raw.allowEmailMfaAsBackup),
})

export const mock = (db: any) => {
  return {
    DB: getMockedDB(db),
    KV: mockedKV,
  }
}

export const migrate = async () => {
  if (isTestingNode) {
    pgAdapter.initConnection()
    const db = await pgAdapter.getConnection()
    const migrationsDir = path.join(
      __dirname,
      '../../migrations/pg',
    )
    const migrationFiles = fs.readdirSync(migrationsDir)
    for (const file of migrationFiles) {
      await db.migrate.up({
        directory: migrationsDir,
        name: file,
      })
    }
    const getRows = (
      result: any, query: string,
    ) => {
      let rows = result.rows
      if (query.includes(' "user" ')) {
        rows = result.rows.map((row: userModel.Raw) => formatUser(row))
      } else if (query.includes(' "app" ')) {
        rows = result.rows.map((row: appModel.Raw) => formatApp(row))
      }
      return rows
    }
    const getRow = (
      record: any, query: string,
    ) => {
      let row = record
      if (query.includes(' "user" ')) {
        row = formatUser(record)
      } else if (query.includes(' "app" ')) {
        row = formatApp(record)
      }
      return row
    }
    const dbAdapter = {
      raw: async (
        query: string, params?: string[],
      ) => {
        const result = await db.raw(
          query,
          params || [],
        )
        const formatted = {
          ...result,
          rows: getRows(
            result,
            query,
          ),
        }
        return formatted
      },
      prepare: (query: string) => ({
        run: async (...params: string[]) => {
          return db.raw(
            query,
            params,
          )
        },
        get: async (...params: string[]) => {
          const res = await db.raw(
            `${query} LIMIT 1`,
            params,
          )
          const record = res?.rows[0]
          return getRow(
            record,
            query,
          )
        },
        all: async (...params: string[]) => {
          const res = await db.raw(
            query,
            params,
          )
          const records = getRows(
            res,
            query,
          )
          return records
        },
      }),
      exec: async (query: string) => db.raw(query),
      close: async () => db.destroy(),
    } as unknown as Database

    dbAdapter.prepare('update app set "useSystemMfaConfig" = 1, "requireEmailMfa" = 0, "requireOtpMfa" = 0, "requireSmsMfa" = 0, "allowEmailMfaAsBackup" = 0').run()

    return dbAdapter
  }

  const db = new Sqlite(':memory:')

  const migrationsDir = path.join(
    __dirname,
    '../../migrations/sqlite',
  )
  const migrationFiles = fs.readdirSync(migrationsDir)

  migrationFiles.forEach((file) => {
    const filePath = path.join(
      migrationsDir,
      file,
    )

    const migration = fs.readFileSync(
      filePath,
      'utf8',
    )
    db.exec(migration)
  })

  return db
}

export const emailResponseMock = vi.fn(async () => {
  return Promise.resolve({
    ok: true, text: () => {}, status: 200, statusText: 'test',
  })
})

export const emailLogRecord = {
  id: 1,
  content: expect.any(String),
  success: 1,
  receiver: 'test@email.com',
  response: '{"status":200,"statusText":"test"}',
  createdAt: expect.any(String),
  updatedAt: expect.any(String),
  deletedAt: null,
}

export const getSmsResponseMock = () => vi.fn(async () => {
  return Promise.resolve({
    ok: true, text: () => 'test response', status: 200,
  })
}) as Mock

export const fetchMock = vi.fn(async (url) => {
  if (url === 'https://www.googleapis.com/oauth2/v3/certs') {
    const key = fs.readFileSync(
      path.resolve(adapterConfig.FileLocation.NodePublicKey),
      'utf8',
    )
    const jwk = await cryptoUtil.secretToJwk(key)
    return Promise.resolve({
      ok: true,
      json: () => ({
        keys: [
          jwk,
        ],
      }),
    })
  }
  return Promise.resolve({ ok: true })
}) as Mock

export const passkeyEnrollMock = {
  authenticatorAttachment: 'platform',
  clientExtensionResults: {},
  id: 'h-UhQbCS-7orsinq8RdGbt8UzS9B_L_UIpKDWyoB5RU',
  rawId: 'h-UhQbCS-7orsinq8RdGbt8UzS9B_L_UIpKDWyoB5RU',
  response: {
    attestationObject: 'o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YVikSZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NFAAAAAAAAAAAAAAAAAAAAAAAAAAAAIIflIUGwkvu6K7Ip6vEXRm7fFM0vQfy_1CKSg1sqAeUVpQECAyYgASFYII5eFDvbkOZhbFAkOoii666ptszT4ranzvul1NIifUjuIlggsUcAFk2c7Y6yEhcnqKdsCsMLz2cLwZgZeWjI0uFgdts',
    authenticatorData: 'SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NFAAAAAAAAAAAAAAAAAAAAAAAAAAAAIIflIUGwkvu6K7Ip6vEXRm7fFM0vQfy_1CKSg1sqAeUVpQECAyYgASFYII5eFDvbkOZhbFAkOoii666ptszT4ranzvul1NIifUjuIlggsUcAFk2c7Y6yEhcnqKdsCsMLz2cLwZgZeWjI0uFgdts',
    clientDataJSON: 'eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiR3UwOUhueFRzYzAxc213YUN0QzZ5SEUwTUVnX2QtcUtVU3BLaTVCYkxnVSIsIm9yaWdpbiI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODc4NyIsImNyb3NzT3JpZ2luIjpmYWxzZX0',
    publicKey: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEjl4UO9uQ5mFsUCQ6iKLrrqm2zNPitqfO-6XU0iJ9SO6xRwAWTZztjrISFyeop2wKwwvPZwvBmBl5aMjS4WB22w',
    publicKeyAlgorithm: -7,
    transports: ['internal'],
  },
  type: 'public-key',
}

export const passkeyVerifyMock = {
  authenticatorAttachment: 'platform',
  clientExtensionResults: {},
  id: 'h-UhQbCS-7orsinq8RdGbt8UzS9B_L_UIpKDWyoB5RU',
  rawId: 'h-UhQbCS-7orsinq8RdGbt8UzS9B_L_UIpKDWyoB5RU',
  response: {
    authenticatorData: 'SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2MFAAAAAQ',
    clientDataJSON: 'eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiaEo5NUo1VGM1MmhrSmxXYVdkQlhxUFVobkxHa0dSM05xa24yVndQakFYYyIsIm9yaWdpbiI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODc4NyIsImNyb3NzT3JpZ2luIjpmYWxzZX0',
    signature: 'MEQCIGoIJgDiEA5W3umY_csiGJbFsPnPh7orU0OZER_8xCanAiA4VXNHLjggdaxm4J4bRsMHqcTWI3L2GXxKLRAqM74trw',
    userHandle: 'MTE',
  },
  type: 'public-key',
}
