import { Context } from 'hono'
import { env } from 'hono/adapter'
import { genRandomString } from '@melody-auth/shared'
import { typeConfig } from 'configs'
import {
  appService, kvService, mfaService, scopeService,
} from 'services'
import { oauthDto } from 'dtos'
import { validateUtil } from 'utils'

export const initiate = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()
  const queryDto = new oauthDto.CoreAuthorizeDto(reqBody)
  await validateUtil.dto(queryDto)

  const app = await appService.verifySPAClientRequest(
    c,
    queryDto.clientId,
    queryDto.redirectUri,
  )

  const validScopes = await scopeService.verifyAppScopes(
    c,
    app.id,
    queryDto.scopes,
  )

  const { AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn } = env(c)
  const mfaConfig = mfaService.getAppMfaConfig(app)

  const sessionId = genRandomString(128)
  const embeddedSessionBody: typeConfig.EmbeddedSessionBody = {
    appId: app.id,
    appName: app.name,
    request: {
      ...queryDto,
      scopes: validScopes,
    },
    mfa: mfaConfig ? mfaService.getAuthCodeBodyMfaConfig(mfaConfig) : undefined,
  }
  await kvService.storeEmbeddedSession(
    c.env.KV,
    sessionId,
    embeddedSessionBody,
    codeExpiresIn,
  )

  return c.json({ sessionId })
}
