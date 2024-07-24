import { env } from 'hono/adapter'
import {
  errorConfig, localeConfig, routeConfig, typeConfig,
} from 'configs'
import { oauthDto } from 'dtos'
import {
  appService,
  consentService,
  jwtService, kvService, sessionService, userService,
} from 'services'
import {
  formatUtil, timeUtil,
} from 'utils'
import {
  authMiddleware, configMiddleware,
} from 'middlewares'
import {
  AuthorizePasswordView, AuthorizeConsentView, AuthorizeAccountView,
  VerifyEmailView,
  AuthorizeResetView,
} from 'views'
import {
  identityValidator, oauthValidator,
} from 'validators'

const BaseRoute = routeConfig.InternalRoute.Identity

export const load = (app: typeConfig.App) => {
  app.get(
    `${BaseRoute}/authorize-password`,
    async (c) => {
      const queryDto = await oauthValidator.getAuthorize(c)

      const {
        COMPANY_LOGO_URL: logoUrl,
        ENABLE_SIGN_UP: enableSignUp,
        ENABLE_PASSWORD_RESET: enablePasswordReset,
        SENDGRID_API_KEY: sendgridKey,
        SENDGRID_SENDER_ADDRESS: sendgridSender,
      } = env(c)

      const allowPasswordReset = enablePasswordReset && !!sendgridKey && !!sendgridSender

      const queryString = formatUtil.getQueryString(c)

      return c.html(<AuthorizePasswordView
        queryString={queryString}
        queryDto={queryDto}
        logoUrl={logoUrl}
        enableSignUp={enableSignUp}
        enablePasswordReset={allowPasswordReset}
      />)
    },
  )

  app.get(
    `${BaseRoute}/authorize-reset`,
    configMiddleware.enablePasswordReset,
    async (c) => {
      const { COMPANY_LOGO_URL: logoUrl } = env(c)

      const queryString = formatUtil.getQueryString(c)

      return c.html(<AuthorizeResetView
        queryString={queryString}
        logoUrl={logoUrl}
      />)
    },
  )

  app.post(
    `${BaseRoute}/reset-code`,
    configMiddleware.serverUrl,
    configMiddleware.enablePasswordReset,
    async (c) => {
      const reqBody = await c.req.json()
      const email = String(reqBody.email)?.trim()
        .toLowerCase()
      if (!email) throw new errorConfig.Forbidden()

      await userService.sendPasswordReset(
        c,
        email,
      )
      return c.json({ success: true })
    },
  )

  app.post(
    `${BaseRoute}/authorize-reset`,
    configMiddleware.serverUrl,
    configMiddleware.enablePasswordReset,
    async (c) => {
      const bodyDto = await identityValidator.postAuthorizeReset(c)

      await userService.resetUserPassword(
        c,
        bodyDto,
      )

      return c.json({ success: true })
    },
  )

  app.get(
    `${BaseRoute}/authorize-account`,
    async (c) => {
      const queryDto = await oauthValidator.getAuthorize(c)

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
      const queryDto = await identityValidator.getAuthorizeConsent(c)

      const authInfo = await jwtService.getAuthCodeBody(
        c,
        queryDto.code,
      )

      const app = await appService.verifySPAClientRequest(
        c,
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
    configMiddleware.serverUrl,
    async (c) => {
      const {
        NAMES_IS_REQUIRED: namesIsRequired,
        ENABLE_SIGN_UP: enableSignUp,
      } = env(c)
      if (!enableSignUp) throw new errorConfig.UnAuthorized()

      const bodyDto = await identityValidator.postAuthorizeAccount(
        c,
        namesIsRequired,
      )

      const app = await appService.verifySPAClientRequest(
        c,
        bodyDto.clientId,
        bodyDto.redirectUri,
      )

      const user = await userService.createAccountWithPassword(
        c,
        bodyDto,
      )

      await userService.sendEmailVerification(
        c,
        user,
      )

      const { authCode } = await jwtService.genAuthCode(
        c,
        timeUtil.getCurrentTimestamp(),
        app.id,
        new oauthDto.GetAuthorizeReqDto(bodyDto),
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
    configMiddleware.serverUrl,
    async (c) => {
      const bodyDto = await identityValidator.postAuthorizePassword(c)

      const app = await appService.verifySPAClientRequest(
        c,
        bodyDto.clientId,
        bodyDto.redirectUri,
      )

      const user = await userService.verifyPasswordSignIn(
        c,
        bodyDto,
      )

      const request = new oauthDto.GetAuthorizeReqDto(bodyDto)
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
    configMiddleware.serverUrl,
    async (c) => {
      const bodyDto = await identityValidator.postAuthorizeConsent(c)

      const authInfo = await jwtService.getAuthCodeBody(
        c,
        bodyDto.code,
      )

      const userId = authInfo.user.id
      const appId = authInfo.appId
      await consentService.createUserAppConsent(
        c,
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
    authMiddleware.spa,
    async (c) => {
      const bodyDto = await identityValidator.postLogout(c)

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
        success: true,
        redirectUri:
          `${redirectUri}?post_logout_redirect_uri=${bodyDto.postLogoutRedirectUri}&client_id=${refreshTokenBody.azp}`,
      })
    },
  )

  app.get(
    `${BaseRoute}/verify-email`,
    configMiddleware.enableEmailVerification,
    async (c) => {
      const queryDto = await identityValidator.getVerifyEmail(c)

      const { COMPANY_LOGO_URL: logoUrl } = env(c)

      return c.html(<VerifyEmailView
        logoUrl={logoUrl}
        queryDto={queryDto}
      />)
    },
  )

  app.post(
    `${BaseRoute}/verify-email`,
    configMiddleware.enableEmailVerification,
    async (c) => {
      const bodyDto = await identityValidator.postVerifyEmail(c)

      await userService.verifyUserEmail(
        c,
        bodyDto,
      )

      return c.json({ success: true })
    },
  )
}
