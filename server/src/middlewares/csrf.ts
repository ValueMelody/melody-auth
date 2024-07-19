import {
  Context, Next,
} from 'hono'
import { env } from 'hono/adapter'
import {
  errorConfig, typeConfig,
} from 'configs'
import { formatUtil } from 'utils'

export const serverOrigin = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const origin = c.req.header('origin')
  const { AUTH_SERVER_URL: serverUrl } = env(c)

  if (formatUtil.stripEndingSlash(serverUrl) !== origin) {
    throw new errorConfig.Forbidden()
  }

  await next()
}
