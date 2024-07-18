import {
  Context, Next,
} from 'hono'
import { env } from 'hono/adapter'
import {
  CookieStore, sessionMiddleware,
} from 'hono-sessions'
import { typeConfig } from 'configs'

const store = new CookieStore()

export const session = async (
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
