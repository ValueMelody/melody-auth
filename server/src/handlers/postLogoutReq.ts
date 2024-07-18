import { Context } from 'hono'
import { typeConfig } from 'configs'
import { identityDto } from 'dtos'
import { validateUtil } from 'utils'

export const parse = async (c: Context<typeConfig.Context>) => {
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
