import { Context } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'
import { env } from 'hono/adapter'
import {
  errorConfig, typeConfig,
} from 'configs'
import { jwtService } from 'services'
import { formatUtil } from 'utils'

export const authorizeCsrf = async (
  c: Context<typeConfig.Context>, next: Function,
) => {
  const origin = c.req.header('origin')
  const { OAUTH_SERVER_URL: serverUrl } = env(c)

  if (formatUtil.stripEndingSlash(serverUrl) !== origin) {
    throw new errorConfig.Forbidden()
  }

  await next()
}

export const spaAccessToken = bearerAuth({
  verifyToken: async (
    token, c: Context<typeConfig.Context>,
  ) => {
    const accessTokenBody = await jwtService.getAccessTokenBody(
      c,
      typeConfig.ClientType.SPA,
      token,
    )

    c.set(
      'AccessTokenBody',
      accessTokenBody,
    )

    return true
  },
})
