import { Context } from 'hono'
import { typeConfig } from 'configs'
import { appBannerService } from 'services'
import { appDto } from 'dtos'
import { validateUtil } from 'utils'

export const getAppBanners = async (c: Context<typeConfig.Context>) => {
  const appBanners = await appBannerService.getAppBanners(c)
  return c.json({ appBanners })
}

export const postAppBanner = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new appDto.PostAppBannerDto(reqBody)
  await validateUtil.dto(bodyDto)

  const appBanner = await appBannerService.createAppBanner(
    c,
    bodyDto,
  )

  c.status(201)
  return c.json({ appBanner })
}

export const getAppBanner = async (c: Context<typeConfig.Context>) => {
  const id = Number(c.req.param('id'))

  const appBanner = await appBannerService.getAppBannerById(
    c,
    id,
  )

  return c.json({ appBanner })
}

export const putAppBanner = async (c: Context<typeConfig.Context>) => {
  const id = Number(c.req.param('id'))

  const reqBody = await c.req.json()

  const bodyDto = new appDto.PutAppBannerDto(reqBody)
  await validateUtil.dto(bodyDto)

  const appBanner = await appBannerService.updateAppBanner(
    c,
    id,
    bodyDto,
  )

  return c.json({ appBanner })
}

export const deleteAppBanner = async (c: Context<typeConfig.Context>) => {
  const id = Number(c.req.param('id'))

  await appBannerService.deleteAppBannerById(
    c,
    id,
  )

  c.status(204)
  return c.body(null)
}
