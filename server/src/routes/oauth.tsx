import { Hono } from 'hono'
import {
  errorConfig, localeConfig, routeConfig, typeConfig,
} from 'configs'
import { oauthDto } from 'dtos'
import { authMiddleware } from 'middlewares'
import { oauthHandler } from 'handlers'

const oauthRoutes = new Hono<typeConfig.Context>()
export default oauthRoutes

oauthRoutes.get(
  routeConfig.OauthRoute.Authorize,
  oauthHandler.getAuthorize,
)

oauthRoutes.post(
  routeConfig.OauthRoute.Token,
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
  routeConfig.OauthRoute.Logout,
  oauthHandler.getLogout,
)

oauthRoutes.get(
  routeConfig.OauthRoute.Userinfo,
  authMiddleware.spaProfile,
  oauthHandler.getUserInfo,
)

oauthRoutes.post(
  routeConfig.OauthRoute.Revoke,
  authMiddleware.spaBasicAuth,
  oauthHandler.revokeToken,
)
