import {
  Context, Next,
} from 'hono'
import { bearerAuth } from 'hono/bearer-auth'
import { env } from 'hono/adapter'
import {
  CookieStore, sessionMiddleware,
} from 'hono-sessions'
import {
  errorConfig, typeConfig,
} from 'configs'
import { jwtService } from 'services'
import { formatUtil } from 'utils'

const store = new CookieStore()

export const sessionSetup = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const {
    SERVER_SESSION_SECRET: secret,
    SERVER_SESSION_EXPIRES_IN: expiresIn,
  } = env(c)
  if (!expiresIn) {
    await next()
    return
  }
  const session = sessionMiddleware({
    store,
    encryptionKey: secret,
    expireAfterSeconds: expiresIn,
    cookieOptions: {
      sameSite: 'Lax',
      path: '/',
      httpOnly: true,
    },
  })
  return session(
    c,
    next,
  )
}

export const authorizeCsrf = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const origin = c.req.header('origin')
  const { AUTH_SERVER_URL: serverUrl } = env(c)

  if (formatUtil.stripEndingSlash(serverUrl) !== origin) {
    throw new errorConfig.Forbidden()
  }

  await next()
}

export const spaAccessToken = bearerAuth({
  verifyToken: async (
    token, c: Context<typeConfig.Context>,
  ) => {
    const accessTokenBody = await jwtService.getAccessTokenBody(
      c,
      typeConfig.ClientType.SPA,
      token,
    )

    c.set(
      'access_token_body',
      accessTokenBody,
    )

    return true
  },
})
