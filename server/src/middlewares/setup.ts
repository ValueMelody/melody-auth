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
import {
  loggerUtil, requestUtil,
} from 'utils'
import { kvService, orgService } from 'services'

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
  const { AUTH_SERVER_URL: serverUrl, ENABLE_ORG: enableOrg } = env(c)

  if (origin && requestUtil.stripEndingSlash(serverUrl) !== origin) {
    // Check if origin matches a verified custom domain
    if (enableOrg) {
      try {
        const originHost = new URL(origin).host
        const org = await orgService.getOrgByCustomDomain(c, originHost)
        if (org) {
          await next()
          return
        }
      } catch {
        // Invalid URL, continue to reject
      }
    }

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

export const detectOrgFromHost = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const { ENABLE_ORG: enableOrg, AUTH_SERVER_URL: serverUrl } = env(c)

  if (!enableOrg) {
    await next()
    return
  }

  const host = c.req.header('host')
  if (!host) {
    await next()
    return
  }

  const serverHost = new URL(serverUrl).host

  if (host === serverHost) {
    await next()
    return
  }

  const serverParts = serverHost.split('.')
  const hostParts = host.split(':')[0].split('.')

  if (
    hostParts.length === serverParts.length + 1 &&
    hostParts.slice(1).join('.') === serverParts.join('.')
  ) {
    const subdomain = hostParts[0]
    c.set('detectedOrgSlug', subdomain)
    await next()
    return
  }

  const customDomainHost = host.split(':')[0]
  const org = await orgService.getOrgByCustomDomain(c, customDomainHost)
  if (org) {
    c.set('detectedOrgSlug', org.slug)
  }

  await next()
}
