import { env } from 'hono/adapter'
import { Context } from 'hono'
import {
  GetUserInfo, PostTokenByAuthCode, PostTokenByRefreshToken,
} from '../../../global'
import {
  errorConfig, localeConfig, routeConfig, typeConfig,
} from 'configs'
import { oauthDto } from 'dtos'
import {
  appService,
  jwtService, kvService, userService,
} from 'services'
import {
  cryptoUtil, timeUtil, validateUtil,
} from 'utils'
import AuthorizePassword from 'views/AuthorizePassword'
import { authMiddleware } from 'middlewares'
import { Forbidden } from 'configs/error'
import AuthorizeAccount from 'views/AuthorizeAccount'

const BaseRoute = routeConfig.InternalRoute.OAuth

const getAuthorizeGuard = async (c: Context<typeConfig.Context>) => {
  const queryDto = new oauthDto.GetAuthorizeReqQueryDto({
    clientId: c.req.query('client_id') ?? '',
    redirectUri: c.req.query('redirect_uri') ?? '',
    responseType: c.req.query('response_type') ?? '',
    state: c.req.query('state') ?? '',
    codeChallenge: c.req.query('code_challenge') ?? '',
    codeChallengeMethod: c.req.query('code_challenge_method') ?? '',
    scope: c.req.queries('scope') ?? [],
  })
  await validateUtil.dto(queryDto)

  await appService.verifyClientRequest(
    c.env.DB,
    queryDto.clientId,
    queryDto.redirectUri,
  )

  return queryDto
}

const getQueryString = (c: Context<typeConfig.Context>) => c.req.url.split('?')[1]

export const load = (app: typeConfig.App) => {
  app.get(
    `${BaseRoute}/authorize`,
    async (c) => {
      const queryDto = await getAuthorizeGuard(c)

      const {
        COMPANY_LOGO_URL: logoUrl,
        ENABLE_SIGN_UP: enableSignUp,
      } = env(c)

      const queryString = getQueryString(c)

      return c.html(<AuthorizePassword
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

      const queryString = getQueryString(c)

      return c.html(<AuthorizeAccount
        queryString={queryString}
        queryDto={queryDto}
        logoUrl={logoUrl}
        enableNames={enableNames}
        namesIsRequired={namesIsRequired}
      />)
    },
  )

  app.post(
    `${BaseRoute}/authorize-account`,
    async (c) => {
      const reqBody = await c.req.json()
      const { NAMES_IS_REQUIRED: namesIsRequired } = env(c)
      const bodyDto = namesIsRequired
        ? new oauthDto.PostAuthorizeReqBodyWithRequiredNamesDto(reqBody)
        : new oauthDto.PostAuthorizeReqBodyWithNamesDto(reqBody)
      await validateUtil.dto(bodyDto)

      await appService.verifyClientRequest(
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

      const { authCode } = await jwtService.genAuthCode(
        c,
        timeUtil.getCurrentTimestamp(),
        new oauthDto.GetAuthorizeReqQueryDto(bodyDto),
        user,
      )

      return c.json({
        code: authCode, redirectUri: bodyDto.redirectUri, state: bodyDto.state,
      })
    },
  )

  app.post(
    `${BaseRoute}/authorize-password`,
    async (c) => {
      const reqBody = await c.req.json()
      const bodyDto = new oauthDto.PostAuthorizeReqBodyWithPasswordDto(reqBody)
      await validateUtil.dto(bodyDto)

      await appService.verifyClientRequest(
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

      const { authCode } = await jwtService.genAuthCode(
        c,
        timeUtil.getCurrentTimestamp(),
        new oauthDto.GetAuthorizeReqQueryDto(bodyDto),
        user,
      )

      return c.json({
        code: authCode, redirectUri: bodyDto.redirectUri, state: bodyDto.state,
      })
    },
  )

  app.post(
    `${BaseRoute}/token`,
    async (c) => {
      const reqBody = await c.req.parseBody()

      const grantType = String(reqBody.grant_type).toLowerCase()

      if (
        grantType !== oauthDto.TokenGrantType.AuthorizationCode &&
        grantType !== oauthDto.TokenGrantType.RefreshToken
      ) {
        throw new errorConfig.Forbidden(localeConfig.Error.WrongGrantType)
      }

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

        const currentTimestamp = timeUtil.getCurrentTimestamp()
        const oauthId = authInfo.user.oauthId
        const scope = authInfo.request.scope

        const {
          accessToken,
          accessTokenExpiresIn,
          accessTokenExpiresAt,
        } = await jwtService.genAccessToken(
          c,
          currentTimestamp,
          oauthId,
          scope,
        )

        const result: PostTokenByAuthCode = {
          access_token: accessToken,
          expires_in: accessTokenExpiresIn,
          expires_on: accessTokenExpiresAt,
          not_before: currentTimestamp,
          token_type: 'Bearer',
          scope: authInfo.request.scope,
        }

        if (authInfo.request.scope.includes(typeConfig.Scope.OfflineAccess)) {
          const {
            refreshToken,
            refreshTokenExpiresIn,
            refreshTokenExpiresAt,
          } = await jwtService.genRefreshToken(
            c,
            currentTimestamp,
            oauthId,
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

        if (authInfo.request.scope.includes(typeConfig.Scope.OpenId)) {
          const { idToken } = await jwtService.genIdToken(
            c,
            currentTimestamp,
            authInfo.request.clientId,
            oauthId,
            authInfo.user.email,
          )
          result.id_token = idToken
        }

        return c.json(result)
      } else {
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

        const currentTimestamp = timeUtil.getCurrentTimestamp()
        const {
          accessToken,
          accessTokenExpiresIn,
          accessTokenExpiresAt,
        } = await jwtService.genAccessToken(
          c,
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
      }
    },
  )

  app.post(
    `${BaseRoute}/logout`,
    authMiddleware.accessToken,
    async (c) => {
      const accessTokenBody = c.get('AccessTokenBody')
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
        throw new Forbidden(localeConfig.Error.WrongRefreshToken)
      }

      await kvService.invalidRefreshToken(
        c.env.KV,
        bodyDto.refreshToken,
      )

      return c.json({
        message: localeConfig.Message.LogoutSuccess,
        postLogoutRedirectUri: bodyDto.postLogoutRedirectUri,
      })
    },
  )

  app.get(
    `${BaseRoute}/userinfo`,
    authMiddleware.accessToken,
    async (c) => {
      const accessTokenBody = c.get('AccessTokenBody')
      if (!accessTokenBody) throw new errorConfig.Forbidden()

      const user = await userService.getUserInfo(
        c.env.DB,
        accessTokenBody.sub,
      )

      const result: GetUserInfo = {
        oauthId: user.oauthId,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }

      return c.json(result)
    },
  )
}
