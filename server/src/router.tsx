import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { env } from 'hono/adapter'
import {
  oauthRoute, userRoute, identityRoute,
  otherRoute, appRoute, roleRoute, scopeRoute, logRoute,
  orgRoute,
} from 'routes'
import { setupMiddleware } from 'middlewares'
import {
  typeConfig, variableConfig,
} from 'configs'

export const loadRouters = (app: Hono<typeConfig.Context>) => {
  app.use(
    '/*',
    async (
      c, next,
    ) => {
      const {
        LOG_LEVEL: logLevel, ENVIRONMENT: environment,
      } = env(c)
      if (logLevel === 'info' || environment === variableConfig.DefaultEnvironment.Development) {
        const loggerMiddleware = logger()
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
    appRoute,
  )
  app.route(
    '/',
    userRoute,
  )
  app.route(
    '/',
    logRoute,
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
    otherRoute,
  )

  return app
}
