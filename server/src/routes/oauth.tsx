import { env } from 'hono/adapter'
import { Context } from 'hono'
import {
  GetUserInfo, PostTokenByAuthCode, PostTokenByClientCredentials, PostTokenByRefreshToken,
} from '../../../global'
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
  cryptoUtil, formatUtil, timeUtil, validateUtil,
} from 'utils'
import { authMiddleware } from 'middlewares'
import {
  AuthorizePasswordView, AuthorizeConsentView, AuthorizeAccountView,
} from 'templates'

const BaseRoute = routeConfig.InternalRoute.OAuth

const getAuthorizeGuard = async (c: Context<typeConfig.Context>) => {
  const queryDto = new oauthDto.GetAuthorizeReqQueryDto({
    clientId: c.req.query('client_id') ?? '',
    redirectUri: c.req.query('redirect_uri') ?? '',
    responseType: c.req.query('response_type') ?? '',
    state: c.req.query('state') ?? '',
    codeChallenge: c.req.query('code_challenge') ?? '',
    codeChallengeMethod: c.req.query('code_challenge_method') ?? '',
    scopes: c.req.query('scope')?.split(' ') ?? [],
  })
  await validateUtil.dto(queryDto)

  const app = await appService.verifySPAClientRequest(
    c.env.DB,
    queryDto.clientId,
    queryDto.redirectUri,
  )

  const validScopes = formatUtil.getValidScopes(
    queryDto.scopes,
    app,
  )

  return {
    ...queryDto,
    scopes: validScopes,
  }
}

export const load = (app: typeConfig.App) => {
  app.get(
    `${BaseRoute}/authorize`,
    async (c) => {
      const queryDto = await getAuthorizeGuard(c)

      const stored = sessionService.getAuthInfoSession(
        c,
        queryDto.clientId,
      )
      if (stored && stored.request.clientId === queryDto.clientId) {
        const { authCode } = await jwtService.genAuthCode(
          c,
          timeUtil.getCurrentTimestamp(),
          stored.appId,
          queryDto,
          stored.user,
        )

        const url = `${queryDto.redirectUri}?code=${authCode}&state=${queryDto.state}`
        return c.redirect(url)
      }

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
      const queryDto = await getAuthorizeGuard(c)

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
      const queryDto = new oauthDto.GetAuthorizeConsentReqQueryDto({
        state: c.req.query('state') ?? '',
        redirectUri: c.req.query('redirect_uri') ?? '',
        code: c.req.query('code') ?? '',
      })

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
    authMiddleware.authorizeCsrf,
    async (c) => {
      const {
        NAMES_IS_REQUIRED: namesIsRequired,
        ENABLE_SIGN_UP: enableSignUp,
      } = env(c)
      if (!enableSignUp) throw new errorConfig.UnAuthorized()

      const reqBody = await c.req.json()
      const bodyDto = namesIsRequired
        ? new oauthDto.PostAuthorizeReqBodyWithRequiredNamesDto(reqBody)
        : new oauthDto.PostAuthorizeReqBodyWithNamesDto(reqBody)
      await validateUtil.dto(bodyDto)

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
    authMiddleware.authorizeCsrf,
    async (c) => {
      const reqBody = await c.req.json()

      const bodyDto = new oauthDto.PostAuthorizeReqBodyWithPasswordDto(reqBody)
      await validateUtil.dto(bodyDto)

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
    authMiddleware.authorizeCsrf,
    async (c) => {
      const reqBody = await c.req.json()

      const bodyDto = new oauthDto.GetAuthorizeConsentReqQueryDto(reqBody)
      await validateUtil.dto(bodyDto)

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
    `${BaseRoute}/token`,
    async (c) => {
      const reqBody = await c.req.parseBody()

      const grantType = String(reqBody.grant_type).toLowerCase()
      const currentTimestamp = timeUtil.getCurrentTimestamp()

      if (grantType === oauthDto.TokenGrantType.AuthorizationCode) {
        const bodyDto = new oauthDto.PostTokenAuthCodeReqBodyDto({
          grantType: String(reqBody.grant_type),
          code: String(reqBody.code),
          codeVerifier: String(reqBody.code_verifier),
        })
        await validateUtil.dto(bodyDto)

        const authInfo = await jwtService.getAuthCodeBody(
          c,
          bodyDto.code,
        )

        const isValidChallenge = await cryptoUtil.isValidCodeChallenge(
          bodyDto.codeVerifier,
          authInfo.request.codeChallenge,
          authInfo.request.codeChallengeMethod,
        )
        if (!isValidChallenge) {
          throw new errorConfig.Forbidden(localeConfig.Error.WrongCodeVerifier)
        }

        const requireConsent = await consentService.shouldCollectConsent(
          c,
          authInfo.user.id,
          authInfo.appId,
        )
        if (requireConsent) throw new errorConfig.UnAuthorized(localeConfig.Error.NoConsent)

        const authId = authInfo.user.authId
        const scope = authInfo.request.scopes.join(' ')

        const {
          accessToken,
          accessTokenExpiresIn,
          accessTokenExpiresAt,
        } = await jwtService.genAccessToken(
          c,
          typeConfig.ClientType.SPA,
          currentTimestamp,
          authId,
          scope,
        )

        const result: PostTokenByAuthCode = {
          access_token: accessToken,
          expires_in: accessTokenExpiresIn,
          expires_on: accessTokenExpiresAt,
          not_before: currentTimestamp,
          token_type: 'Bearer',
          scope: authInfo.request.scopes.join(' '),
        }

        if (authInfo.request.scopes.includes(typeConfig.Scope.OfflineAccess)) {
          const {
            refreshToken,
            refreshTokenExpiresIn,
            refreshTokenExpiresAt,
          } = await jwtService.genRefreshToken(
            c,
            currentTimestamp,
            authId,
            authInfo.request.clientId,
            scope,
          )
          result.refresh_token = refreshToken
          result.refresh_token_expires_in = refreshTokenExpiresIn
          result.refresh_token_expires_on = refreshTokenExpiresAt

          await kvService.storeRefreshToken(
            c.env.KV,
            refreshToken,
            refreshTokenExpiresIn,
          )
        }

        if (authInfo.request.scopes.includes(typeConfig.Scope.OpenId)) {
          const { idToken } = await jwtService.genIdToken(
            c,
            currentTimestamp,
            authInfo.request.clientId,
            authId,
            authInfo.user.email,
          )
          result.id_token = idToken
        }

        return c.json(result)
      } else if (grantType === oauthDto.TokenGrantType.RefreshToken) {
        const bodyDto = new oauthDto.PostTokenRefreshTokenReqBodyDto({
          grantType: String(reqBody.grant_type),
          refreshToken: String(reqBody.refresh_token),
        })
        await validateUtil.dto(bodyDto)

        await kvService.validateRefreshToken(
          c.env.KV,
          bodyDto.refreshToken,
        )

        const refreshTokenBody = await jwtService.getRefreshTokenBody(
          c,
          bodyDto.refreshToken,
        )

        const {
          accessToken,
          accessTokenExpiresIn,
          accessTokenExpiresAt,
        } = await jwtService.genAccessToken(
          c,
          typeConfig.ClientType.SPA,
          currentTimestamp,
          refreshTokenBody.sub,
          refreshTokenBody.scope,
        )

        const result: PostTokenByRefreshToken = {
          access_token: accessToken,
          expires_in: accessTokenExpiresIn,
          expires_on: accessTokenExpiresAt,
          token_type: 'Bearer',
        }

        return c.json(result)
      } else if (grantType === oauthDto.TokenGrantType.ClientCredentials) {
        const bodyDto = new oauthDto.PostTokenClientCredentialsReqBodyDto({
          grantType: String(reqBody.grant_type),
          clientId: String(reqBody.client_id),
          secret: String(reqBody.client_secret),
          scopes: reqBody.scope ? String(reqBody.scope).split(',') : [],
        })
        await validateUtil.dto(bodyDto)

        const app = await appService.verifyS2SClientRequest(
          c.env.DB,
          bodyDto.clientId,
          bodyDto.secret,
        )

        const validScopes = formatUtil.getValidScopes(
          bodyDto.scopes,
          app,
        )

        const {
          accessToken,
          accessTokenExpiresIn,
          accessTokenExpiresAt,
        } = await jwtService.genAccessToken(
          c,
          typeConfig.ClientType.S2S,
          currentTimestamp,
          bodyDto.clientId,
          validScopes.join(' '),
        )

        const result: PostTokenByClientCredentials = {
          access_token: accessToken,
          expires_in: accessTokenExpiresIn,
          expires_on: accessTokenExpiresAt,
          token_type: 'Bearer',
          scope: validScopes.join(' '),
        }

        return c.json(result)
      } else {
        throw new errorConfig.Forbidden(localeConfig.Error.WrongGrantType)
      }
    },
  )

  app.post(
    `${BaseRoute}/logout`,
    authMiddleware.spaAccessToken,
    async (c) => {
      const accessTokenBody = c.get('access_token_body')
      if (!accessTokenBody) throw new errorConfig.Forbidden()

      const reqBody = await c.req.parseBody()
      const bodyDto = new oauthDto.PostLogoutReqBodyDto({
        refreshToken: String(reqBody.refresh_token),
        postLogoutRedirectUri: reqBody.post_logout_redirect_uri
          ? String(reqBody.post_logout_redirect_uri)
          : '',
      })
      await validateUtil.dto(bodyDto)

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
      const redirectUri = `${formatUtil.stripEndingSlash(AUTH_SERVER_URL)}${BaseRoute}/logout`

      return c.json({
        message: localeConfig.Message.LogoutSuccess,
        redirectUri:
          `${redirectUri}?post_logout_redirect_uri=${bodyDto.postLogoutRedirectUri}&client_id=${refreshTokenBody.azp}`,
      })
    },
  )

  app.get(
    `${BaseRoute}/logout`,
    async (c) => {
      const postLogoutRedirectUri = c.req.query('post_logout_redirect_uri')
      const clientId = c.req.query('client_id')

      if (!postLogoutRedirectUri || !clientId) throw new errorConfig.Forbidden()

      sessionService.removeAuthInfoSession(
        c,
        clientId,
      )

      return c.redirect(postLogoutRedirectUri)
    },
  )

  app.get(
    `${BaseRoute}/userinfo`,
    authMiddleware.spaAccessToken,
    async (c) => {
      const accessTokenBody = c.get('access_token_body')
      if (!accessTokenBody) throw new errorConfig.Forbidden()
      if (!accessTokenBody.scope.includes(typeConfig.Scope.Profile)) {
        throw new errorConfig.UnAuthorized(localeConfig.Error.WrongScope)
      }

      const user = await userService.getUserInfo(
        c.env.DB,
        accessTokenBody.sub,
      )

      const result: GetUserInfo = {
        authId: user.authId,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }

      const { ENABLE_NAMES: enableNames } = env(c)
      if (enableNames) {
        result.firstName = user.firstName
        result.lastName = user.lastName
      }

      return c.json(result)
    },
  )
}
