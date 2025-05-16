import { Context } from 'hono'
import { env } from 'hono/adapter'
import { typeConfig } from 'configs'
import {
  baseDto, identityDto,
} from 'dtos'
import {
  identityService,
  kvService,
  userService,
} from 'services'
import {
  requestUtil, validateUtil,
} from 'utils'

export const postVerifyEmail = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostVerifyEmailDto({
    id: String(reqBody.id),
    code: String(reqBody.code),
  })
  await validateUtil.dto(bodyDto)

  await userService.verifyUserEmail(
    c,
    bodyDto,
  )

  return c.json({ success: true })
}

export const postResetPasswordCode = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new baseDto.ResetPasswordDto(reqBody)

  const email = bodyDto.email
  const locale = requestUtil.getLocaleFromQuery(
    c,
    reqBody.locale,
  )

  await identityService.processResetPassword(
    c,
    email,
    locale,
  )

  return c.json({ success: true })
}

export const postResetPassword = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostResetPasswordDto({
    email: String(reqBody.email),
    code: String(reqBody.code),
    password: String(reqBody.password),
  })
  await validateUtil.dto(bodyDto)

  await userService.resetUserPassword(
    c,
    bodyDto,
  )

  const { UNLOCK_ACCOUNT_VIA_PASSWORD_RESET: allowUnlock } = env(c)
  const ip = requestUtil.getRequestIP(c)
  if (allowUnlock) {
    await kvService.clearFailedLoginAttemptsByIP(
      c.env.KV,
      bodyDto.email,
      ip,
    )
  }

  return c.json({ success: true })
}
