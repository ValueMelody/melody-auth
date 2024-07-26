import {
  routeConfig, typeConfig,
} from 'configs'
import { scopeHandler } from 'handlers'
import { authMiddleware } from 'middlewares'

const BaseRoute = routeConfig.InternalRoute.ApiScopes

export const load = (app: typeConfig.App) => {
  app.get(
    `${BaseRoute}`,
    authMiddleware.s2sReadScope,
    scopeHandler.getScopes,
  )

  app.get(
    `${BaseRoute}/:id`,
    authMiddleware.s2sReadScope,
    scopeHandler.getScope,
  )

  app.post(
    `${BaseRoute}`,
    authMiddleware.s2sWriteScope,
    scopeHandler.postScope,
  )

  app.put(
    `${BaseRoute}/:id`,
    authMiddleware.s2sWriteScope,
    scopeHandler.putScope,
  )
}
