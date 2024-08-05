import { Context } from 'hono'
import {
  errorConfig, localeConfig, typeConfig,
} from 'configs'
import {
  emailService, kvService, userService,
} from 'services'
import { userDto } from 'dtos'
import { validateUtil } from 'utils'

export const getUsers = async (c: Context<typeConfig.Context>) => {
  const users = await userService.getUsers(c)
  return c.json({ users })
}

export const getUser = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')
  const user = await userService.getUserByAuthId(
    c,
    authId,
  )
  return c.json({ user })
}

export const verifyEmail = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')
  const user = await userService.getUserByAuthId(
    c,
    authId,
  )

  if (user.emailVerified) throw new errorConfig.Forbidden(localeConfig.Error.EmailAlreadyVerified)

  const verificationCode = await emailService.sendEmailVerification(
    c,
    user,
  )
  if (verificationCode) {
    await kvService.storeEmailVerificationCode(
      c.env.KV,
      user.id,
      verificationCode,
    )
  }

  return c.json({ success: true })
}

export const putUser = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()
  const bodyDto = new userDto.PutUserReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authId = c.req.param('authId')

  const user = await userService.updateUser(
    c,
    authId,
    bodyDto,
  )
  return c.json({ user })
}

export const deleteUser = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')

  await userService.deleteUser(
    c,
    authId,
  )

  c.status(204)
  return c.body(null)
}
