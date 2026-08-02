import { Context } from 'hono'
import { env } from 'hono/adapter'
import { typeConfig } from 'configs'
import { userAppConsentModel } from 'models'

export const shouldCollectConsent = async (
  c: Context<typeConfig.Context>, userId: number, appId: number, scopes: string[],
): Promise<boolean> => {
  const { ENABLE_USER_APP_CONSENT: enableConsent } = env(c)
  if (!enableConsent) return false
  const consent = await userAppConsentModel.getByUserAndApp(
    c.env.DB,
    userId,
    appId,
  )
  if (!consent) return true

  const consentedScopes = new Set(consent.scopes)
  return scopes.some((scope) => !consentedScopes.has(scope))
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
  c: Context<typeConfig.Context>, userId: number, appId: number, scopes: string[],
): Promise<boolean> => {
  const consent = await userAppConsentModel.getByUserAndApp(
    c.env.DB,
    userId,
    appId,
  )
  const normalizedScopes = [...new Set([
    ...(consent?.scopes ?? []),
    ...scopes,
  ])].sort()

  if (consent) {
    await userAppConsentModel.updateScopesByUserAndApp(
      c.env.DB,
      userId,
      appId,
      normalizedScopes,
    )
  } else {
    await userAppConsentModel.create(
      c.env.DB,
      {
        userId,
        appId,
        scopes: normalizedScopes,
      },
    )
  }

  return true
}
