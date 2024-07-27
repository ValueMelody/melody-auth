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
