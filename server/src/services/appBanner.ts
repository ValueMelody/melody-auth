import { Context } from 'hono'
import { ClientType } from '@melody-auth/shared'
import {
  typeConfig, messageConfig, errorConfig,
} from 'configs'
import {
  bannerModel, appBannerModel,
  appModel,
} from 'models'
import { appDto } from 'dtos'
import { loggerUtil } from 'utils'

export const getAppBanners = async (c: Context<typeConfig.Context>): Promise<bannerModel.ApiRecord[]> => {
  const banners = await bannerModel.getAll(c.env.DB)
  const appBanners = await appBannerModel.getAll(c.env.DB)

  const results: bannerModel.ApiRecord[] = banners.map((banner) => {
    const contained = appBanners.filter((appBanner) => appBanner.bannerId === banner.id)
    return {
      ...banner,
      appIds: contained.map((appBanner) => appBanner.appId),
    }
  })

  return results
}

export const getBannersByClientId = async (
  c: Context<typeConfig.Context>,
  clientId: string,
): Promise<bannerModel.Record[]> => {
  const app = await appModel.getByClientId(
    c.env.DB,
    clientId,
  )

  if (!app || app.type !== ClientType.SPA) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoSpaAppFound,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoSpaAppFound)
  }

  const appBanners = await appBannerModel.getAllByAppId(
    c.env.DB,
    app.id,
  )
  const bannerIds = appBanners.map((appBanner) => appBanner.bannerId)
  const banners = await bannerModel.getAll(c.env.DB)

  const activeBanners = banners.filter((banner) => banner.isActive && bannerIds.includes(banner.id))
  return activeBanners
}

export const getAppBannerById = async (
  c: Context<typeConfig.Context>,
  id: number,
): Promise<bannerModel.ApiRecord> => {
  const banner = await bannerModel.getById(
    c.env.DB,
    id,
  )

  if (!banner) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoAppBanner,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoAppBanner)
  }

  const appBanners = await appBannerModel.getAllByBannerId(
    c.env.DB,
    id,
  )

  return {
    ...banner,
    appIds: appBanners.map((appBanner) => appBanner.appId),
  }
}

export const createAppBanner = async (
  c: Context<typeConfig.Context>,
  dto: appDto.PostAppBannerDto,
): Promise<bannerModel.ApiRecord> => {
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

  return {
    ...appBanner,
    appIds: [],
  }
}

export const updateAppBanner = async (
  c: Context<typeConfig.Context>,
  id: number,
  dto: appDto.PutAppBannerDto,
): Promise<bannerModel.ApiRecord> => {
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

  const appBanners = await appBannerModel.getAllByBannerId(
    c.env.DB,
    id,
  )

  if (!dto.appIds) {
    return {
      ...appBanner,
      appIds: appBanners.map((appBanner) => appBanner.appId),
    }
  }

  const recordsToDelete = appBanners.filter((appBanner) => !dto.appIds?.includes(appBanner.appId))
  const appIdsToCreate = dto.appIds?.filter((appId) => !appBanners.some((appBanner) => appBanner.appId === appId))

  if (recordsToDelete.length > 0) {
    for (const record of recordsToDelete) {
      await appBannerModel.remove(
        c.env.DB,
        record.id,
      )
    }
  }

  if (appIdsToCreate?.length > 0) {
    for (const appId of appIdsToCreate) {
      await appBannerModel.create(
        c.env.DB,
        {
          bannerId: id, appId,
        },
      )
    }
  }

  return {
    ...appBanner,
    appIds: dto.appIds,
  }
}

export const deleteAppBannerById = async (
  c: Context<typeConfig.Context>,
  id: number,
): Promise<void> => {
  await appBannerModel.removeByBannerId(
    c.env.DB,
    id,
  )
  await bannerModel.remove(
    c.env.DB,
    id,
  )
}
