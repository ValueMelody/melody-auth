import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  errorConfig, messageConfig, typeConfig,
} from 'configs'
import {
  kvService, userService,
} from 'services'
import { loggerUtil } from 'utils'

export const getRecoveryCodeEnrollmentInfo = async (
  c: Context<typeConfig.Context>,
  authCode: string,
  authCodeStore: typeConfig.AuthCodeBody,
) => {
  if (authCodeStore.user.recoveryCodeHash) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.RecoveryCodeAlreadySet,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.RecoveryCodeAlreadySet)
  }

  const {
    recoveryCode, user,
  } = await userService.genUserRecoveryCode(
    c,
    authCodeStore.user.id,
  )

  const { AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn } = env(c)
  const newAuthCodeStore = {
    ...authCodeStore,
    user,
  }
  await kvService.storeAuthCode(
    c.env.KV,
    authCode,
    newAuthCodeStore,
    codeExpiresIn,
  )

  return recoveryCode
}
