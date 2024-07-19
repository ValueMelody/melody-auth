import {
  routeConfig, typeConfig,
} from 'configs'
import { authMiddleware } from 'middlewares'
import { userModel } from 'models'

const BaseRoute = routeConfig.InternalRoute.ApiUsers

export const load = (app: typeConfig.App) => {
  app.get(
    `${BaseRoute}`,
    authMiddleware.s2sReadUser,
    async (c) => {
      const users = await userModel.getAll(c.env.DB)
      return c.json({ users })
    },
  )

  app.get(
    `${BaseRoute}/:authId`,
    authMiddleware.s2sReadUser,
    async (c) => {
      const authId = c.req.param('authId')
      const user = await userModel.getByAuthId(
        c.env.DB,
        authId,
      )
      return c.json({ user })
    },
  )
}
