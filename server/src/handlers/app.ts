import { Context } from 'hono'
import { typeConfig } from 'configs'
import { appService } from 'services'
import { validateUtil } from 'utils'
import { appDto } from 'dtos'

export const getApps = async (c: Context<typeConfig.Context>) => {
  const apps = await appService.getApps(c)
  return c.json({ apps })
}

export const getApp = async (c: Context<typeConfig.Context>) => {
  const id = Number(c.req.param('id'))
  const app = await appService.getAppById(
    c,
    id,
  )
  return c.json({ app })
}

export const postApp = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new appDto.PostAppReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const app = await appService.createApp(
    c,
    bodyDto,
  )
  return c.json({ app })
}

export const putApp = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()
  const bodyDto = new appDto.PutAppReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const id = c.req.param('id')
  const app = await appService.updateApp(
    c,
    Number(id),
    bodyDto,
  )
  return c.json({ app })
}

export const enableApp = async (c: Context<typeConfig.Context>) => {
  const id = c.req.param('id')
  await appService.updateApp(
    c,
    Number(id),
    { isActive: true },
  )

  return c.json({ success: true })
}

export const disableApp = async (c: Context<typeConfig.Context>) => {
  const id = c.req.param('id')
  await appService.updateApp(
    c,
    Number(id),
    { isActive: false },
  )
  return c.json({ success: true })
}
