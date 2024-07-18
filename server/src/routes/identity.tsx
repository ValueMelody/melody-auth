import { env } from 'hono/adapter'
import {
  errorConfig, localeConfig, routeConfig, typeConfig,
} from 'configs'
import { oauthDto } from 'dtos'
import {
  appService,
  consentService,
  emailService,
  jwtService, kvService, sessionService, userService,
} from 'services'
import {
  cryptoUtil, formatUtil, timeUtil,
} from 'utils'
import {
  accessTokenMiddleware, csrfMiddleware,
} from 'middlewares'
import {
  AuthorizePasswordView, AuthorizeConsentView, AuthorizeAccountView,
} from 'templates'
import {
  getAuthorizeReqHandler, postAuthorizeReqHandler, postLogoutReqHandler,
} from 'handlers'

const BaseRoute = routeConfig.InternalRoute.Identity

export const load = (app: typeConfig.App) => {
  app.get(
    `${BaseRoute}/authorize-password`,
    async (c) => {
      const queryDto = await getAuthorizeReqHandler.parse(c)

      const {
        COMPANY_LOGO_URL: logoUrl,
        ENABLE_SIGN_UP: enableSignUp,
      } = env(c)

      const queryString = formatUtil.getQueryString(c)

      return c.html(<AuthorizePasswordView
        queryString={queryString}
        queryDto={queryDto}
        logoUrl={logoUrl}
        enableSignUp={enableSignUp}
      />)
    },
  )

  app.get(
    `${BaseRoute}/authorize-account`,
    async (c) => {
      const queryDto = await getAuthorizeReqHandler.parse(c)

      const {
        COMPANY_LOGO_URL: logoUrl,
        ENABLE_NAMES: enableNames,
        NAMES_IS_REQUIRED: namesIsRequired,
      } = env(c)

      const queryString = formatUtil.getQueryString(c)

      return c.html(<AuthorizeAccountView
        queryString={queryString}
        queryDto={queryDto}
        logoUrl={logoUrl}
        enableNames={enableNames}
        namesIsRequired={namesIsRequired}
      />)
    },
  )

  app.get(
    `${BaseRoute}/authorize-consent`,
    async (c) => {
      const queryDto = await getAuthorizeReqHandler.parseConsent(c)

      const authInfo = await jwtService.getAuthCodeBody(
        c,
        queryDto.code,
      )

      const app = await appService.verifySPAClientRequest(
        c.env.DB,
        authInfo.request.clientId,
        queryDto.redirectUri,
      )

      const { COMPANY_LOGO_URL: logoUrl } = env(c)

      return c.html(<AuthorizeConsentView
        logoUrl={logoUrl}
        scopes={authInfo.request.scopes}
        appName={app.name}
        queryDto={queryDto}
      />)
    },
  )

  app.post(
    `${BaseRoute}/authorize-account`,
    csrfMiddleware.oAuthAuthorize,
    async (c) => {
      const {
        NAMES_IS_REQUIRED: namesIsRequired,
        ENABLE_SIGN_UP: enableSignUp,
      } = env(c)
      if (!enableSignUp) throw new errorConfig.UnAuthorized()

      const bodyDto = await postAuthorizeReqHandler.parseAccount(
        c,
        namesIsRequired,
      )

      const app = await appService.verifySPAClientRequest(
        c.env.DB,
        bodyDto.clientId,
        bodyDto.redirectUri,
      )

      const password = await cryptoUtil.sha256(bodyDto.password)
      const user = await userService.createAccountWithPassword(
        c.env.DB,
        bodyDto.email,
        password,
        bodyDto.firstName,
        bodyDto.lastName,
      )

      await emailService.sendEmailVerificationEmail(
        c,
        user,
      )

      const { authCode } = await jwtService.genAuthCode(
        c,
        timeUtil.getCurrentTimestamp(),
        app.id,
        new oauthDto.GetAuthorizeReqQueryDto(bodyDto),
        user,
      )

      const requireConsent = await consentService.shouldCollectConsent(
        c,
        user.id,
        app.id,
      )

      return c.json({
        code: authCode,
        redirectUri: bodyDto.redirectUri,
        state: bodyDto.state,
        scopes: bodyDto.scopes,
        requireConsent,
      })
    },
  )

  app.post(
    `${BaseRoute}/authorize-password`,
    csrfMiddleware.oAuthAuthorize,
    async (c) => {
      const bodyDto = await postAuthorizeReqHandler.parsePassword(c)

      const app = await appService.verifySPAClientRequest(
        c.env.DB,
        bodyDto.clientId,
        bodyDto.redirectUri,
      )

      const password = await cryptoUtil.sha256(bodyDto.password)
      const user = await userService.verifyPasswordSignIn(
        c.env.DB,
        bodyDto.email,
        password,
      )

      const request = new oauthDto.GetAuthorizeReqQueryDto(bodyDto)
      const { authCode } = await jwtService.genAuthCode(
        c,
        timeUtil.getCurrentTimestamp(),
        app.id,
        request,
        user,
      )

      const requireConsent = await consentService.shouldCollectConsent(
        c,
        user.id,
        app.id,
      )

      if (!requireConsent) {
        sessionService.setAuthInfoSession(
          c,
          app.id,
          user,
          request,
        )
      }

      return c.json({
        code: authCode,
        redirectUri: bodyDto.redirectUri,
        state: bodyDto.state,
        scopes: bodyDto.scopes,
        requireConsent,
      })
    },
  )

  app.post(
    `${BaseRoute}/authorize-consent`,
    csrfMiddleware.oAuthAuthorize,
    async (c) => {
      const bodyDto = await postAuthorizeReqHandler.parseConsent(c)

      const authInfo = await jwtService.getAuthCodeBody(
        c,
        bodyDto.code,
      )

      const userId = authInfo.user.id
      const appId = authInfo.appId
      await consentService.createUserAppConsent(
        c.env.DB,
        userId,
        appId,
      )

      return c.json({
        code: bodyDto.code,
        redirectUri: bodyDto.redirectUri,
        state: bodyDto.state,
      })
    },
  )

  app.post(
    `${BaseRoute}/logout`,
    accessTokenMiddleware.spa,
    async (c) => {
      const bodyDto = await postLogoutReqHandler.parse(c)

      const accessTokenBody = c.get('access_token_body')!
      const refreshTokenBody = await jwtService.getRefreshTokenBody(
        c,
        bodyDto.refreshToken,
      )
      if (accessTokenBody.sub !== refreshTokenBody.sub) {
        throw new errorConfig.Forbidden(localeConfig.Error.WrongRefreshToken)
      }

      await kvService.invalidRefreshToken(
        c.env.KV,
        bodyDto.refreshToken,
      )

      const { AUTH_SERVER_URL } = env(c)
      const redirectUri = `${formatUtil.stripEndingSlash(AUTH_SERVER_URL)}${routeConfig.InternalRoute.OAuth}/logout`

      return c.json({
        message: localeConfig.Message.LogoutSuccess,
        redirectUri:
          `${redirectUri}?post_logout_redirect_uri=${bodyDto.postLogoutRedirectUri}&client_id=${refreshTokenBody.azp}`,
      })
    },
  )
}
