import { Context } from 'hono'
import { typeConfig } from 'configs'
import {
  identityDto, oauthDto,
} from 'dtos'
import { validateUtil } from 'utils'

export const parsePost = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.parseBody()
  const bodyDto = new identityDto.PostLogoutReqBodyDto({
    refreshToken: String(reqBody.refresh_token),
    postLogoutRedirectUri: reqBody.post_logout_redirect_uri
      ? String(reqBody.post_logout_redirect_uri)
      : '',
  })
  await validateUtil.dto(bodyDto)
  return bodyDto
}

export const parseGet = async (c: Context<typeConfig.Context>) => {
  const queryDto = new oauthDto.GetLogoutReqBodyDto({
    clientId: c.req.query('client_id') ?? '',
    postLogoutRedirectUri: c.req.query('post_logout_redirect_uri') ?? '',
  })

  await validateUtil.dto(queryDto)
  return queryDto
}
