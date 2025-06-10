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
    case adapterConfig.BaseKVKey.SamlSpCert:
      return fs.readFileSync(
        path.resolve(adapterConfig.FileLocation.NodeSamlSpCert),
        'utf8',
      )
    case adapterConfig.BaseKVKey.SamlSpKey:
      return fs.readFileSync(
        path.resolve(adapterConfig.FileLocation.NodeSamlSpKey),
        'utf8',
      )
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

export const samlIdpMetaDataMock = `
<EntityDescriptor entityID="urn:test.com" xmlns="urn:oasis:names:tc:SAML:2.0:metadata">
  <IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <KeyDescriptor use="signing">
      <KeyInfo xmlns="http://www.w3.org/2000/09/xmldsig#">
        <X509Data>
          <X509Certificate>MIIFJzCCAw+gAwIBAgIUTjMiMp9t/uRczjiXIPdOdXepxBUwDQYJKoZIhvcNAQELBQAwIzEhMB8GA1UEAwwYbWVsb2R5LWF1dGggU0FNTCBzaWduaW5nMB4XDTI1MDYwMTIzMjMxN1oXDTI3MDYwMTIzMjMxN1owIzEhMB8GA1UEAwwYbWVsb2R5LWF1dGggU0FNTCBzaWduaW5nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA2Dp+8K6q9+RPMh2qwQSAdi/IX/kVHXXLjPpG5spuCfjgmPwbkBM74h4cMFlFwovwwM6BJpzYnNby5ECfFzJ5nmoNhugygusZSCGWut4HUK3Oda0NSjuU8vSbO3W51/spyQP+D3kb817T4l73v73v3+o9vn6b4pVE8WcrArCrzsA/I5RRKpsr29ngL2hBiaAq/fAWUs+b4MvRSBwfqqEeeA8CLJWNMvw8zToyBLQouXZPmC+LRN8na9qSJxCoOjG15ESBmIIqU+KQuFg2Ve6rvJuTh2YA1CxW9enTvfzOqLcq5/ibGecz00uB34BFPeqcsMbtSxm+KCdYnf/n5TjIGqzkhESEHGHh1DZ/7trEQZLut6vR8Ryje4p6Y5gDUzwIQ5t/kd05PDxkuMsVdQ/RhQv/s/3qZkOUxXAIiucVU/C+27N+8tuHd3AOvGE7CDovKi2XTd+XRsIhe4lM+kI+Jh7T7HF0P3iGJCtBQQf4bwvOb9OyAhQqx9NdEIMHILTs5CCcysu1z8ZEO4jBh8afT/HmSZzTSMtg4lu+zCNnEPLZTrcqD0SuGNTIu8E8MURWyyI7Rr7Rw+MR889mNqGZntkzrN1wPsOrmMwKXeL9/sq4xM3XQU9yNljRiiQiJ/aDhdk0Nq61/lCNvCfImfj0HUHF5BreqH2eFrwHpTD8LqcCAwEAAaNTMFEwHQYDVR0OBBYEFAI92YgdhYIPyUAxDpaqathmiQAbMB8GA1UdIwQYMBaAFAI92YgdhYIPyUAxDpaqathmiQAbMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggIBANOHmQwCXm7bn9Mhy3353HHBnnkbQOWfqad10X/WhmSGTwEMTKkApZoE9qTjMWl1mS327+vV6dLfPz453G/VAHJf9+2QW+EkDaM84/guCv2L2ONMo+4C8yTg/jWeH9IB4OZc7MLuY8Ym4XxFM7+1V+G4mGkSuut+SNLzTf5Vsis3lfH2H0YdFSCsFaj+65uxGUkLhAkvl9wP16dyRumLC/JWwMKAk8EBpw08ae0ItEBmfiSQ9NulWS+eZSRGgjHCg/eT/yrhMf7HxvA4bEQ0EhzhBwHVkBjA9+m6trUvazpc8yyBu7B6cLfZFxyEGIPON5gh9RZb7j3U5j7RHbb4FF8wEL+nhk/M4RR+lpflWJ7dNvfmzVipaDRCbcJXofIvJPmggCICC0930aCJ5T1zuH8OFEAMVvLtPaAA4PTApZtQt/9QoTxuVth5aYod24QvgPyHH0RThXD5OKjzg4E6zkkqwQZw15Vz0Z1HCGzrptrdQbm9HPtjaWcCIjcIeVwJhfQl2Q3+czhtOhZ9VxmKJSm0PdqHCvTpKWvcBTncWORbPqlm0fNEkkY8xzz05CNDR6iw+6ZMX2s1+L2gBTICTAF2DNi/vKQExs2Z5CVBOBCD/KGuCULiPWSavSX2632Fm39FGvaMvoDD2ZDV4iJwPh2UKU0es8Jj0CFjCYjZS2FT</X509Certificate>
        </X509Data>
      </KeyInfo>
    </KeyDescriptor>
    <SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://test.com/samlp/PFBpZxRbQz4EiaVDW07Nc5SpBhK2HumV/logout"/>
    <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
    <NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:persistent</NameIDFormat>
    <NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:transient</NameIDFormat>
    <SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://test.com/samlp/PFBpZxRbQz4EiaVDW07Nc5SpBhK2HumV"/>
    <Attribute Name="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri" FriendlyName="E-Mail Address" xmlns="urn:oasis:names:tc:SAML:2.0:assertion"/>
    <Attribute Name="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri" FriendlyName="Given Name" xmlns="urn:oasis:names:tc:SAML:2.0:assertion"/>
    <Attribute Name="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri" FriendlyName="Surname" xmlns="urn:oasis:names:tc:SAML:2.0:assertion"/>
    <Attribute Name="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri" FriendlyName="Name ID" xmlns="urn:oasis:names:tc:SAML:2.0:assertion"/>
  </IDPSSODescriptor>
</EntityDescriptor>
`
