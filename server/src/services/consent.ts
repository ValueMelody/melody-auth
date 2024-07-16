import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  errorConfig, localeConfig,
  typeConfig,
} from 'configs'
import { userAppConsentModel } from 'models'

export const shouldCollectConsent = async (
  c: Context<typeConfig.Context>, userId: number, appId: number,
) => {
  const { ENABLE_USER_APP_CONSENT: enableConsent } = env(c)
  if (!enableConsent) return false
  const consent = await userAppConsentModel.getByUserAndApp(
    c.env.DB,
    userId,
    appId,
  )
  return !consent
}

export const createUserAppConsent = async (
  db: D1Database, userId: number, appId: number,
) => {
  const includeDeleted = true
  const consent = await userAppConsentModel.getByUserAndApp(
    db,
    userId,
    appId,
    includeDeleted,
  )
  if (consent && !consent.deletedAt) return true

  const newConsent = consent
    ? await userAppConsentModel.update(
      db,
      consent.id,
      { deletedAt: null },
    )
    : await userAppConsentModel.create(
      db,
      {
        userId,
        appId,
      },
    )

  if (!newConsent) {
    throw new errorConfig.InternalServerError(localeConfig.Error.CanNotCreateConsent)
  }
  return true
}
