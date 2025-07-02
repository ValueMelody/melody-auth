import {
  Context, TypedResponse,
} from 'hono'
import {
  errorConfig, messageConfig, typeConfig,
} from 'configs'
import { identityDto } from 'dtos'
import {
  identityService, kvService, recoveryCodeService,
} from 'services'
import { getAuthCodeBody } from 'handlers/identity/mfa'
import {
  loggerUtil, validateUtil,
} from 'utils'

export interface GetProcessRecoveryCodeEnrollRes {
  recoveryCode: string;
}
export const getProcessRecoveryCodeEnroll = async (c: Context<typeConfig.Context>)
:Promise<TypedResponse<GetProcessRecoveryCodeEnrollRes>> => {
  const queryDto = await identityDto.parseGetProcess(c)

  const authCodeStore = await getAuthCodeBody(
    c,
    queryDto.code,
  )

  const recoveryCode = await recoveryCodeService.getRecoveryCodeEnrollmentInfo(
    c,
    queryDto.code,
    authCodeStore,
  )

  return c.json({ recoveryCode })
}

export const postProcessRecoveryCodeEnroll = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostProcessDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authCodeStore) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongAuthCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongAuthCode)
  }

  return c.json(await identityService.processPostAuthorize(
    c,
    identityService.AuthorizeStep.RecoveryCodeEnroll,
    bodyDto.code,
    authCodeStore,
  ))
}
