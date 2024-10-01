import { Hono } from 'hono'
import { cors } from 'hono/cors'
import {
  oauthRoute, userRoute, identityRoute,
  otherRoute, appRoute, roleRoute, scopeRoute, logRoute,
} from 'routes'
import { setupMiddleware } from 'middlewares'
import { typeConfig } from 'configs'

export const loadRouters = (app: Hono<typeConfig.Context>) => {
  app.use(
    '/*',
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
