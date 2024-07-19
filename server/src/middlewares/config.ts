import {
  Context, Next,
} from 'hono'
import { env } from 'hono/adapter'
import {
  errorConfig, typeConfig,
} from 'configs'
import { formatUtil } from 'utils'

export const serverUrl = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const origin = c.req.header('origin')
  const { AUTH_SERVER_URL: serverUrl } = env(c)

  if (formatUtil.stripEndingSlash(serverUrl) !== origin) {
    throw new errorConfig.Forbidden()
  }

  await next()
}

export const enablePasswordReset = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const {
    ENABLE_PASSWORD_RESET: enabledReset,
    SENDGRID_API_KEY: sendgridApiKey,
    SENDGRID_SENDER_ADDRESS: sendgridSender,
  } = env(c)

  if (!enabledReset || !sendgridApiKey || !sendgridSender) throw new errorConfig.Forbidden()

  await next()
}

export const enableEmailVerification = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const {
    ENABLE_EMAIL_VERIFICATION: enableEmailVerification,
    SENDGRID_API_KEY: sendgridApiKey,
    SENDGRID_SENDER_ADDRESS: sendgridSender,
  } = env(c)

  if (!enableEmailVerification || !sendgridApiKey || !sendgridSender) throw new errorConfig.Forbidden()

  await next()
}
