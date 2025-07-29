import { Context } from 'hono'
import {
  typeConfig, messageConfig, errorConfig,
} from 'configs'
import { bannerModel } from 'models'
import { appDto } from 'dtos'
import { loggerUtil } from 'utils'

export const getAppBanners = async (c: Context<typeConfig.Context>): Promise<bannerModel.Record[]> => {
  const appBanners = await bannerModel.getAll(c.env.DB)

  return appBanners
}

export const getAppBannerById = async (
  c: Context<typeConfig.Context>,
  id: number,
): Promise<bannerModel.Record> => {
  const appBanner = await bannerModel.getById(
    c.env.DB,
    id,
  )

  if (!appBanner) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoAppBanner,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoAppBanner)
  }
  return appBanner
}

export const createAppBanner = async (
  c: Context<typeConfig.Context>,
  dto: appDto.PostAppBannerDto,
): Promise<bannerModel.Record> => {
  const locales = dto.locales?.reduce(
    (
      acc, locale,
    ) => {
      acc[locale.locale] = locale.value
      return acc
    },
    {} as Record<string, string>,
  )

  const appBanner = await bannerModel.create(
    c.env.DB,
    {
      ...dto,
      locales: locales ? JSON.stringify(locales) : '',
    },
  )

  return appBanner
}

export const updateAppBanner = async (
  c: Context<typeConfig.Context>,
  id: number,
  dto: appDto.PutAppBannerDto,
): Promise<bannerModel.Record> => {
  const locales = dto.locales?.reduce(
    (
      acc, locale,
    ) => {
      acc[locale.locale] = locale.value
      return acc
    },
    {} as Record<string, string>,
  )

  const appBanner = await bannerModel.update(
    c.env.DB,
    id,
    {
      type: dto.type,
      text: dto.text,
      locales: locales ? JSON.stringify(locales) : undefined,
      isActive: dto.isActive === undefined ? undefined : (dto.isActive ? 1 : 0),
    },
  )
  return appBanner
}

export const deleteAppBannerById = async (
  c: Context<typeConfig.Context>,
  id: number,
): Promise<void> => {
  await bannerModel.remove(
    c.env.DB,
    id,
  )
}
