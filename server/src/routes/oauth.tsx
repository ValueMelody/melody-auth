import {
  sign, verify,
} from 'hono/jwt'
import { JWTPayload } from 'hono/utils/jwt/types'
import { env } from 'hono/adapter'
import {
  errorConfig, kvConfig, localeConfig, routeConfig, typeConfig,
} from 'configs'
import { oauthDto } from 'dtos'
import { oauthService } from 'services'
import {
  cryptoUtil, validateUtil,
} from 'utils'
import AuthorizePassword from 'views/AuthorizePassword'
import {
  AuthorizeCodeChallengeMethod, GetAuthorizeReqQueryDto,
} from 'dtos/oauth'

const BaseRoute = routeConfig.InternalRoute.OAuth

export const load = (app: typeConfig.App) => {
  app.get(
    `${BaseRoute}/authorize`,
    async (c) => {
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

      await oauthService.getAppEntity(
        c.env.DB,
        queryDto.clientId,
        queryDto.redirectUri,
      )

      return c.html(<AuthorizePassword queryDto={queryDto} />)
    },
  )

  app.post(
    `${BaseRoute}/authorize-password`,
    async (c) => {
      const reqBody = await c.req.json()
      const bodyDto = new oauthDto.PostAuthorizeReqBodyWithPasswordDto(reqBody)
      await validateUtil.dto(bodyDto)

      await oauthService.getAppEntity(
        c.env.DB,
        bodyDto.clientId,
        bodyDto.redirectUri,
      )

      const password = await cryptoUtil.sha256(bodyDto.password)
      const user = await oauthService.getUserEntityByEmailAndPassword(
        c.env.DB,
        bodyDto.email,
        password,
      )

      const { AUTHORIZATION_CODE_EXPIRES_IN } = env(c)
      const codeExpiresIn = Number(AUTHORIZATION_CODE_EXPIRES_IN)
      const authBody: typeConfig.AuthCodeBody = {
        request: new GetAuthorizeReqQueryDto(bodyDto),
        user: {
          oauthId: user.oauthId,
          email: user.email,
        },
        exp: Math.floor(Date.now() / 1000) + codeExpiresIn,
      }

      const code = await sign(
        authBody as unknown as JWTPayload,
        c.env.AUTHORIZATION_CODE_JWT_SECRET,
      )

      return c.json({
        code, redirectUri: bodyDto.redirectUri, state: bodyDto.state,
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

        let authInfo: typeConfig.AuthCodeBody
        try {
          authInfo = await verify(
            bodyDto.code,
            c.env.AUTHORIZATION_CODE_JWT_SECRET,
          ) as unknown as typeConfig.AuthCodeBody
        } catch (e) {
          throw new errorConfig.Forbidden(localeConfig.Error.WrongCode)
        }

        if (authInfo.request.codeChallengeMethod === AuthorizeCodeChallengeMethod.Plain) {
          if (bodyDto.codeVerifier !== authInfo.request.codeChallenge) {
            throw new errorConfig.Forbidden(localeConfig.Error.WrongCodeVerifier)
          }
        } else {
          const calculatedValue = await cryptoUtil.genCodeChallenger(bodyDto.codeVerifier)
          if (authInfo.request.codeChallenge !== calculatedValue) {
            throw new errorConfig.Forbidden(localeConfig.Error.WrongCodeVerifier)
          }
        }

        const currentTimestamp = Math.floor(Date.now() / 1000)

        const { ACCESS_TOKEN_EXPIRES_IN } = env(c)
        const accessTokenExpiresIn = Number(ACCESS_TOKEN_EXPIRES_IN)
        const accessTokenExpiresAt = currentTimestamp + accessTokenExpiresIn
        const accessTokenBody: typeConfig.AccessTokenBody = {
          sub: authInfo.user.oauthId,
          scope: authInfo.request.scope,
          exp: accessTokenExpiresAt,
        }
        const accessToken = await sign(
          accessTokenBody as unknown as JWTPayload,
          c.env.ACCESS_TOKEN_JWT_SECRET,
        )

        const result: { [key: string]: string | number | string[] } = {
          access_token: accessToken,
          expires_in: accessTokenExpiresIn,
          expires_on: accessTokenExpiresAt,
          not_before: currentTimestamp,
          token_type: 'Bearer',
          scope: authInfo.request.scope,
        }

        if (authInfo.request.scope.includes(typeConfig.Scope.OfflineAccess)) {
          const { REFRESH_TOKEN_EXPIRES_IN } = env(c)
          const refreshTokenExpiresIn = Number(REFRESH_TOKEN_EXPIRES_IN)
          const refreshTokenExpiresAt = currentTimestamp + refreshTokenExpiresIn
          const refreshTokenBody: typeConfig.RefreshTokenBody = {
            sub: authInfo.user.oauthId,
            scope: authInfo.request.scope,
            exp: refreshTokenExpiresAt,
          }

          const refreshToken = await sign(
            refreshTokenBody as unknown as JWTPayload,
            c.env.REFRESH_TOKEN_JWT_SECRET,
          )
          result.refresh_token = refreshToken
          result.refresh_token_expires_in = refreshTokenExpiresIn
          result.refresh_token_expires_on = refreshTokenExpiresAt

          await c.env.KV.put(
            `${kvConfig.BaseKey.RefreshToken}-${refreshToken}`,
            '1',
            { expirationTtl: refreshTokenExpiresIn },
          )
        }

        let idToken = ''
        if (authInfo.request.scope.includes(typeConfig.Scope.OpenId)) {
          const { ID_TOKEN_EXPIRES_IN } = env(c)
          const idTokenExpiresIn = Number(ID_TOKEN_EXPIRES_IN)
          const idTokenExpiresAt = currentTimestamp + idTokenExpiresIn
          idToken = await sign(
            {
              iss: 'Melody Oauth',
              sub: authInfo.user.oauthId,
              aud: authInfo.request.clientId,
              exp: idTokenExpiresAt,
              iat: currentTimestamp,
              email: authInfo.user.email,
            },
            c.env.REFRESH_TOKEN_JWT_SECRET,
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

        const tokenInKv = await c.env.KV.get(`${kvConfig.BaseKey.RefreshToken}-${bodyDto.refreshToken}`)
        if (!tokenInKv) throw new errorConfig.Forbidden(localeConfig.Error.WrongRefreshToken)

        let refreshTokenBody: typeConfig.RefreshTokenBody
        try {
          refreshTokenBody = await verify(
            bodyDto.refreshToken,
            c.env.REFRESH_TOKEN_JWT_SECRET,
          ) as unknown as typeConfig.RefreshTokenBody
        } catch (e) {
          throw new errorConfig.Forbidden(localeConfig.Error.WrongRefreshToken)
        }

        const { ACCESS_TOKEN_EXPIRES_IN } = env(c)
        const currentTimestamp = Math.floor(Date.now() / 1000)
        const accessTokenExpiresIn = Number(ACCESS_TOKEN_EXPIRES_IN)
        const accessTokenExpiresAt = currentTimestamp + accessTokenExpiresIn
        const accessTokenBody: typeConfig.AccessTokenBody = {
          sub: refreshTokenBody.sub,
          scope: refreshTokenBody.scope,
          exp: accessTokenExpiresAt,
        }
        const accessToken = await sign(
          accessTokenBody as unknown as JWTPayload,
          c.env.ACCESS_TOKEN_JWT_SECRET,
        )

        return c.json({
          access_token: accessToken,
          expires_in: accessTokenExpiresIn,
          expires_on: accessTokenExpiresAt,
          token_type: 'Bearer',
        })
      }
    },
  )
}
