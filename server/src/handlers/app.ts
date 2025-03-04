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

  const bodyDto = new appDto.PostAppDto(reqBody)
  await validateUtil.dto(bodyDto)

  const app = await appService.createApp(
    c,
    bodyDto,
  )

  c.status(201)
  return c.json({ app })
}

export const putApp = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()
  const bodyDto = new appDto.PutAppDto(reqBody)
  await validateUtil.dto(bodyDto)

  const id = c.req.param('id')
  const app = await appService.updateApp(
    c,
    Number(id),
    bodyDto,
  )
  return c.json({ app })
}

export const deleteApp = async (c: Context<typeConfig.Context>) => {
  const id = Number(c.req.param('id'))

  await appService.deleteApp(
    c,
    id,
  )

  c.status(204)
  return c.body(null)
}
