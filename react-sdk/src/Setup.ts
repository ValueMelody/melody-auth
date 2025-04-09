import {
  useContext, useEffect,
  useRef,
} from 'react'
import { loadCodeAndStateFromUrl } from '@melody-auth/web'
import { getParams } from 'shared'
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
      const params = getParams()
      const containCode = 'code' in params && !!params.code

      if (initialized.current) return

      if (containCode || state.checkedStorage) initialized.current = true

      if (state.accessTokenStorage) return

      if (!containCode && state.refreshTokenStorage && !state.accessTokenStorage) {
        acquireToken()
        return
      }

      if (!state.authenticationError && (containCode || state.checkedStorage)) {
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
    [
      dispatch,
      state.checkedStorage,
      state.accessTokenStorage,
      state.config,
      acquireToken,
      state.refreshTokenStorage,
      state.authenticationError,
    ],
  )

  return null
}

export default Setup
