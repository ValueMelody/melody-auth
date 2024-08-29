import { readFileSync } from 'fs'
import {
  Context, Next,
} from 'hono'
import {
  vi, Mock,
} from 'vitest'
import toml from 'toml'
import {
  Algorithm, decode, sign,
  verify,
} from 'jsonwebtoken'
import jwkToPem from 'jwk-to-pem'
import { session } from 'tests/mock'

const config = toml.parse(readFileSync(
  './wrangler.toml',
  'utf-8',
))

global.process.env = {
  ...global.process.env,
  ...config.vars,
  AUTH_SERVER_URL: 'http://localhost:8787',
  SENDGRID_API_KEY: 'abc',
  SENDGRID_SENDER_ADDRESS: 'app@valuemelody.com',
}

const mockMiddleware = async (
  c: Context, next: Next,
) => {
  await next()
}

vi.mock(
  'hono/jwt',
  async (importOriginal: Function) => ({
    ...(await importOriginal() as object),
    sign: (
      string: string, key: string, alg: Algorithm,
    ) => {
      return sign(
        string,
        key,
        {
          algorithm: alg, keyid: '48f2dc34d337d097aed60c2fcf17d96f21c2669124ee3f3a650a0f78a98b045d',
        },
      )
    },
    verify: (
      string: string, key: string, alg: Algorithm,
    ) => {
      return verify(
        string,
        typeof key === 'string' ? key : jwkToPem(key),
        { algorithms: [alg] },
      )
    },
    decode: (token: string) => {
      return decode(
        token,
        { complete: true },
      )
    },
  }),
)

vi.mock(
  'middlewares',
  async (importOriginal: Function) => ({
    ...(await importOriginal() as object),
    setupMiddleware: {
      validOrigin: mockMiddleware,
      session: async (
        c: Context, next: Next,
      ) => {
        c.set(
          'session',
          session,
        )
        await next()
      },
    },
  }),
)

global.fetch = vi.fn((url) => {
  if (url === 'https://www.googleapis.com/oauth2/v3/certs') {
    return Promise.resolve({
      ok: true,
      json: () => ({
        keys: [
          {
            kty: 'RSA',
            n: 'yTuKDtxWPXn_ZhRUrnjv0seFe-cEstFWbNGtiWnNxTE4vDHHN9rVwMqcI8CXgxfY5l8lxUqn95NCemUTAtd6BTCHpJYP4ktrxmez0Sst6PZWJe11QBGhr8qS_4GfOXb86tDiL4oRN7TP2FcRYrVt7-UOnZgRh9-9gnxMEXlvyRkasE7TTvSY0kQcbIoZoXc8EuTXLLVNDtx8lXrUepPV0JcAWXrRR5FbPL2bX1yNRsho55yiFKW_boazBw8nJpZGauHl8cOJdFQVDl8_ihzA-f53EOPiFRfWW-goEVgrfJ_ZsrKpzQGJGTdHBpc-ZGEdfDF2E2czLrxKLdim1E_jhQ',
            e: 'AQAB',
            alg: 'RS256',
            use: 'sig',
            kid: '48f2dc34d337d097aed60c2fcf17d96f21c2669124ee3f3a650a0f78a98b045d',
          },
        ],
      }),
    })
  }
  return Promise.resolve({ ok: true })
}) as Mock
