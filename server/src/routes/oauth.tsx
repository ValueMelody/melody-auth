import { Hono } from 'hono'
import {
  errorConfig, localeConfig, routeConfig, typeConfig,
} from 'configs'
import { oauthDto } from 'dtos'
import { authMiddleware } from 'middlewares'
import { oauthHandler } from 'handlers'

const BaseRoute = routeConfig.InternalRoute.OAuth
const oauthRoutes = new Hono<typeConfig.Context>()
export default oauthRoutes

oauthRoutes.get(
  `${BaseRoute}/authorize`,
  oauthHandler.getAuthorize,
)

oauthRoutes.post(
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

oauthRoutes.get(
  `${BaseRoute}/logout`,
  oauthHandler.getLogout,
)

oauthRoutes.get(
  `${BaseRoute}/userinfo`,
  authMiddleware.spaProfile,
  oauthHandler.getUserInfo,
)
