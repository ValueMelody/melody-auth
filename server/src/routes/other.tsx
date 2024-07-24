import { typeConfig } from 'configs'
import { otherHandler } from 'handlers'

export const load = (app: typeConfig.App) => {
  app.get(
    '/info',
    otherHandler.getSystemInfo,
  )

  app.get(
    '/.well-known/openid-configuration',
    otherHandler.getOpenidConfig,
  )
}
