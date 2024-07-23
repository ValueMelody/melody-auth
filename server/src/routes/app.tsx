import {
  routeConfig, typeConfig,
} from 'configs'
import { authMiddleware } from 'middlewares'
import { appService } from 'services'

const BaseRoute = routeConfig.InternalRoute.ApiApps

export const load = (app: typeConfig.App) => {
  app.get(
    `${BaseRoute}`,
    authMiddleware.s2sReadApp,
    async (c) => {
      const includeDeleted = c.req.query('include_disabled') === 'true'
      const apps = await appService.getApps(
        c,
        includeDeleted,
      )
      return c.json({ apps })
    },
  )

  app.get(
    `${BaseRoute}/:id`,
    authMiddleware.s2sReadApp,
    async (c) => {
      const includeDeleted = c.req.query('include_disabled') === 'true'
      const id = Number(c.req.param('id'))
      const app = await appService.getAppById(
        c,
        id,
        includeDeleted,
      )
      return c.json({ app })
    },
  )

  app.put(
    `${BaseRoute}/:id/enable`,
    authMiddleware.s2sWriteApp,
    async (c) => {
      const id = c.req.param('id')
      await appService.enableApp(
        c,
        Number(id),
      )

      return c.json({ success: true })
    },
  )

  app.put(
    `${BaseRoute}/:id/disable`,
    authMiddleware.s2sWriteApp,
    async (c) => {
      const id = c.req.param('id')
      await appService.disableApp(
        c,
        Number(id),
      )
      return c.json({ success: true })
    },
  )
}
