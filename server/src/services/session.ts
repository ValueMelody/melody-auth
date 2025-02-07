import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  adapterConfig, typeConfig,
} from 'configs'
import { timeUtil } from 'utils'

export const setAuthInfoSession = (
  c: Context<typeConfig.Context>,
  authInfo: typeConfig.AuthCodeBody,
) => {
  const { SERVER_SESSION_EXPIRES_IN: sessionExpiresIn } = env(c)
  if (sessionExpiresIn) {
    const session = c.get('session')
    const key = adapterConfig.getAuthInfoSessionKeyByClientId(authInfo.request.clientId)
    session.set(
      key,
      {
        appId: authInfo.appId,
        appName: authInfo.appName,
        user: authInfo.user,
        request: authInfo.request,
        expiresOn: timeUtil.getCurrentTimestamp() + sessionExpiresIn,
      },
    )
  }
}

export const getAuthInfoSession = (
  c: Context<typeConfig.Context>, clientId: string,
) => {
  const { SERVER_SESSION_EXPIRES_IN: sessionExpiresIn } = env(c)
  if (sessionExpiresIn) {
    const session = c.get('session')
    const key = adapterConfig.getAuthInfoSessionKeyByClientId(clientId)
    const stored = session.get(key) as typeConfig.AuthCodeBody & {expiresOn: number} | null
    if (!stored || timeUtil.getCurrentTimestamp() > stored.expiresOn) return null

    return stored
  }
  return null
}

export const removeAuthInfoSession = (
  c: Context<typeConfig.Context>, clientId: string,
) => {
  const { SERVER_SESSION_EXPIRES_IN: sessionExpiresIn } = env(c)
  if (sessionExpiresIn) {
    const session = c.get('session')
    const key = adapterConfig.getAuthInfoSessionKeyByClientId(clientId)
    session.set(
      key,
      null,
    )
  }
}
