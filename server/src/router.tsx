import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { env } from 'hono/adapter'
import {
  oauthRoute, userRoute, userAttributeRoute, identityRoute,
  otherRoute, appRoute, appBannerRoute, roleRoute, scopeRoute,
  orgRoute, embeddedRoute, samlRoute, logRoute, orgGroupRoute,
} from 'routes'
import { setupMiddleware } from 'middlewares'
import {
  typeConfig, variableConfig,
} from 'configs'
import { loggerUtil } from 'utils'

export const loadRouters = (app: Hono<typeConfig.Context>) => {
  app.use(
    '/*',
    async (
      c, next,
    ) => {
      const {
        LOG_LEVEL: logLevel, ENVIRONMENT: environment,
      } = env(c)
      if (logLevel === loggerUtil.LoggerLevel.Info || environment === variableConfig.DefaultEnvironment.Development) {
        const loggerMiddleware = logger(loggerUtil.customLogger)
        return loggerMiddleware(
          c,
          next,
        )
      }
      await next()
    },
    cors(),
    setupMiddleware.session,
  )

  app.route(
    '/',
    scopeRoute,
  )
  app.route(
    '/',
    roleRoute,
  )
  app.route(
    '/',
    orgRoute,
  )
  app.route(
    '/',
    orgGroupRoute,
  )
  app.route(
    '/',
    appRoute,
  )
  app.route(
    '/',
    appBannerRoute,
  )
  app.route(
    '/',
    userRoute,
  )
  app.route(
    '/',
    userAttributeRoute,
  )
  app.route(
    '/',
    logRoute,
  )
  app.route(
    '/',
    samlRoute,
  )
  app.route(
    '/',
    identityRoute,
  )
  app.route(
    '/',
    oauthRoute,
  )
  app.route(
    '/',
    embeddedRoute,
  )
  app.route(
    '/',
    otherRoute,
  )

  return app
}
