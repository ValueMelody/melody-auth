import { Context } from 'hono'
import { typeConfig } from 'configs'
import { appService } from 'services'

export const getApps = async (c: Context<typeConfig.Context>) => {
  const includeDeleted = c.req.query('include_disabled') === 'true'
  const apps = await appService.getApps(
    c,
    includeDeleted,
  )
  return c.json({ apps })
}

export const getApp = async (c: Context<typeConfig.Context>) => {
  const includeDeleted = c.req.query('include_disabled') === 'true'
  const id = Number(c.req.param('id'))
  const app = await appService.getAppById(
    c,
    id,
    includeDeleted,
  )
  return c.json({ app })
}

export const enableApp = async (c: Context<typeConfig.Context>) => {
  const id = c.req.param('id')
  await appService.enableApp(
    c,
    Number(id),
  )

  return c.json({ success: true })
}

export const disableApp = async (c: Context<typeConfig.Context>) => {
  const id = c.req.param('id')
  await appService.disableApp(
    c,
    Number(id),
  )
  return c.json({ success: true })
}
