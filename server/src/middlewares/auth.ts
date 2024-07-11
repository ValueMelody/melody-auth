import { Context } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'
import { typeConfig } from 'configs'
import { jwtService } from 'services'

export const accessToken = bearerAuth({
  verifyToken: async (
    token, c: Context<typeConfig.Context>,
  ) => {
    const accessTokenBody = await jwtService.getAccessTokenBody(
      c,
      token,
    )

    c.set(
      'AccessTokenBody',
      accessTokenBody,
    )

    return true
  },
})
