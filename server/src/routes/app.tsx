import {
  routeConfig, typeConfig,
} from 'configs'
import { appHandler } from 'handlers'
import { authMiddleware } from 'middlewares'

const BaseRoute = routeConfig.InternalRoute.ApiApps

export const load = (app: typeConfig.App) => {
  app.get(
    `${BaseRoute}`,
    authMiddleware.s2sReadApp,
    appHandler.getApps,
  )

  app.get(
    `${BaseRoute}/:id`,
    authMiddleware.s2sReadApp,
    appHandler.getApp,
  )

  app.put(
    `${BaseRoute}/:id/enable`,
    authMiddleware.s2sWriteApp,
    appHandler.enableApp,
  )

  app.put(
    `${BaseRoute}/:id/disable`,
    authMiddleware.s2sWriteApp,
    appHandler.disableApp,
  )
}
