import {
  Context, Next,
} from 'hono'
import { env } from 'hono/adapter'
import { cors } from 'hono/cors'
import {
  CookieStore, sessionMiddleware,
} from 'hono-sessions'
import {
  errorConfig, messageConfig, typeConfig,
} from 'configs'
import {
  loggerUtil, requestUtil,
} from 'utils'
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

export const publicCors = cors()

export const embeddedCors = cors({
  origin: (
    origin, c,
  ) => {
    const { EMBEDDED_AUTH_ORIGINS: origins } = env<typeConfig.Bindings>(c)
    return origins.includes(origin) ? origin : null
  },
})

export const validOrigin = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const origin = c.req.header('origin')
  const { AUTH_SERVER_URL: serverUrl } = env(c)

  if (origin && requestUtil.stripEndingSlash(serverUrl) !== origin) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongOrigin,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongOrigin)
  }

  await next()
}

export const validEmbeddedOrigin = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const origin = c.req.header('origin')

  const {
    AUTH_SERVER_URL: serverUrl,
    EMBEDDED_AUTH_ORIGINS: origins,
  } = env(c)

  if (!origins.length) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.EmbeddedAuthFeatureNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.EmbeddedAuthFeatureNotEnabled)
  }

  if (
    origin &&
    requestUtil.stripEndingSlash(serverUrl) !== origin &&
    !origins.includes(origin)
  ) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongOrigin,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongOrigin)
  }

  await next()
}
