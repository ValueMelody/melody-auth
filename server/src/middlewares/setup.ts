import {
  Context, Next,
} from 'hono'
import { env } from 'hono/adapter'
import {
  CookieStore, sessionMiddleware,
} from 'hono-sessions'
import {
  errorConfig, messageConfig, typeConfig,
} from 'configs'
import { requestUtil } from 'utils'
import { kvService } from 'services'

const store = new CookieStore()

export const session = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const { SERVER_SESSION_EXPIRES_IN: expiresIn } = env(c)
  if (!expiresIn) {
    await next()
    return
  }

  const secret = await kvService.getSessionSecret(c)

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

export const validOrigin = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const origin = c.req.header('origin')
  const { AUTH_SERVER_URL: serverUrl } = env(c)

  if (requestUtil.stripEndingSlash(serverUrl) !== origin) {
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongOrigin)
  }

  await next()
}
