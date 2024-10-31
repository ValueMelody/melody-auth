import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  routeConfig, typeConfig,
} from 'configs'
import { identityDto } from 'dtos'
import {
  kvService, userService,
} from 'services'
import { validateUtil } from 'utils'
import { ChangePassword } from 'views'

export const getChangePassword = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authInfo) return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${queryDto.locale}`)

  const {
    COMPANY_LOGO_URL: logoUrl,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  return c.html(<ChangePassword
    redirectUri={authInfo.request.redirectUri}
    logoUrl={logoUrl}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
  />)
}

export const postChangePassword = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostChangePasswordReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authInfo) return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${bodyDto.locale}`)

  await userService.changeUserPassword(
    c,
    authInfo.user,
    bodyDto,
  )

  return c.json({ success: true })
}
