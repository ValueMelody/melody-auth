import {
  useContext, useEffect,
  useRef,
} from 'react'
import { loadCodeAndStateFromUrl } from 'web-sdk'
import { useAuth } from './useAuth'
import authContext, { AuthContext } from './context'
import { handleTokenExchangeByAuthCode } from './utils'

const Setup = () => {
  const { acquireToken } = useAuth()
  const context = useContext<AuthContext>(authContext)
  const {
    state, dispatch,
  } = context

  const initialized = useRef(false)

  useEffect(
    () => {
      const searchString = window.location.search.substring(1)
      const paramsString = searchString.split('&')
      const params = searchString
        ? paramsString.reduce(
          (
            params, paramString,
          ) => {
            const [key, value] = paramString.split('=')
            return {
              ...params,
              [key]: value,
            }
          },
          {} as { [key: string]: string },
        )
        : {}

      const containCode = 'code' in params && !!params.code

      if (initialized.current) return

      if (containCode || state.checkedStorage) initialized.current = true

      if (state.accessTokenStorage) return

      if (!containCode && state.refreshTokenStorage && !state.accessTokenStorage) {
        acquireToken()
        return
      }

      if (containCode || state.checkedStorage) {
        const {
          code, state: requestState,
        } = loadCodeAndStateFromUrl()
        handleTokenExchangeByAuthCode(
          code,
          requestState,
          state.config,
          dispatch,
          'locale' in params ? params.locale : undefined,
        )
      }
    },
    [dispatch, state.checkedStorage, state.accessTokenStorage, state.config, acquireToken, state.refreshTokenStorage],
  )

  return null
}

export default Setup
