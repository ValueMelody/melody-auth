import { Context } from 'hono'
import { typeConfig } from 'configs'
import {
  identityDto, oauthDto,
} from 'dtos'
import { appService } from 'services'
import {
  formatUtil, validateUtil,
} from 'utils'

export const parse = async (c: Context<typeConfig.Context>) => {
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
    c,
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

export const parseConsent = async (c: Context<typeConfig.Context>) => {
  const queryDto = new identityDto.GetAuthorizeConsentReqQueryDto({
    state: c.req.query('state') ?? '',
    redirectUri: c.req.query('redirect_uri') ?? '',
    code: c.req.query('code') ?? '',
  })
  await validateUtil.dto(queryDto)

  return queryDto
}
