import { readFileSync } from 'fs'
import {
  Context, Next,
} from 'hono'
import {
  vi, Mock,
} from 'vitest'
import toml from 'toml'
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
            n: 'vMEJatlKawIBhsaLcqp7vce45i4Nrx35l9NkdalZdaBlEEY91CpdSRCpw2uV5sObXqvkqAjbpXSRlt_h4SuuYBSdqVlJ_GYdW1Da0tKZ40fUamdPBgm5o09rE54bMT3oVr90kqzufpCIiGMufs0Pyz0WrYA24JGGlPzAK2-zqIuSrL_krqZ0rAkOcvUfp0omOYTeQYcU5WmlfTseqb8RKRPD2IAFXQb33gcoou3ZaMbC-fesEmg_Htnzb0KGsxjM8fNLTuSBCf700U7rXyBICAp1WOWTIkJRmb47r5kdRzGApTSZvVgvOBY6F9fjZbV5XN-FPIovELQpiXWVJmsKyw',
            e: 'AQAB',
            alg: 'RS256',
            use: 'sig',
            kid: '01e24a8cc12f46f4e342b47a44dbbedcd16ffa25721dea4a56d0dfd1b17f27c9',
          },
        ],
      }),
    })
  }
  return Promise.resolve({ ok: true })
}) as Mock
