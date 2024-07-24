import {
  errorConfig, localeConfig, routeConfig, typeConfig,
} from 'configs'
import { oauthDto } from 'dtos'
import { authMiddleware } from 'middlewares'
import { oauthHandler } from 'handlers'

const BaseRoute = routeConfig.InternalRoute.OAuth

export const load = (app: typeConfig.App) => {
  app.get(
    `${BaseRoute}/authorize`,
    oauthHandler.getAuthorize,
  )

  app.post(
    `${BaseRoute}/token`,
    authMiddleware.s2sBasicAuth,
    async (c) => {
      const reqBody = await c.req.parseBody()
      const grantType = String(reqBody.grant_type).toLowerCase()

      if (grantType === oauthDto.TokenGrantType.AuthorizationCode) {
        return oauthHandler.postTokenAuthCode(c)
      }

      if (grantType === oauthDto.TokenGrantType.RefreshToken) {
        return oauthHandler.postTokenRefreshToken(c)
      }

      if (grantType === oauthDto.TokenGrantType.ClientCredentials) {
        return oauthHandler.postTokenClientCredentials(c)
      }

      throw new errorConfig.Forbidden(localeConfig.Error.WrongGrantType)
    },
  )

  app.get(
    `${BaseRoute}/logout`,
    oauthHandler.getLogout,
  )

  app.get(
    `${BaseRoute}/userinfo`,
    authMiddleware.spaProfile,
    oauthHandler.getUserInfo,
  )
}
