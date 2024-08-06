import { Context } from 'hono'
import { env } from 'hono/adapter'
import { typeConfig } from 'configs'
import { userAppConsentModel } from 'models'

export const shouldCollectConsent = async (
  c: Context<typeConfig.Context>, userId: number, appId: number,
): Promise<boolean> => {
  const { ENABLE_USER_APP_CONSENT: enableConsent } = env(c)
  if (!enableConsent) return false
  const consent = await userAppConsentModel.getByUserAndApp(
    c.env.DB,
    userId,
    appId,
  )
  return !consent
}

export const getUserConsentedApps = async (
  c: Context<typeConfig.Context>, userId: number,
): Promise<userAppConsentModel.ConsentedApp[]> => {
  const appConsents = await userAppConsentModel.getAllByUser(
    c.env.DB,
    userId,
  )
  const apps = appConsents.map((appConsent) => ({
    appId: appConsent.appId,
    appName: appConsent.appName,
  }))
  return apps
}

export const deleteUserAppConsent = async (
  c: Context<typeConfig.Context>,
  userId: number,
  appId: number,
): Promise<true> => {
  await userAppConsentModel.removeByUserAndApp(
    c.env.DB,
    userId,
    appId,
  )
  return true
}

export const createUserAppConsent = async (
  c: Context<typeConfig.Context>, userId: number, appId: number,
): Promise<boolean> => {
  await userAppConsentModel.create(
    c.env.DB,
    {
      userId,
      appId,
    },
  )

  return true
}
